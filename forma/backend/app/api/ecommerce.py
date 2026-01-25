"""E-commerce API - Products, Orders, Cart, and Checkout"""
import uuid
import stripe
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.db.models import (
    User, Project, Product, Order, OrderItem,
    ProductStatus, OrderStatus
)
from app.core.security import get_current_user_required
from app.core.config import settings

stripe.api_key = settings.stripe_api_key


router = APIRouter(prefix="/api/ecommerce", tags=["ecommerce"])

# Public router for storefront (no auth required)
public_router = APIRouter(prefix="/api/store", tags=["store"])


# =============================================================================
# SCHEMAS
# =============================================================================

class ProductCreate(BaseModel):
    """Create a new product."""
    name: str
    slug: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    price_cents: int
    compare_at_price_cents: Optional[int] = None
    currency: str = "USD"
    sku: Optional[str] = None
    quantity: int = 0
    track_inventory: bool = False
    status: str = "draft"
    images: List[str] = []
    thumbnail_url: Optional[str] = None
    variants: List[dict] = []
    options: List[dict] = []
    category: Optional[str] = None
    tags: List[str] = []
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    weight_grams: Optional[int] = None
    requires_shipping: bool = True


class ProductUpdate(BaseModel):
    """Update a product."""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    price_cents: Optional[int] = None
    compare_at_price_cents: Optional[int] = None
    currency: Optional[str] = None
    sku: Optional[str] = None
    quantity: Optional[int] = None
    track_inventory: Optional[bool] = None
    status: Optional[str] = None
    images: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    variants: Optional[List[dict]] = None
    options: Optional[List[dict]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    weight_grams: Optional[int] = None
    requires_shipping: Optional[bool] = None


class ProductResponse(BaseModel):
    """Product response."""
    id: str
    project_id: str
    name: str
    slug: str
    description: Optional[str]
    long_description: Optional[str]
    price_cents: int
    compare_at_price_cents: Optional[int]
    currency: str
    sku: Optional[str]
    quantity: int
    track_inventory: bool
    status: str
    images: List[str]
    thumbnail_url: Optional[str]
    variants: List[dict]
    options: List[dict]
    category: Optional[str]
    tags: List[str]
    meta_title: Optional[str]
    meta_description: Optional[str]
    weight_grams: Optional[int]
    requires_shipping: bool
    view_count: int
    purchase_count: int
    created_at: str
    updated_at: str


class CartItem(BaseModel):
    """Cart item for checkout."""
    product_id: str
    quantity: int = 1
    variant_name: Optional[str] = None


class CheckoutCreate(BaseModel):
    """Create a checkout session."""
    items: List[CartItem]
    customer_email: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    shipping_address: Optional[dict] = None
    success_url: str
    cancel_url: str


class OrderResponse(BaseModel):
    """Order response."""
    id: str
    order_number: str
    customer_email: str
    customer_name: Optional[str]
    status: str
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    discount_cents: int
    total_cents: int
    currency: str
    items: List[dict]
    created_at: str


# =============================================================================
# PRODUCT MANAGEMENT (Authenticated)
# =============================================================================

@router.get("/projects/{project_id}/products")
async def list_products(
    project_id: UUID,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List products for a project."""
    # Verify project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Product).filter(Product.project_id == project_id)

    if status:
        query = query.filter(Product.status == status)
    if category:
        query = query.filter(Product.category == category)

    total = query.count()
    products = query.order_by(desc(Product.created_at)).offset(offset).limit(limit).all()

    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "price_cents": p.price_cents,
                "currency": p.currency,
                "status": p.status.value if p.status else "draft",
                "thumbnail_url": p.thumbnail_url,
                "category": p.category,
                "quantity": p.quantity,
                "purchase_count": p.purchase_count,
                "created_at": p.created_at.isoformat()
            }
            for p in products
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/projects/{project_id}/products")
async def create_product(
    project_id: UUID,
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new product."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check for duplicate slug
    existing = db.query(Product).filter(
        Product.project_id == project_id,
        Product.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Product slug already exists")

    product = Product(
        project_id=project_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        long_description=data.long_description,
        price_cents=data.price_cents,
        compare_at_price_cents=data.compare_at_price_cents,
        currency=data.currency,
        sku=data.sku,
        quantity=data.quantity,
        track_inventory=data.track_inventory,
        status=ProductStatus(data.status),
        images=data.images,
        thumbnail_url=data.thumbnail_url or (data.images[0] if data.images else None),
        variants=data.variants,
        options=data.options,
        category=data.category,
        tags=data.tags,
        meta_title=data.meta_title,
        meta_description=data.meta_description,
        weight_grams=data.weight_grams,
        requires_shipping=data.requires_shipping
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return {
        "id": str(product.id),
        "slug": product.slug,
        "message": "Product created"
    }


@router.get("/projects/{project_id}/products/{product_id}")
async def get_product(
    project_id: UUID,
    product_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a single product."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.project_id == project_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": str(product.id),
        "project_id": str(product.project_id),
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "long_description": product.long_description,
        "price_cents": product.price_cents,
        "compare_at_price_cents": product.compare_at_price_cents,
        "currency": product.currency,
        "sku": product.sku,
        "quantity": product.quantity,
        "track_inventory": product.track_inventory,
        "status": product.status.value if product.status else "draft",
        "images": product.images or [],
        "thumbnail_url": product.thumbnail_url,
        "variants": product.variants or [],
        "options": product.options or [],
        "category": product.category,
        "tags": product.tags or [],
        "meta_title": product.meta_title,
        "meta_description": product.meta_description,
        "weight_grams": product.weight_grams,
        "requires_shipping": product.requires_shipping,
        "view_count": product.view_count,
        "purchase_count": product.purchase_count,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat()
    }


@router.put("/projects/{project_id}/products/{product_id}")
async def update_product(
    project_id: UUID,
    product_id: UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a product."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.project_id == project_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check for duplicate slug if changing
    if data.slug and data.slug != product.slug:
        existing = db.query(Product).filter(
            Product.project_id == project_id,
            Product.slug == data.slug,
            Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Product slug already exists")

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "status":
            setattr(product, field, ProductStatus(value))
        else:
            setattr(product, field, value)

    db.commit()

    return {"message": "Product updated"}


@router.delete("/projects/{project_id}/products/{product_id}")
async def delete_product(
    project_id: UUID,
    product_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a product."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.project_id == project_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted"}


# =============================================================================
# ORDER MANAGEMENT (Authenticated)
# =============================================================================

@router.get("/projects/{project_id}/orders")
async def list_orders(
    project_id: UUID,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List orders for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Order).filter(Order.project_id == project_id)

    if status:
        query = query.filter(Order.status == status)

    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset(offset).limit(limit).all()

    return {
        "orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "customer_email": o.customer_email,
                "customer_name": o.customer_name,
                "status": o.status.value if o.status else "pending",
                "total_cents": o.total_cents,
                "currency": o.currency,
                "item_count": len(o.items) if o.items else 0,
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/projects/{project_id}/orders/{order_id}")
async def get_order(
    project_id: UUID,
    order_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a single order."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.project_id == project_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "customer_email": order.customer_email,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "status": order.status.value if order.status else "pending",
        "subtotal_cents": order.subtotal_cents,
        "shipping_cents": order.shipping_cents,
        "tax_cents": order.tax_cents,
        "discount_cents": order.discount_cents,
        "total_cents": order.total_cents,
        "currency": order.currency,
        "shipping_address": {
            "line1": order.shipping_address_line1,
            "line2": order.shipping_address_line2,
            "city": order.shipping_city,
            "state": order.shipping_state,
            "postal_code": order.shipping_postal_code,
            "country": order.shipping_country
        } if order.shipping_address_line1 else None,
        "shipping_method": order.shipping_method,
        "tracking_number": order.tracking_number,
        "tracking_url": order.tracking_url,
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id) if item.product_id else None,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "variant_name": item.variant_name,
                "unit_price_cents": item.unit_price_cents,
                "quantity": item.quantity,
                "total_cents": item.total_cents,
                "image_url": item.image_url
            }
            for item in order.items
        ],
        "customer_notes": order.customer_notes,
        "internal_notes": order.internal_notes,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat()
    }


@router.put("/projects/{project_id}/orders/{order_id}/status")
async def update_order_status(
    project_id: UUID,
    order_id: UUID,
    status: str,
    tracking_number: Optional[str] = None,
    tracking_url: Optional[str] = None,
    internal_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update order status."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.project_id == project_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = OrderStatus(status)

    if status == "shipped":
        order.shipped_at = datetime.utcnow()
        if tracking_number:
            order.tracking_number = tracking_number
        if tracking_url:
            order.tracking_url = tracking_url
    elif status == "delivered":
        order.delivered_at = datetime.utcnow()

    if internal_notes:
        order.internal_notes = internal_notes

    db.commit()

    return {"message": "Order status updated"}


# =============================================================================
# PUBLIC STOREFRONT (No auth - for deployed sites)
# =============================================================================

@public_router.get("/{project_id}/products")
async def public_list_products(
    project_id: UUID,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Public product listing for storefront."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Store not found")

    query = db.query(Product).filter(
        Product.project_id == project_id,
        Product.status == ProductStatus.ACTIVE
    )

    if category:
        query = query.filter(Product.category == category)

    total = query.count()
    products = query.order_by(desc(Product.created_at)).offset(offset).limit(limit).all()

    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "price_cents": p.price_cents,
                "compare_at_price_cents": p.compare_at_price_cents,
                "currency": p.currency,
                "thumbnail_url": p.thumbnail_url,
                "images": p.images or [],
                "category": p.category,
                "in_stock": p.quantity > 0 or not p.track_inventory
            }
            for p in products
        ],
        "total": total
    }


@public_router.get("/{project_id}/products/{product_slug}")
async def public_get_product(
    project_id: UUID,
    product_slug: str,
    db: Session = Depends(get_db)
):
    """Get a single product for storefront."""
    product = db.query(Product).filter(
        Product.project_id == project_id,
        Product.slug == product_slug,
        Product.status == ProductStatus.ACTIVE
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Increment view count
    product.view_count = (product.view_count or 0) + 1
    db.commit()

    return {
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "long_description": product.long_description,
        "price_cents": product.price_cents,
        "compare_at_price_cents": product.compare_at_price_cents,
        "currency": product.currency,
        "images": product.images or [],
        "thumbnail_url": product.thumbnail_url,
        "variants": product.variants or [],
        "options": product.options or [],
        "category": product.category,
        "tags": product.tags or [],
        "in_stock": product.quantity > 0 or not product.track_inventory,
        "requires_shipping": product.requires_shipping
    }


@public_router.post("/{project_id}/checkout")
async def create_checkout(
    project_id: UUID,
    data: CheckoutCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a checkout session for cart items."""

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Store not found")

    # Get project owner for Stripe Connect
    owner = db.query(User).filter(User.id == project.user_id).first()
    if not owner or not owner.stripe_connect_id:
        raise HTTPException(
            status_code=400,
            detail="Store payments not configured"
        )

    # Validate and calculate cart
    cart_items = []
    subtotal = 0

    for item in data.items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.project_id == project_id,
            Product.status == ProductStatus.ACTIVE
        ).first()

        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} not available"
            )

        # Check stock
        if product.track_inventory and product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )

        item_total = product.price_cents * item.quantity
        subtotal += item_total

        cart_items.append({
            "product": product,
            "quantity": item.quantity,
            "variant_name": item.variant_name,
            "total": item_total
        })

    # Generate order number
    order_count = db.query(Order).filter(Order.project_id == project_id).count()
    order_number = f"ORD-{str(project_id)[:4].upper()}-{order_count + 1:05d}"

    # Create order in pending state
    order = Order(
        project_id=project_id,
        order_number=order_number,
        customer_email=data.customer_email,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        subtotal_cents=subtotal,
        shipping_cents=0,  # Can be calculated based on shipping method
        tax_cents=0,       # Can be calculated based on location
        discount_cents=0,
        total_cents=subtotal,
        currency="USD",
        status=OrderStatus.PENDING,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    if data.shipping_address:
        addr = data.shipping_address
        order.shipping_address_line1 = addr.get("line1")
        order.shipping_address_line2 = addr.get("line2")
        order.shipping_city = addr.get("city")
        order.shipping_state = addr.get("state")
        order.shipping_postal_code = addr.get("postal_code")
        order.shipping_country = addr.get("country")

    db.add(order)
    db.flush()  # Get order ID

    # Create order items
    for cart_item in cart_items:
        product = cart_item["product"]
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            product_sku=product.sku,
            variant_name=cart_item["variant_name"],
            unit_price_cents=product.price_cents,
            quantity=cart_item["quantity"],
            total_cents=cart_item["total"],
            image_url=product.thumbnail_url
        )
        db.add(order_item)

    db.commit()

    # Create Stripe Checkout session
    platform_fee_cents = int(subtotal * 0.05)  # 5% platform fee

    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "unit_amount": item["product"].price_cents,
                "product_data": {
                    "name": item["product"].name,
                    "images": [item["product"].thumbnail_url] if item["product"].thumbnail_url else []
                }
            },
            "quantity": item["quantity"]
        }
        for item in cart_items
    ]

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=line_items,
            payment_intent_data={
                "application_fee_amount": platform_fee_cents,
                "transfer_data": {
                    "destination": owner.stripe_connect_id
                },
                "metadata": {
                    "order_id": str(order.id),
                    "project_id": str(project_id)
                }
            },
            success_url=data.success_url + f"?order={order.order_number}",
            cancel_url=data.cancel_url,
            customer_email=data.customer_email,
            metadata={
                "type": "ecommerce_order",
                "order_id": str(order.id),
                "project_id": str(project_id),
                "order_number": order_number
            }
        )

        # Store session ID
        order.stripe_checkout_session_id = session.id
        db.commit()

        return {
            "checkout_url": session.url,
            "order_number": order_number,
            "order_id": str(order.id)
        }

    except stripe.StripeError as e:
        # Delete the pending order on Stripe failure
        db.delete(order)
        db.commit()
        raise HTTPException(status_code=400, detail=str(e))


@public_router.get("/{project_id}/orders/{order_number}")
async def public_get_order(
    project_id: UUID,
    order_number: str,
    email: str,
    db: Session = Depends(get_db)
):
    """Get order status (requires email verification)."""
    order = db.query(Order).filter(
        Order.project_id == project_id,
        Order.order_number == order_number,
        Order.customer_email == email
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_number": order.order_number,
        "status": order.status.value if order.status else "pending",
        "total_cents": order.total_cents,
        "currency": order.currency,
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "total_cents": item.total_cents,
                "image_url": item.image_url
            }
            for item in order.items
        ],
        "tracking_number": order.tracking_number,
        "tracking_url": order.tracking_url,
        "created_at": order.created_at.isoformat()
    }
