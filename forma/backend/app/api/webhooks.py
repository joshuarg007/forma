"""Webhooks and API Keys API"""
import secrets
import hashlib
import hmac
import json
import httpx
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Header
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, User, APIKey, Webhook, WebhookDelivery,
    WebhookEvent, WebhookDeliveryStatus
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}", tags=["webhooks"])
api_router = APIRouter(prefix="/api/v1", tags=["api-v1"])


# =============================================================================
# API KEY AUTHENTICATION
# =============================================================================

async def verify_api_key(
    db: Session,
    api_key: str
) -> tuple[APIKey, Project]:
    """Verify an API key and return the key and project."""
    if not api_key or not api_key.startswith("fk_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")

    key_hash = hash_api_key(api_key)

    key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True,
        APIKey.revoked_at == None
    ).first()

    if not key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Check expiration
    if key.expires_at and key.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API key expired")

    # Update last used
    key.last_used_at = datetime.utcnow()
    db.commit()

    project = db.query(Project).filter(Project.id == key.project_id).first()

    return key, project


def require_scope(scope: str):
    """Dependency factory for requiring a specific API key scope."""
    async def check_scope(
        x_api_key: str = Header(..., alias="X-API-Key"),
        db: Session = Depends(get_db)
    ):
        key, project = await verify_api_key(db, x_api_key)

        # Check scope
        if scope not in (key.scopes or []) and "*" not in (key.scopes or []):
            raise HTTPException(
                status_code=403,
                detail=f"API key missing required scope: {scope}"
            )

        return key, project

    return check_scope


async def get_api_key_auth(
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
):
    """Dependency for API key authentication (any valid key)."""
    return await verify_api_key(db, x_api_key)


# =============================================================================
# SCHEMAS
# =============================================================================

class APIKeyCreate(BaseModel):
    """Create a new API key."""
    name: str
    scopes: List[str] = []
    expires_in_days: Optional[int] = None


class APIKeyResponse(BaseModel):
    """API key response (without full key)."""
    id: str
    name: str
    key_prefix: str
    scopes: List[str]
    is_active: bool
    last_used_at: Optional[str]
    expires_at: Optional[str]
    created_at: str


class APIKeyCreatedResponse(APIKeyResponse):
    """Response when a new API key is created (includes full key once)."""
    key: str  # Full key - only shown once!


class WebhookCreate(BaseModel):
    """Create a new webhook."""
    name: str
    url: HttpUrl
    events: List[str]
    headers: dict = {}


class WebhookUpdate(BaseModel):
    """Update webhook settings."""
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    events: Optional[List[str]] = None
    headers: Optional[dict] = None
    is_active: Optional[bool] = None


class WebhookResponse(BaseModel):
    """Webhook response."""
    id: str
    name: str
    url: str
    events: List[str]
    is_active: bool
    is_verified: bool
    success_count: int
    failure_count: int
    last_triggered_at: Optional[str]
    created_at: str


class WebhookDeliveryResponse(BaseModel):
    """Webhook delivery log entry."""
    id: str
    event_type: str
    event_id: str
    status: str
    response_status: Optional[int]
    response_time_ms: Optional[int]
    error_message: Optional[str]
    attempt_number: int
    created_at: str
    completed_at: Optional[str]


# =============================================================================
# HELPERS
# =============================================================================

def generate_api_key() -> str:
    """Generate a secure API key."""
    return f"fk_{secrets.token_urlsafe(32)}"


def hash_api_key(key: str) -> str:
    """Hash an API key for storage."""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_webhook_secret() -> str:
    """Generate a webhook signing secret."""
    return f"whsec_{secrets.token_urlsafe(32)}"


def sign_webhook_payload(payload: str, secret: str) -> str:
    """Sign a webhook payload using HMAC-SHA256."""
    return hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()


async def verify_project_access(
    project_id: UUID,
    user: User,
    db: Session
) -> Project:
    """Verify user has access to project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check ownership or team membership
    if project.user_id != user.id:
        # Check team membership
        from app.db.models import ProjectMember
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()

        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")

    return project


# =============================================================================
# API KEY ENDPOINTS
# =============================================================================

@router.post("/api-keys", response_model=APIKeyCreatedResponse)
async def create_api_key(
    project_id: UUID,
    data: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new API key for the project."""
    project = await verify_project_access(project_id, current_user, db)

    # Generate key
    full_key = generate_api_key()
    key_prefix = full_key[:11]  # "fk_" + first 8 chars
    key_hash = hash_api_key(full_key)

    # Calculate expiration
    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)

    # Create API key
    api_key = APIKey(
        project_id=project_id,
        created_by_id=current_user.id,
        name=data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
        scopes=data.scopes,
        expires_at=expires_at
    )

    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return APIKeyCreatedResponse(
        id=str(api_key.id),
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        key=full_key,  # Only time we return the full key!
        scopes=api_key.scopes or [],
        is_active=api_key.is_active,
        last_used_at=None,
        expires_at=api_key.expires_at.isoformat() if api_key.expires_at else None,
        created_at=api_key.created_at.isoformat()
    )


@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all API keys for the project."""
    await verify_project_access(project_id, current_user, db)

    keys = db.query(APIKey).filter(
        APIKey.project_id == project_id,
        APIKey.revoked_at == None
    ).order_by(APIKey.created_at.desc()).all()

    return [
        APIKeyResponse(
            id=str(k.id),
            name=k.name,
            key_prefix=k.key_prefix,
            scopes=k.scopes or [],
            is_active=k.is_active,
            last_used_at=k.last_used_at.isoformat() if k.last_used_at else None,
            expires_at=k.expires_at.isoformat() if k.expires_at else None,
            created_at=k.created_at.isoformat()
        )
        for k in keys
    ]


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    project_id: UUID,
    key_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke an API key."""
    await verify_project_access(project_id, current_user, db)

    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.project_id == project_id
    ).first()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    api_key.revoked_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "API key revoked"}


# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================

@router.post("/webhooks", response_model=WebhookResponse)
async def create_webhook(
    project_id: UUID,
    data: WebhookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new webhook."""
    project = await verify_project_access(project_id, current_user, db)

    # Validate events
    valid_events = [e.value for e in WebhookEvent]
    for event in data.events:
        if event not in valid_events:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid event: {event}. Valid events: {valid_events}"
            )

    webhook = Webhook(
        project_id=project_id,
        created_by_id=current_user.id,
        name=data.name,
        url=str(data.url),
        secret=generate_webhook_secret(),
        events=data.events,
        headers=data.headers
    )

    db.add(webhook)
    db.commit()
    db.refresh(webhook)

    return WebhookResponse(
        id=str(webhook.id),
        name=webhook.name,
        url=webhook.url,
        events=webhook.events or [],
        is_active=webhook.is_active,
        is_verified=webhook.is_verified,
        success_count=webhook.success_count,
        failure_count=webhook.failure_count,
        last_triggered_at=webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None,
        created_at=webhook.created_at.isoformat()
    )


@router.get("/webhooks", response_model=List[WebhookResponse])
async def list_webhooks(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all webhooks for the project."""
    await verify_project_access(project_id, current_user, db)

    webhooks = db.query(Webhook).filter(
        Webhook.project_id == project_id
    ).order_by(Webhook.created_at.desc()).all()

    return [
        WebhookResponse(
            id=str(w.id),
            name=w.name,
            url=w.url,
            events=w.events or [],
            is_active=w.is_active,
            is_verified=w.is_verified,
            success_count=w.success_count,
            failure_count=w.failure_count,
            last_triggered_at=w.last_triggered_at.isoformat() if w.last_triggered_at else None,
            created_at=w.created_at.isoformat()
        )
        for w in webhooks
    ]


@router.get("/webhooks/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(
    project_id: UUID,
    webhook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get webhook details."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return WebhookResponse(
        id=str(webhook.id),
        name=webhook.name,
        url=webhook.url,
        events=webhook.events or [],
        is_active=webhook.is_active,
        is_verified=webhook.is_verified,
        success_count=webhook.success_count,
        failure_count=webhook.failure_count,
        last_triggered_at=webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None,
        created_at=webhook.created_at.isoformat()
    )


@router.get("/webhooks/{webhook_id}/secret")
async def get_webhook_secret(
    project_id: UUID,
    webhook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the webhook signing secret (for verification on receiving end)."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return {"secret": webhook.secret}


@router.put("/webhooks/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(
    project_id: UUID,
    webhook_id: UUID,
    data: WebhookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update webhook settings."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    # Validate events if provided
    if data.events is not None:
        valid_events = [e.value for e in WebhookEvent]
        for event in data.events:
            if event not in valid_events:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid event: {event}"
                )
        webhook.events = data.events

    if data.name is not None:
        webhook.name = data.name
    if data.url is not None:
        webhook.url = str(data.url)
        webhook.is_verified = False  # Re-verify on URL change
    if data.headers is not None:
        webhook.headers = data.headers
    if data.is_active is not None:
        webhook.is_active = data.is_active

    db.commit()
    db.refresh(webhook)

    return WebhookResponse(
        id=str(webhook.id),
        name=webhook.name,
        url=webhook.url,
        events=webhook.events or [],
        is_active=webhook.is_active,
        is_verified=webhook.is_verified,
        success_count=webhook.success_count,
        failure_count=webhook.failure_count,
        last_triggered_at=webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None,
        created_at=webhook.created_at.isoformat()
    )


@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    project_id: UUID,
    webhook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a webhook."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    db.delete(webhook)
    db.commit()

    return {"success": True, "message": "Webhook deleted"}


@router.post("/webhooks/{webhook_id}/test")
async def test_webhook(
    project_id: UUID,
    webhook_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test event to the webhook."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    # Create test payload
    test_payload = {
        "event": "test",
        "project_id": str(project_id),
        "timestamp": datetime.utcnow().isoformat(),
        "data": {
            "message": "This is a test webhook delivery from Forma"
        }
    }

    # Queue delivery
    background_tasks.add_task(
        deliver_webhook,
        webhook_id=webhook.id,
        event_type="test",
        payload=test_payload,
        db_url=str(db.get_bind().url)
    )

    return {"success": True, "message": "Test webhook queued for delivery"}


@router.get("/webhooks/{webhook_id}/deliveries", response_model=List[WebhookDeliveryResponse])
async def list_webhook_deliveries(
    project_id: UUID,
    webhook_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List recent webhook delivery attempts."""
    await verify_project_access(project_id, current_user, db)

    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.project_id == project_id
    ).first()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    deliveries = db.query(WebhookDelivery).filter(
        WebhookDelivery.webhook_id == webhook_id
    ).order_by(WebhookDelivery.created_at.desc()).offset(offset).limit(limit).all()

    return [
        WebhookDeliveryResponse(
            id=str(d.id),
            event_type=d.event_type,
            event_id=str(d.event_id),
            status=d.status.value,
            response_status=d.response_status,
            response_time_ms=d.response_time_ms,
            error_message=d.error_message,
            attempt_number=d.attempt_number,
            created_at=d.created_at.isoformat(),
            completed_at=d.completed_at.isoformat() if d.completed_at else None
        )
        for d in deliveries
    ]


@router.get("/webhooks/{webhook_id}/deliveries/{delivery_id}")
async def get_webhook_delivery(
    project_id: UUID,
    webhook_id: UUID,
    delivery_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a webhook delivery attempt."""
    await verify_project_access(project_id, current_user, db)

    delivery = db.query(WebhookDelivery).filter(
        WebhookDelivery.id == delivery_id,
        WebhookDelivery.webhook_id == webhook_id
    ).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    return {
        "id": str(delivery.id),
        "event_type": delivery.event_type,
        "event_id": str(delivery.event_id),
        "status": delivery.status.value,
        "request": {
            "url": delivery.request_url,
            "headers": delivery.request_headers,
            "body": delivery.request_body
        },
        "response": {
            "status": delivery.response_status,
            "headers": delivery.response_headers,
            "body": delivery.response_body,
            "time_ms": delivery.response_time_ms
        },
        "error_message": delivery.error_message,
        "attempt_number": delivery.attempt_number,
        "created_at": delivery.created_at.isoformat(),
        "completed_at": delivery.completed_at.isoformat() if delivery.completed_at else None
    }


@router.post("/webhooks/{webhook_id}/deliveries/{delivery_id}/retry")
async def retry_webhook_delivery(
    project_id: UUID,
    webhook_id: UUID,
    delivery_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually retry a failed webhook delivery."""
    await verify_project_access(project_id, current_user, db)

    delivery = db.query(WebhookDelivery).filter(
        WebhookDelivery.id == delivery_id,
        WebhookDelivery.webhook_id == webhook_id
    ).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if delivery.status == WebhookDeliveryStatus.SUCCESS:
        raise HTTPException(status_code=400, detail="Cannot retry successful delivery")

    # Re-queue delivery
    webhook = delivery.webhook
    payload = json.loads(delivery.request_body)

    background_tasks.add_task(
        deliver_webhook,
        webhook_id=webhook.id,
        event_type=delivery.event_type,
        payload=payload,
        db_url=str(db.get_bind().url),
        delivery_id=delivery.id
    )

    return {"success": True, "message": "Delivery queued for retry"}


# =============================================================================
# WEBHOOK DELIVERY FUNCTION
# =============================================================================

async def deliver_webhook(
    webhook_id: UUID,
    event_type: str,
    payload: dict,
    db_url: str,
    delivery_id: UUID = None
):
    """Deliver a webhook payload to the configured URL."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not webhook or not webhook.is_active:
            return

        # Get or create delivery record
        if delivery_id:
            delivery = db.query(WebhookDelivery).filter(
                WebhookDelivery.id == delivery_id
            ).first()
            delivery.attempt_number += 1
            delivery.status = WebhookDeliveryStatus.RETRYING
        else:
            delivery = WebhookDelivery(
                webhook_id=webhook_id,
                event_type=event_type,
                request_url=webhook.url,
                request_body=json.dumps(payload)
            )
            db.add(delivery)

        db.commit()

        # Prepare request
        payload_str = json.dumps(payload)
        signature = sign_webhook_payload(payload_str, webhook.secret)

        headers = {
            "Content-Type": "application/json",
            "X-Forma-Signature": f"sha256={signature}",
            "X-Forma-Event": event_type,
            "X-Forma-Delivery": str(delivery.event_id),
            **(webhook.headers or {})
        }

        delivery.request_headers = headers

        # Send request
        start_time = datetime.utcnow()

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    webhook.url,
                    content=payload_str,
                    headers=headers
                )

            end_time = datetime.utcnow()
            response_time = int((end_time - start_time).total_seconds() * 1000)

            delivery.response_status = response.status_code
            delivery.response_headers = dict(response.headers)
            delivery.response_body = response.text[:10000]  # Limit stored response
            delivery.response_time_ms = response_time
            delivery.completed_at = end_time

            if 200 <= response.status_code < 300:
                delivery.status = WebhookDeliveryStatus.SUCCESS
                webhook.success_count += 1
                webhook.last_success_at = end_time
                webhook.is_verified = True
            else:
                delivery.status = WebhookDeliveryStatus.FAILED
                delivery.error_message = f"HTTP {response.status_code}"
                webhook.failure_count += 1
                webhook.last_failure_at = end_time
                webhook.last_failure_reason = f"HTTP {response.status_code}: {response.text[:200]}"

        except Exception as e:
            end_time = datetime.utcnow()
            delivery.status = WebhookDeliveryStatus.FAILED
            delivery.error_message = str(e)
            delivery.completed_at = end_time
            webhook.failure_count += 1
            webhook.last_failure_at = end_time
            webhook.last_failure_reason = str(e)

        webhook.last_triggered_at = datetime.utcnow()
        db.commit()

    finally:
        db.close()


# =============================================================================
# WEBHOOK TRIGGER SERVICE
# =============================================================================

class WebhookService:
    """Service for triggering webhooks from other parts of the application."""

    @staticmethod
    async def trigger(
        db: Session,
        project_id: UUID,
        event: WebhookEvent,
        data: dict,
        background_tasks: BackgroundTasks
    ):
        """Trigger all webhooks subscribed to an event."""
        webhooks = db.query(Webhook).filter(
            Webhook.project_id == project_id,
            Webhook.is_active == True
        ).all()

        for webhook in webhooks:
            if event.value in (webhook.events or []):
                payload = {
                    "event": event.value,
                    "project_id": str(project_id),
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": data
                }

                background_tasks.add_task(
                    deliver_webhook,
                    webhook_id=webhook.id,
                    event_type=event.value,
                    payload=payload,
                    db_url=str(db.get_bind().url)
                )


# Export for use in other modules
webhook_service = WebhookService()


# =============================================================================
# PUBLIC API (API Key Authenticated)
# =============================================================================

@api_router.get("/products")
async def api_list_products(
    limit: int = 50,
    offset: int = 0,
    auth: tuple = Depends(require_scope("read:products")),
    db: Session = Depends(get_db)
):
    """List products (API key authenticated)."""
    key, project = auth
    from app.db.models import Product

    products = db.query(Product).filter(
        Product.project_id == project.id,
        Product.is_active == True
    ).offset(offset).limit(limit).all()

    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "price": p.price_cents / 100,
                "price_cents": p.price_cents,
                "image_url": p.image_url,
                "inventory": p.inventory_count,
                "sku": p.sku
            }
            for p in products
        ]
    }


@api_router.get("/orders")
async def api_list_orders(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    auth: tuple = Depends(require_scope("read:orders")),
    db: Session = Depends(get_db)
):
    """List orders (API key authenticated)."""
    key, project = auth
    from app.db.models import Order

    query = db.query(Order).filter(Order.project_id == project.id)

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "status": o.status.value,
                "customer_email": o.customer_email,
                "customer_name": o.customer_name,
                "subtotal": o.subtotal_cents / 100 if o.subtotal_cents else 0,
                "total": o.total_cents / 100 if o.total_cents else 0,
                "currency": o.currency,
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ]
    }


@api_router.get("/orders/{order_id}")
async def api_get_order(
    order_id: UUID,
    auth: tuple = Depends(require_scope("read:orders")),
    db: Session = Depends(get_db)
):
    """Get order details (API key authenticated)."""
    key, project = auth
    from app.db.models import Order, OrderItem

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.project_id == project.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
        "customer_email": order.customer_email,
        "customer_name": order.customer_name,
        "shipping_address": order.shipping_address,
        "subtotal": order.subtotal_cents / 100 if order.subtotal_cents else 0,
        "shipping": order.shipping_cents / 100 if order.shipping_cents else 0,
        "tax": order.tax_cents / 100 if order.tax_cents else 0,
        "total": order.total_cents / 100 if order.total_cents else 0,
        "currency": order.currency,
        "items": [
            {
                "product_id": str(i.product_id),
                "product_name": i.product_name,
                "quantity": i.quantity,
                "unit_price": i.unit_price_cents / 100 if i.unit_price_cents else 0
            }
            for i in items
        ],
        "created_at": order.created_at.isoformat(),
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None
    }


@api_router.put("/orders/{order_id}/status")
async def api_update_order_status(
    order_id: UUID,
    status: str,
    auth: tuple = Depends(require_scope("write:orders")),
    db: Session = Depends(get_db)
):
    """Update order status (API key authenticated)."""
    key, project = auth
    from app.db.models import Order, OrderStatus

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.project_id == project.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        new_status = OrderStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    order.status = new_status

    # Update timestamps
    now = datetime.utcnow()
    if new_status == OrderStatus.SHIPPED:
        order.shipped_at = now
    elif new_status == OrderStatus.COMPLETED:
        order.completed_at = now

    db.commit()

    return {"success": True, "status": new_status.value}


@api_router.get("/users")
async def api_list_users(
    limit: int = 50,
    offset: int = 0,
    auth: tuple = Depends(require_scope("read:users")),
    db: Session = Depends(get_db)
):
    """List site users (API key authenticated)."""
    key, project = auth
    from app.db.models import SiteUser

    users = db.query(SiteUser).filter(
        SiteUser.project_id == project.id
    ).order_by(SiteUser.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "login_count": u.login_count,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ]
    }


@api_router.get("/forms/submissions")
async def api_list_form_submissions(
    form_slug: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    auth: tuple = Depends(require_scope("read:forms")),
    db: Session = Depends(get_db)
):
    """List form submissions (API key authenticated)."""
    key, project = auth
    from app.db.models import FormSubmission

    query = db.query(FormSubmission).filter(
        FormSubmission.project_id == project.id
    )

    if form_slug:
        query = query.filter(FormSubmission.form_slug == form_slug)

    submissions = query.order_by(
        FormSubmission.created_at.desc()
    ).offset(offset).limit(limit).all()

    return {
        "submissions": [
            {
                "id": str(s.id),
                "form_slug": s.form_slug,
                "data": s.data,
                "is_read": s.is_read,
                "is_spam": s.is_spam,
                "page_url": s.page_url,
                "created_at": s.created_at.isoformat()
            }
            for s in submissions
        ]
    }


@api_router.get("/blog/posts")
async def api_list_blog_posts(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    auth: tuple = Depends(require_scope("read:blog")),
    db: Session = Depends(get_db)
):
    """List blog posts (API key authenticated)."""
    key, project = auth
    from app.db.models import BlogPost, BlogPostStatus

    query = db.query(BlogPost).filter(BlogPost.project_id == project.id)

    if status:
        try:
            query = query.filter(BlogPost.status == BlogPostStatus(status))
        except ValueError:
            pass

    posts = query.order_by(BlogPost.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "posts": [
            {
                "id": str(p.id),
                "title": p.title,
                "slug": p.slug,
                "excerpt": p.excerpt,
                "status": p.status.value,
                "featured_image": p.featured_image,
                "published_at": p.published_at.isoformat() if p.published_at else None,
                "created_at": p.created_at.isoformat()
            }
            for p in posts
        ]
    }


@api_router.get("/analytics/pageviews")
async def api_get_pageviews(
    days: int = 7,
    auth: tuple = Depends(require_scope("read:analytics")),
    db: Session = Depends(get_db)
):
    """Get pageview analytics (API key authenticated)."""
    key, project = auth
    from app.db.models import PageView
    from sqlalchemy import func

    since = datetime.utcnow() - timedelta(days=days)

    # Total pageviews
    total = db.query(func.count(PageView.id)).filter(
        PageView.project_id == project.id,
        PageView.timestamp >= since
    ).scalar()

    # Unique visitors (by visitor_id)
    unique = db.query(func.count(func.distinct(PageView.visitor_id))).filter(
        PageView.project_id == project.id,
        PageView.timestamp >= since
    ).scalar()

    # Top pages
    top_pages = db.query(
        PageView.page_path,
        func.count(PageView.id).label('views')
    ).filter(
        PageView.project_id == project.id,
        PageView.timestamp >= since
    ).group_by(PageView.page_path).order_by(
        func.count(PageView.id).desc()
    ).limit(10).all()

    return {
        "period_days": days,
        "total_pageviews": total,
        "unique_visitors": unique,
        "top_pages": [
            {"path": p.page_path, "views": p.views}
            for p in top_pages
        ]
    }
