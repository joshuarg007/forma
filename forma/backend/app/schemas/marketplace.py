"""Marketplace Pydantic Schemas"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# =============================================================================
# LISTING SCHEMAS
# =============================================================================

class ListingCreate(BaseModel):
    component_id: UUID
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    listing_type: str = "free"  # "free" or "paid"
    price_usd: float = 0.0
    preview_images: List[str] = []
    demo_url: Optional[str] = None


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    listing_type: Optional[str] = None
    price_usd: Optional[float] = None
    preview_images: Optional[List[str]] = None
    demo_url: Optional[str] = None


class ListingPublish(BaseModel):
    """Publish a draft listing."""
    pass


class CreatorProfile(BaseModel):
    """Creator info shown on listings."""
    id: UUID
    username: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]

    class Config:
        from_attributes = True


class ListingResponse(BaseModel):
    id: UUID
    component_id: UUID
    title: str
    description: Optional[str]
    long_description: Optional[str]
    category: Optional[str]
    tags: List[str]
    listing_type: str
    price_usd: float
    status: str
    is_featured: bool
    downloads: int
    forks: int
    likes: int
    preview_images: List[str]
    demo_url: Optional[str]
    created_at: datetime
    published_at: Optional[datetime]
    creator: CreatorProfile

    class Config:
        from_attributes = True


class ListingCard(BaseModel):
    """Compact listing for browse/search results."""
    id: UUID
    title: str
    description: Optional[str]
    category: Optional[str]
    tags: List[str]
    listing_type: str
    price_usd: float
    downloads: int
    likes: int
    preview_image: Optional[str]  # First image only
    creator_username: Optional[str]
    creator_avatar: Optional[str]

    class Config:
        from_attributes = True


class ListingSearch(BaseModel):
    """Search/filter parameters."""
    query: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    listing_type: Optional[str] = None  # "free", "paid", or None for all
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: str = "popular"  # "popular", "newest", "price_low", "price_high"
    page: int = 1
    per_page: int = 20


class ListingSearchResults(BaseModel):
    listings: List[ListingCard]
    total: int
    page: int
    per_page: int
    total_pages: int


# =============================================================================
# PURCHASE SCHEMAS
# =============================================================================

class PurchaseCreate(BaseModel):
    listing_id: UUID
    payment_method_id: Optional[str] = None  # Stripe payment method
    success_url: Optional[str] = None  # Redirect after successful payment
    cancel_url: Optional[str] = None   # Redirect if payment cancelled


class PurchaseResponse(BaseModel):
    id: UUID
    listing_id: UUID
    amount_usd: float
    status: str
    created_at: datetime
    listing_title: str

    class Config:
        from_attributes = True


# =============================================================================
# CREATOR DASHBOARD SCHEMAS
# =============================================================================

class CreatorStats(BaseModel):
    """Creator's marketplace statistics."""
    total_listings: int
    published_listings: int
    total_downloads: int
    total_forks: int
    total_likes: int
    total_revenue: float
    pending_payout: float
    lifetime_earnings: float


class EarningsBreakdown(BaseModel):
    """Earnings by listing."""
    listing_id: UUID
    listing_title: str
    downloads: int
    purchases: int
    revenue: float


class PayoutResponse(BaseModel):
    id: UUID
    amount_usd: float
    status: str
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# =============================================================================
# FORK SCHEMAS
# =============================================================================

class ForkCreate(BaseModel):
    """Fork a marketplace component into your project."""
    listing_id: UUID
    target_project_id: UUID
    new_name: Optional[str] = None  # Rename on fork


class ForkResponse(BaseModel):
    id: UUID  # New component ID
    name: str
    forked_from_listing: UUID
    project_id: UUID

    class Config:
        from_attributes = True


# =============================================================================
# GITHUB SYNC SCHEMAS
# =============================================================================

class GitHubSyncCreate(BaseModel):
    project_id: UUID
    repo_full_name: str  # "owner/repo"
    branch: str = "main"
    path: str = "src/components"
    sync_direction: str = "bidirectional"


class GitHubSyncUpdate(BaseModel):
    branch: Optional[str] = None
    path: Optional[str] = None
    auto_sync: Optional[bool] = None
    sync_direction: Optional[str] = None


class GitHubSyncResponse(BaseModel):
    id: UUID
    project_id: UUID
    repo_full_name: str
    branch: str
    path: str
    auto_sync: bool
    sync_direction: str
    last_synced_at: Optional[datetime]
    last_sync_status: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GitHubSyncTrigger(BaseModel):
    """Manually trigger a sync."""
    direction: str = "push"  # "push", "pull"
