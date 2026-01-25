"""Marketplace API Routes"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.database import get_db
from app.db.models import (
    User, Component, MarketplaceListing, Purchase, Payout,
    ListingStatus, ListingType
)
from app.schemas.marketplace import (
    ListingCreate, ListingUpdate, ListingResponse, ListingCard,
    ListingSearch, ListingSearchResults, PurchaseCreate, PurchaseResponse,
    CreatorStats, EarningsBreakdown, PayoutResponse,
    ForkCreate, ForkResponse, CreatorProfile
)
from app.core.security import get_current_user

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])


# =============================================================================
# PUBLIC BROWSE ENDPOINTS
# =============================================================================

@router.get("/browse", response_model=ListingSearchResults)
def browse_listings(
    query: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[str] = None,  # Comma-separated
    listing_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "popular",
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db)
):
    """Browse marketplace listings (public)."""
    q = db.query(MarketplaceListing).filter(
        MarketplaceListing.status == ListingStatus.PUBLISHED
    )

    # Text search
    if query:
        search = f"%{query}%"
        q = q.filter(or_(
            MarketplaceListing.title.ilike(search),
            MarketplaceListing.description.ilike(search)
        ))

    # Category filter
    if category:
        q = q.filter(MarketplaceListing.category == category)

    # Tags filter
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        for tag in tag_list:
            q = q.filter(MarketplaceListing.tags.contains([tag]))

    # Listing type filter
    if listing_type:
        q = q.filter(MarketplaceListing.listing_type == listing_type)

    # Price range
    if min_price is not None:
        q = q.filter(MarketplaceListing.price_usd >= min_price)
    if max_price is not None:
        q = q.filter(MarketplaceListing.price_usd <= max_price)

    # Sorting
    if sort_by == "popular":
        q = q.order_by(MarketplaceListing.downloads.desc())
    elif sort_by == "newest":
        q = q.order_by(MarketplaceListing.published_at.desc())
    elif sort_by == "price_low":
        q = q.order_by(MarketplaceListing.price_usd.asc())
    elif sort_by == "price_high":
        q = q.order_by(MarketplaceListing.price_usd.desc())
    else:
        q = q.order_by(MarketplaceListing.downloads.desc())

    # Count total
    total = q.count()

    # Pagination
    offset = (page - 1) * per_page
    listings = q.offset(offset).limit(per_page).all()

    # Convert to cards
    cards = []
    for listing in listings:
        creator = listing.creator
        cards.append(ListingCard(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            category=listing.category,
            tags=listing.tags or [],
            listing_type=listing.listing_type.value,
            price_usd=listing.price_usd,
            downloads=listing.downloads,
            likes=listing.likes,
            preview_image=listing.preview_images[0] if listing.preview_images else None,
            creator_username=creator.username if creator else None,
            creator_avatar=creator.avatar_url if creator else None
        ))

    return ListingSearchResults(
        listings=cards,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page
    )


@router.get("/featured", response_model=List[ListingCard])
def get_featured_listings(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get featured listings for homepage."""
    listings = db.query(MarketplaceListing).filter(
        MarketplaceListing.status == ListingStatus.PUBLISHED,
        MarketplaceListing.is_featured == True
    ).order_by(MarketplaceListing.downloads.desc()).limit(limit).all()

    cards = []
    for listing in listings:
        creator = listing.creator
        cards.append(ListingCard(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            category=listing.category,
            tags=listing.tags or [],
            listing_type=listing.listing_type.value,
            price_usd=listing.price_usd,
            downloads=listing.downloads,
            likes=listing.likes,
            preview_image=listing.preview_images[0] if listing.preview_images else None,
            creator_username=creator.username if creator else None,
            creator_avatar=creator.avatar_url if creator else None
        ))

    return cards


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all categories with counts."""
    results = db.query(
        MarketplaceListing.category,
        func.count(MarketplaceListing.id)
    ).filter(
        MarketplaceListing.status == ListingStatus.PUBLISHED,
        MarketplaceListing.category.isnot(None)
    ).group_by(MarketplaceListing.category).all()

    return [{"name": cat, "count": count} for cat, count in results]


@router.get("/listing/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: UUID, db: Session = Depends(get_db)):
    """Get single listing details."""
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == listing_id,
        MarketplaceListing.status == ListingStatus.PUBLISHED
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    creator = listing.creator
    return ListingResponse(
        id=listing.id,
        component_id=listing.component_id,
        title=listing.title,
        description=listing.description,
        long_description=listing.long_description,
        category=listing.category,
        tags=listing.tags or [],
        listing_type=listing.listing_type.value,
        price_usd=listing.price_usd,
        status=listing.status.value,
        is_featured=listing.is_featured,
        downloads=listing.downloads,
        forks=listing.forks,
        likes=listing.likes,
        preview_images=listing.preview_images or [],
        demo_url=listing.demo_url,
        created_at=listing.created_at,
        published_at=listing.published_at,
        creator=CreatorProfile(
            id=creator.id,
            username=creator.username,
            name=creator.name,
            avatar_url=creator.avatar_url,
            bio=creator.bio
        )
    )


# =============================================================================
# CREATOR ENDPOINTS (Authenticated)
# =============================================================================

@router.post("/listings", response_model=ListingResponse)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new marketplace listing (draft)."""
    # Verify component ownership
    component = db.query(Component).join(Component.project).filter(
        Component.id == data.component_id,
        Component.project.has(user_id=current_user.id)
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found or not owned by you")

    # Check if listing already exists
    existing = db.query(MarketplaceListing).filter(
        MarketplaceListing.component_id == data.component_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Component already has a listing")

    listing = MarketplaceListing(
        component_id=data.component_id,
        creator_id=current_user.id,
        title=data.title,
        description=data.description,
        long_description=data.long_description,
        category=data.category,
        tags=data.tags,
        listing_type=ListingType(data.listing_type),
        price_usd=data.price_usd if data.listing_type == "paid" else 0.0,
        preview_images=data.preview_images,
        demo_url=data.demo_url,
        status=ListingStatus.DRAFT
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return ListingResponse(
        id=listing.id,
        component_id=listing.component_id,
        title=listing.title,
        description=listing.description,
        long_description=listing.long_description,
        category=listing.category,
        tags=listing.tags or [],
        listing_type=listing.listing_type.value,
        price_usd=listing.price_usd,
        status=listing.status.value,
        is_featured=listing.is_featured,
        downloads=listing.downloads,
        forks=listing.forks,
        likes=listing.likes,
        preview_images=listing.preview_images or [],
        demo_url=listing.demo_url,
        created_at=listing.created_at,
        published_at=listing.published_at,
        creator=CreatorProfile(
            id=current_user.id,
            username=current_user.username,
            name=current_user.name,
            avatar_url=current_user.avatar_url,
            bio=current_user.bio
        )
    )


@router.put("/listings/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: UUID,
    data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a listing."""
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == listing_id,
        MarketplaceListing.creator_id == current_user.id
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Update fields
    if data.title is not None:
        listing.title = data.title
    if data.description is not None:
        listing.description = data.description
    if data.long_description is not None:
        listing.long_description = data.long_description
    if data.category is not None:
        listing.category = data.category
    if data.tags is not None:
        listing.tags = data.tags
    if data.listing_type is not None:
        listing.listing_type = ListingType(data.listing_type)
    if data.price_usd is not None:
        listing.price_usd = data.price_usd
    if data.preview_images is not None:
        listing.preview_images = data.preview_images
    if data.demo_url is not None:
        listing.demo_url = data.demo_url

    db.commit()
    db.refresh(listing)

    return ListingResponse(
        id=listing.id,
        component_id=listing.component_id,
        title=listing.title,
        description=listing.description,
        long_description=listing.long_description,
        category=listing.category,
        tags=listing.tags or [],
        listing_type=listing.listing_type.value,
        price_usd=listing.price_usd,
        status=listing.status.value,
        is_featured=listing.is_featured,
        downloads=listing.downloads,
        forks=listing.forks,
        likes=listing.likes,
        preview_images=listing.preview_images or [],
        demo_url=listing.demo_url,
        created_at=listing.created_at,
        published_at=listing.published_at,
        creator=CreatorProfile(
            id=current_user.id,
            username=current_user.username,
            name=current_user.name,
            avatar_url=current_user.avatar_url,
            bio=current_user.bio
        )
    )


@router.post("/listings/{listing_id}/publish")
def publish_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish a draft listing to the marketplace."""
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == listing_id,
        MarketplaceListing.creator_id == current_user.id
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.status == ListingStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Listing is already published")

    # Validate required fields
    if not listing.title or not listing.description:
        raise HTTPException(status_code=400, detail="Title and description are required")

    # For paid listings, creator must have Stripe Connect
    if listing.listing_type == ListingType.PAID and not current_user.stripe_connect_id:
        raise HTTPException(
            status_code=400,
            detail="Please connect your Stripe account to publish paid listings"
        )

    listing.status = ListingStatus.PUBLISHED
    listing.published_at = datetime.utcnow()

    db.commit()

    return {"message": "Listing published successfully"}


@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete (archive) a listing."""
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == listing_id,
        MarketplaceListing.creator_id == current_user.id
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.ARCHIVED
    db.commit()

    return {"message": "Listing archived"}


@router.get("/my-listings", response_model=List[ListingResponse])
def get_my_listings(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get creator's own listings."""
    q = db.query(MarketplaceListing).filter(
        MarketplaceListing.creator_id == current_user.id
    )

    if status:
        q = q.filter(MarketplaceListing.status == ListingStatus(status))

    listings = q.order_by(MarketplaceListing.created_at.desc()).all()

    return [
        ListingResponse(
            id=l.id,
            component_id=l.component_id,
            title=l.title,
            description=l.description,
            long_description=l.long_description,
            category=l.category,
            tags=l.tags or [],
            listing_type=l.listing_type.value,
            price_usd=l.price_usd,
            status=l.status.value,
            is_featured=l.is_featured,
            downloads=l.downloads,
            forks=l.forks,
            likes=l.likes,
            preview_images=l.preview_images or [],
            demo_url=l.demo_url,
            created_at=l.created_at,
            published_at=l.published_at,
            creator=CreatorProfile(
                id=current_user.id,
                username=current_user.username,
                name=current_user.name,
                avatar_url=current_user.avatar_url,
                bio=current_user.bio
            )
        )
        for l in listings
    ]


# =============================================================================
# FORK & DOWNLOAD
# =============================================================================

@router.post("/fork", response_model=ForkResponse)
def fork_component(
    data: ForkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fork a marketplace component into your project."""
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == data.listing_id,
        MarketplaceListing.status == ListingStatus.PUBLISHED
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check if paid and not purchased
    if listing.listing_type == ListingType.PAID:
        purchase = db.query(Purchase).filter(
            Purchase.listing_id == listing.id,
            Purchase.buyer_id == current_user.id,
            Purchase.status == "completed"
        ).first()

        if not purchase:
            raise HTTPException(
                status_code=402,
                detail="Please purchase this component first"
            )

    # Get source component
    source = listing.component

    # Create forked component
    forked = Component(
        project_id=data.target_project_id,
        name=data.new_name or source.name,
        intent=source.intent,
        code=source.code,
        props_schema=source.props_schema,
        tags=source.tags,
        forked_from_id=source.id
    )

    db.add(forked)

    # Update stats
    listing.downloads += 1
    listing.forks += 1

    db.commit()
    db.refresh(forked)

    return ForkResponse(
        id=forked.id,
        name=forked.name,
        forked_from_listing=listing.id,
        project_id=forked.project_id
    )


# =============================================================================
# PURCHASES
# =============================================================================

@router.post("/purchase/checkout")
def create_purchase_checkout(
    data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create Stripe checkout session for marketplace purchase."""
    from app.services.billing import billing_service

    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == data.listing_id,
        MarketplaceListing.status == ListingStatus.PUBLISHED
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.listing_type == ListingType.FREE:
        raise HTTPException(status_code=400, detail="This component is free - no payment needed")

    # Check if already purchased
    existing = db.query(Purchase).filter(
        Purchase.listing_id == listing.id,
        Purchase.buyer_id == current_user.id,
        Purchase.status == "completed"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already purchased")

    # Check seller has Connect account
    seller = listing.creator
    if not seller.stripe_connect_id:
        raise HTTPException(
            status_code=400,
            detail="Seller has not set up payments yet"
        )

    # Create checkout session
    try:
        checkout_url = billing_service.create_marketplace_checkout(
            db=db,
            buyer=current_user,
            listing_id=str(listing.id),
            listing_title=listing.title,
            amount_cents=int(listing.price_usd * 100),
            seller_connect_id=seller.stripe_connect_id,
            success_url=data.success_url or "https://forma.app/marketplace/purchase-success",
            cancel_url=data.cancel_url or "https://forma.app/marketplace"
        )
        return {"checkout_url": checkout_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/purchase", response_model=PurchaseResponse)
def purchase_listing(
    data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Direct purchase (for free components or testing).
    For paid components, use /purchase/checkout instead.
    """
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.id == data.listing_id,
        MarketplaceListing.status == ListingStatus.PUBLISHED
    ).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # For paid listings, redirect to checkout
    if listing.listing_type == ListingType.PAID:
        raise HTTPException(
            status_code=400,
            detail="Please use /purchase/checkout for paid listings"
        )

    # Check if already purchased/downloaded
    existing = db.query(Purchase).filter(
        Purchase.listing_id == listing.id,
        Purchase.buyer_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already in your library")

    # Create free "purchase" record
    purchase = Purchase(
        listing_id=listing.id,
        buyer_id=current_user.id,
        amount_usd=0,
        platform_fee=0,
        creator_payout=0,
        status="completed"
    )

    # Update listing stats
    listing.downloads += 1

    db.add(purchase)
    db.commit()
    db.refresh(purchase)

    return PurchaseResponse(
        id=purchase.id,
        listing_id=purchase.listing_id,
        amount_usd=purchase.amount_usd,
        status=purchase.status,
        created_at=purchase.created_at,
        listing_title=listing.title
    )


@router.get("/my-purchases", response_model=List[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's purchase history."""
    purchases = db.query(Purchase).filter(
        Purchase.buyer_id == current_user.id
    ).order_by(Purchase.created_at.desc()).all()

    return [
        PurchaseResponse(
            id=p.id,
            listing_id=p.listing_id,
            amount_usd=p.amount_usd,
            status=p.status,
            created_at=p.created_at,
            listing_title=p.listing.title
        )
        for p in purchases
    ]


# =============================================================================
# CREATOR DASHBOARD
# =============================================================================

@router.get("/creator/stats", response_model=CreatorStats)
def get_creator_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get creator's marketplace statistics."""
    listings = db.query(MarketplaceListing).filter(
        MarketplaceListing.creator_id == current_user.id
    ).all()

    total_listings = len(listings)
    published = sum(1 for l in listings if l.status == ListingStatus.PUBLISHED)
    total_downloads = sum(l.downloads for l in listings)
    total_forks = sum(l.forks for l in listings)
    total_likes = sum(l.likes for l in listings)
    total_revenue = sum(l.revenue_total for l in listings)

    # Calculate pending payout (not yet paid out)
    paid_out = db.query(func.sum(Payout.amount_usd)).filter(
        Payout.creator_id == current_user.id,
        Payout.status == "completed"
    ).scalar() or 0

    # Creator gets 85% of revenue
    creator_share = total_revenue * 0.85
    pending_payout = creator_share - paid_out

    return CreatorStats(
        total_listings=total_listings,
        published_listings=published,
        total_downloads=total_downloads,
        total_forks=total_forks,
        total_likes=total_likes,
        total_revenue=total_revenue,
        pending_payout=max(0, pending_payout),
        lifetime_earnings=creator_share
    )


@router.get("/creator/payouts", response_model=List[PayoutResponse])
def get_creator_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get creator's payout history."""
    payouts = db.query(Payout).filter(
        Payout.creator_id == current_user.id
    ).order_by(Payout.created_at.desc()).all()

    return [
        PayoutResponse(
            id=p.id,
            amount_usd=p.amount_usd,
            status=p.status.value,
            period_start=p.period_start,
            period_end=p.period_end,
            created_at=p.created_at,
            completed_at=p.completed_at
        )
        for p in payouts
    ]
