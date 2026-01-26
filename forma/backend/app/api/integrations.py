"""Integrations Hub API."""
import json
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, User, Integration, IntegrationLog,
    IntegrationType, IntegrationStatus
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/integrations", tags=["integrations"])


# =============================================================================
# SCHEMAS
# =============================================================================

class IntegrationCreate(BaseModel):
    integration_type: IntegrationType
    name: str
    config: Dict[str, Any] = {}
    events: List[str] = []


class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    events: Optional[List[str]] = None
    status: Optional[IntegrationStatus] = None


class IntegrationResponse(BaseModel):
    id: UUID
    project_id: UUID
    integration_type: str
    name: str
    status: str
    error_message: Optional[str]
    config: dict
    events: list
    last_triggered_at: Optional[datetime]
    trigger_count: int
    success_count: int
    failure_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IntegrationLogResponse(BaseModel):
    id: UUID
    event_type: str
    success: bool
    status_code: Optional[int]
    error_message: Optional[str]
    duration_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SlackConfig(BaseModel):
    webhook_url: str
    channel: Optional[str] = None
    username: Optional[str] = "FORMA"
    icon_emoji: Optional[str] = ":rocket:"


class DiscordConfig(BaseModel):
    webhook_url: str
    username: Optional[str] = "FORMA"
    avatar_url: Optional[str] = None


class GoogleAnalyticsConfig(BaseModel):
    measurement_id: str  # G-XXXXXXXXXX
    api_secret: Optional[str] = None


class CustomWebhookConfig(BaseModel):
    url: str
    method: str = "POST"
    headers: Dict[str, str] = {}
    include_signature: bool = True
    secret: Optional[str] = None


class IntegrationTypeInfo(BaseModel):
    type: str
    name: str
    description: str
    icon: str
    events: List[str]
    config_schema: dict


# =============================================================================
# INTEGRATION TYPE DEFINITIONS
# =============================================================================

INTEGRATION_TYPES = {
    IntegrationType.SLACK: {
        "name": "Slack",
        "description": "Send notifications to Slack channels",
        "icon": "slack",
        "events": ["deployment", "deployment_failed", "form_submission", "order", "comment", "mention"],
        "config_schema": {
            "webhook_url": {"type": "string", "required": True, "label": "Webhook URL"},
            "channel": {"type": "string", "required": False, "label": "Channel Override"},
            "username": {"type": "string", "required": False, "label": "Bot Username", "default": "FORMA"},
        }
    },
    IntegrationType.DISCORD: {
        "name": "Discord",
        "description": "Send notifications to Discord channels",
        "icon": "discord",
        "events": ["deployment", "deployment_failed", "form_submission", "order", "comment"],
        "config_schema": {
            "webhook_url": {"type": "string", "required": True, "label": "Webhook URL"},
            "username": {"type": "string", "required": False, "label": "Bot Username"},
        }
    },
    IntegrationType.GOOGLE_ANALYTICS: {
        "name": "Google Analytics",
        "description": "Track events in Google Analytics 4",
        "icon": "analytics",
        "events": ["page_view", "form_submission", "order", "signup"],
        "config_schema": {
            "measurement_id": {"type": "string", "required": True, "label": "Measurement ID (G-...)"},
        }
    },
    IntegrationType.SEGMENT: {
        "name": "Segment",
        "description": "Send events to Segment for analytics",
        "icon": "segment",
        "events": ["page_view", "form_submission", "order", "signup", "identify"],
        "config_schema": {
            "write_key": {"type": "string", "required": True, "label": "Write Key"},
        }
    },
    IntegrationType.CUSTOM_WEBHOOK: {
        "name": "Custom Webhook",
        "description": "Send events to any webhook URL",
        "icon": "webhook",
        "events": ["deployment", "deployment_failed", "form_submission", "order", "comment", "page_update"],
        "config_schema": {
            "url": {"type": "string", "required": True, "label": "Webhook URL"},
            "method": {"type": "select", "options": ["POST", "PUT"], "default": "POST"},
            "headers": {"type": "json", "required": False, "label": "Custom Headers"},
        }
    },
    IntegrationType.ZAPIER: {
        "name": "Zapier",
        "description": "Connect to 5000+ apps via Zapier",
        "icon": "zapier",
        "events": ["deployment", "form_submission", "order", "signup"],
        "config_schema": {
            "webhook_url": {"type": "string", "required": True, "label": "Zapier Webhook URL"},
        }
    },
}


# =============================================================================
# HELPERS
# =============================================================================

def get_project_access(project_id: UUID, user: User, db: Session) -> Project:
    """Get project with access check."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return project


async def send_slack_notification(integration: Integration, event_type: str, data: dict) -> tuple:
    """Send notification to Slack."""
    config = integration.config
    webhook_url = config.get("webhook_url")

    if not webhook_url:
        return False, 0, "Missing webhook URL"

    # Build Slack message
    message = {
        "username": config.get("username", "FORMA"),
        "icon_emoji": config.get("icon_emoji", ":rocket:"),
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{event_type.replace('_', ' ').title()}*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": data.get("message", "Event triggered")
                }
            }
        ]
    }

    if config.get("channel"):
        message["channel"] = config["channel"]

    start = datetime.utcnow()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=message, timeout=10)
            duration = int((datetime.utcnow() - start).total_seconds() * 1000)
            return response.status_code == 200, response.status_code, duration
    except Exception as e:
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        return False, 0, str(e)


async def send_discord_notification(integration: Integration, event_type: str, data: dict) -> tuple:
    """Send notification to Discord."""
    config = integration.config
    webhook_url = config.get("webhook_url")

    if not webhook_url:
        return False, 0, "Missing webhook URL"

    # Build Discord message
    message = {
        "username": config.get("username", "FORMA"),
        "embeds": [{
            "title": event_type.replace("_", " ").title(),
            "description": data.get("message", "Event triggered"),
            "color": 5814783,  # Blue
            "timestamp": datetime.utcnow().isoformat()
        }]
    }

    if config.get("avatar_url"):
        message["avatar_url"] = config["avatar_url"]

    start = datetime.utcnow()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=message, timeout=10)
            duration = int((datetime.utcnow() - start).total_seconds() * 1000)
            return response.status_code in [200, 204], response.status_code, duration
    except Exception as e:
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        return False, 0, str(e)


async def send_custom_webhook(integration: Integration, event_type: str, data: dict) -> tuple:
    """Send to custom webhook."""
    config = integration.config
    webhook_url = config.get("url")

    if not webhook_url:
        return False, 0, "Missing webhook URL"

    method = config.get("method", "POST")
    headers = config.get("headers", {})
    headers["Content-Type"] = "application/json"

    payload = {
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }

    start = datetime.utcnow()
    try:
        async with httpx.AsyncClient() as client:
            if method == "POST":
                response = await client.post(webhook_url, json=payload, headers=headers, timeout=10)
            else:
                response = await client.put(webhook_url, json=payload, headers=headers, timeout=10)

            duration = int((datetime.utcnow() - start).total_seconds() * 1000)
            return response.status_code < 400, response.status_code, duration
    except Exception as e:
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        return False, 0, str(e)


async def trigger_integration(integration: Integration, event_type: str, data: dict, db: Session):
    """Trigger an integration."""
    success = False
    status_code = None
    error_message = None
    duration_ms = 0

    try:
        if integration.integration_type == IntegrationType.SLACK:
            success, status_code, result = await send_slack_notification(integration, event_type, data)
            if isinstance(result, str):
                error_message = result
            else:
                duration_ms = result

        elif integration.integration_type == IntegrationType.DISCORD:
            success, status_code, result = await send_discord_notification(integration, event_type, data)
            if isinstance(result, str):
                error_message = result
            else:
                duration_ms = result

        elif integration.integration_type in [IntegrationType.CUSTOM_WEBHOOK, IntegrationType.ZAPIER]:
            success, status_code, result = await send_custom_webhook(integration, event_type, data)
            if isinstance(result, str):
                error_message = result
            else:
                duration_ms = result

        else:
            error_message = f"Unsupported integration type: {integration.integration_type}"

    except Exception as e:
        error_message = str(e)

    # Log the trigger
    log = IntegrationLog(
        integration_id=integration.id,
        event_type=event_type,
        event_data=data,
        success=success,
        status_code=status_code,
        error_message=error_message,
        duration_ms=duration_ms,
    )
    db.add(log)

    # Update integration stats
    integration.last_triggered_at = datetime.utcnow()
    integration.trigger_count += 1
    if success:
        integration.success_count += 1
        integration.status = IntegrationStatus.ACTIVE
        integration.error_message = None
    else:
        integration.failure_count += 1
        integration.status = IntegrationStatus.ERROR
        integration.error_message = error_message
        integration.last_error_at = datetime.utcnow()

    db.commit()


async def trigger_project_integrations(
    db: Session,
    project_id: UUID,
    event_type: str,
    data: dict,
    background_tasks: BackgroundTasks = None
):
    """Trigger all integrations for a project that listen to this event."""
    integrations = db.query(Integration).filter(
        Integration.project_id == project_id,
        Integration.status.in_([IntegrationStatus.ACTIVE, IntegrationStatus.ERROR])
    ).all()

    for integration in integrations:
        if event_type in (integration.events or []):
            if background_tasks:
                background_tasks.add_task(trigger_integration, integration, event_type, data, db)
            else:
                await trigger_integration(integration, event_type, data, db)


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/types", response_model=List[IntegrationTypeInfo])
async def list_integration_types():
    """List available integration types."""
    return [
        IntegrationTypeInfo(
            type=itype.value,
            name=info["name"],
            description=info["description"],
            icon=info["icon"],
            events=info["events"],
            config_schema=info["config_schema"]
        )
        for itype, info in INTEGRATION_TYPES.items()
    ]


@router.get("", response_model=List[IntegrationResponse])
async def list_integrations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    project_id: UUID = None
):
    """List integrations for a project."""
    project = get_project_access(project_id, user, db)

    integrations = db.query(Integration).filter(
        Integration.project_id == project.id
    ).order_by(Integration.created_at).all()

    return [IntegrationResponse.model_validate(i) for i in integrations]


@router.post("", response_model=IntegrationResponse)
async def create_integration(
    project_id: UUID,
    request: IntegrationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a new integration."""
    project = get_project_access(project_id, user, db)

    # Validate integration type
    if request.integration_type not in INTEGRATION_TYPES:
        raise HTTPException(status_code=400, detail="Invalid integration type")

    # Validate events
    valid_events = INTEGRATION_TYPES[request.integration_type]["events"]
    for event in request.events:
        if event not in valid_events:
            raise HTTPException(status_code=400, detail=f"Invalid event: {event}")

    integration = Integration(
        project_id=project.id,
        integration_type=request.integration_type,
        name=request.name,
        config=request.config,
        events=request.events,
        status=IntegrationStatus.ACTIVE,
        created_by_id=user.id,
    )

    db.add(integration)
    db.commit()
    db.refresh(integration)

    return IntegrationResponse.model_validate(integration)


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    project_id: UUID,
    integration_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    return IntegrationResponse.model_validate(integration)


@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    project_id: UUID,
    integration_id: UUID,
    request: IntegrationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(integration, field, value)

    db.commit()
    db.refresh(integration)

    return IntegrationResponse.model_validate(integration)


@router.delete("/{integration_id}")
async def delete_integration(
    project_id: UUID,
    integration_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    db.delete(integration)
    db.commit()

    return {"success": True}


@router.post("/{integration_id}/test")
async def test_integration(
    project_id: UUID,
    integration_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Test an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    # Send test event
    test_data = {
        "message": f"Test notification from FORMA for project: {project.name}",
        "project_name": project.name,
        "timestamp": datetime.utcnow().isoformat()
    }

    await trigger_integration(integration, "test", test_data, db)

    # Get the log
    log = db.query(IntegrationLog).filter(
        IntegrationLog.integration_id == integration.id
    ).order_by(desc(IntegrationLog.created_at)).first()

    return {
        "success": log.success if log else False,
        "status_code": log.status_code if log else None,
        "error_message": log.error_message if log else "Unknown error",
        "duration_ms": log.duration_ms if log else 0
    }


@router.get("/{integration_id}/logs", response_model=List[IntegrationLogResponse])
async def list_integration_logs(
    project_id: UUID,
    integration_id: UUID,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List logs for an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    logs = db.query(IntegrationLog).filter(
        IntegrationLog.integration_id == integration.id
    ).order_by(desc(IntegrationLog.created_at)).limit(limit).all()

    return [IntegrationLogResponse.model_validate(l) for l in logs]


@router.post("/{integration_id}/enable")
async def enable_integration(
    project_id: UUID,
    integration_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Enable an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    integration.status = IntegrationStatus.ACTIVE
    integration.error_message = None
    db.commit()

    return {"success": True}


@router.post("/{integration_id}/disable")
async def disable_integration(
    project_id: UUID,
    integration_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Disable an integration."""
    project = get_project_access(project_id, user, db)

    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.project_id == project.id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    integration.status = IntegrationStatus.INACTIVE
    db.commit()

    return {"success": True}
