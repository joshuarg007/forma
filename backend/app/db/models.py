"""FORMA Database Models"""
import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime,
    ForeignKey, JSON, Enum, TypeDecorator
)
from sqlalchemy.orm import relationship

from app.db.database import Base


# UUID type that works with both SQLite and PostgreSQL
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value)
        return value


class PlanType(str, PyEnum):
    STARTER = "starter"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"


class OperationType(str, PyEnum):
    GENERATE = "generate"
    EDIT = "edit"
    EXPLAIN = "explain"
    REFACTOR = "refactor"
    DEBUG = "debug"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255))

    # Creator profile
    username = Column(String(50), unique=True, index=True)  # @handle for marketplace
    bio = Column(Text)
    avatar_url = Column(String(500))
    website_url = Column(String(500))
    github_username = Column(String(100))
    github_access_token = Column(Text)  # Encrypted GitHub OAuth token
    github_id = Column(String(100))  # GitHub user ID
    stripe_connect_id = Column(String(255))  # For payouts

    plan = Column(Enum(PlanType), default=PlanType.STARTER)
    stripe_customer_id = Column(String(255))
    ai_preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    usage_records = relationship("AIUsage", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    listings = relationship("MarketplaceListing", back_populates="creator", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="buyer", cascade="all, delete-orphan")
    payouts = relationship("Payout", back_populates="creator", cascade="all, delete-orphan")
    project_memberships = relationship("ProjectMember", foreign_keys="ProjectMember.user_id", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    design_system = Column(JSON, default=dict)
    settings = Column(JSON, default=dict)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    pages = relationship("Page", back_populates="project", cascade="all, delete-orphan", order_by="Page.position")
    components = relationship("Component", back_populates="project", cascade="all, delete-orphan")
    intentions = relationship("Intention", back_populates="project", cascade="all, delete-orphan")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")


class PageType(str, PyEnum):
    PAGE = "page"           # Regular page
    LAYOUT = "layout"       # Layout wrapper (header, footer, sidebar)
    COMPONENT = "component" # Reusable component


class Page(Base):
    """Individual page within a project - enables multi-page React apps."""
    __tablename__ = "pages"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)

    # Page identity
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)  # URL path: "about", "pricing", "dashboard"
    description = Column(Text)
    page_type = Column(Enum(PageType), default=PageType.PAGE)

    # Canvas state - the visual components on this page
    canvas_components = Column(JSON, default=list)  # Array of CanvasComponent objects

    # Layout & settings
    layout = Column(String(50), default="default")  # "blank", "default", "sidebar", "dashboard"
    parent_layout_id = Column(GUID(), ForeignKey("pages.id"), nullable=True)  # For nested layouts
    is_homepage = Column(Boolean, default=False)
    is_dynamic = Column(Boolean, default=False)  # For [id] routes
    dynamic_param = Column(String(50))  # e.g., "id", "slug"

    # SEO metadata
    meta_title = Column(String(255))
    meta_description = Column(Text)
    og_image = Column(String(500))

    # Ordering
    position = Column(Integer, default=0)

    # Navigation settings
    show_in_nav = Column(Boolean, default=True)
    nav_label = Column(String(100))  # Override name in nav
    nav_icon = Column(String(50))  # Icon name for sidebar nav

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="pages")
    parent_layout = relationship("Page", remote_side=[id], foreign_keys=[parent_layout_id])


class Component(Base):
    __tablename__ = "components"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    intent = Column(Text)  # Natural language description
    code = Column(Text)     # Generated React code
    props_schema = Column(JSON, default=dict)
    parent_id = Column(GUID(), ForeignKey("components.id"), nullable=True)
    position = Column(Integer, default=0)

    # Marketplace & forking
    forked_from_id = Column(GUID(), ForeignKey("components.id"), nullable=True)
    tags = Column(JSON, default=list)  # ["button", "form", "modal"]
    preview_url = Column(String(500))  # Screenshot/preview image

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="components")
    children = relationship("Component", backref="parent", remote_side=[id], foreign_keys=[parent_id])
    forked_from = relationship("Component", remote_side=[id], foreign_keys=[forked_from_id])
    intentions = relationship("Intention", back_populates="component", cascade="all, delete-orphan")
    listing = relationship("MarketplaceListing", back_populates="component", uselist=False)


class Intention(Base):
    """Version history by natural language intent."""
    __tablename__ = "intentions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    component_id = Column(GUID(), ForeignKey("components.id"), nullable=False)
    intent_text = Column(Text, nullable=False)
    version = Column(Integer, nullable=False)
    snapshot = Column(JSON)  # Full component state at this version
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="intentions")
    component = relationship("Component", back_populates="intentions")


class AIUsage(Base):
    """Track AI operations for billing."""
    __tablename__ = "ai_usage"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    operation_type = Column(Enum(OperationType), nullable=False)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="usage_records")


class Subscription(Base):
    """Stripe subscription tracking."""
    __tablename__ = "subscriptions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False)
    stripe_subscription_id = Column(String(255))
    plan = Column(Enum(PlanType), default=PlanType.STARTER)
    status = Column(String(50), default="active")
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="subscription")


# =============================================================================
# MARKETPLACE MODELS
# =============================================================================

class ListingStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ListingType(str, PyEnum):
    FREE = "free"
    PAID = "paid"


class MarketplaceListing(Base):
    """Published component on the marketplace."""
    __tablename__ = "marketplace_listings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    component_id = Column(GUID(), ForeignKey("components.id"), unique=True, nullable=False)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Listing details
    title = Column(String(255), nullable=False)
    description = Column(Text)
    long_description = Column(Text)  # Markdown supported
    category = Column(String(100))  # "buttons", "forms", "layouts", etc.
    tags = Column(JSON, default=list)

    # Pricing
    listing_type = Column(Enum(ListingType), default=ListingType.FREE)
    price_usd = Column(Float, default=0.0)  # 0 for free

    # Status & visibility
    status = Column(Enum(ListingStatus), default=ListingStatus.DRAFT)
    is_featured = Column(Boolean, default=False)

    # Stats
    downloads = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    revenue_total = Column(Float, default=0.0)

    # Media
    preview_images = Column(JSON, default=list)  # Array of image URLs
    demo_url = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

    # Relationships
    component = relationship("Component", back_populates="listing")
    creator = relationship("User", back_populates="listings")
    purchases = relationship("Purchase", back_populates="listing", cascade="all, delete-orphan")


class Purchase(Base):
    """Record of a marketplace purchase."""
    __tablename__ = "purchases"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    listing_id = Column(GUID(), ForeignKey("marketplace_listings.id"), nullable=False)
    buyer_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Payment
    amount_usd = Column(Float, nullable=False)
    stripe_payment_id = Column(String(255))
    platform_fee = Column(Float, default=0.0)  # FORMA's cut (e.g., 15%)
    creator_payout = Column(Float, default=0.0)  # Creator's cut (e.g., 85%)

    # Status
    status = Column(String(50), default="completed")  # completed, refunded

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("MarketplaceListing", back_populates="purchases")
    buyer = relationship("User", back_populates="purchases")


class PayoutStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Payout(Base):
    """Creator payout tracking."""
    __tablename__ = "payouts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    amount_usd = Column(Float, nullable=False)
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING)
    stripe_transfer_id = Column(String(255))

    # Period this payout covers
    period_start = Column(DateTime)
    period_end = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    creator = relationship("User", back_populates="payouts")


class ProjectRole(str, PyEnum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class InviteStatus(str, PyEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class ProjectMember(Base):
    """Team member association with a project."""
    __tablename__ = "project_members"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    role = Column(Enum(ProjectRole), default=ProjectRole.VIEWER, nullable=False)

    # Granular permissions (override role defaults)
    can_edit_components = Column(Boolean, default=None)  # None = use role default
    can_delete_components = Column(Boolean, default=None)
    can_export = Column(Boolean, default=None)
    can_invite_members = Column(Boolean, default=None)
    can_manage_settings = Column(Boolean, default=None)

    invited_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    invited_at = Column(DateTime, default=datetime.utcnow)
    joined_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="project_memberships")
    invited_by = relationship("User", foreign_keys=[invited_by_id])

    # Unique constraint: one membership per user per project
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class ProjectInvite(Base):
    """Pending invitations to join a project."""
    __tablename__ = "project_invites"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    email = Column(String(255), nullable=False)  # Invited email (may not have account yet)
    role = Column(Enum(ProjectRole), default=ProjectRole.EDITOR, nullable=False)
    status = Column(Enum(InviteStatus), default=InviteStatus.PENDING, nullable=False)

    invite_token = Column(String(255), unique=True, nullable=False)  # For accepting invite
    invited_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    message = Column(Text)  # Optional invite message

    expires_at = Column(DateTime, nullable=False)  # Invite expiration
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime)

    # Relationships
    project = relationship("Project")
    invited_by = relationship("User")


class GitHubSync(Base):
    """GitHub repository sync configuration."""
    __tablename__ = "github_syncs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), unique=True, nullable=False)

    # GitHub details
    repo_full_name = Column(String(255), nullable=False)  # "owner/repo"
    branch = Column(String(100), default="main")
    path = Column(String(500), default="src/components")  # Where to sync components

    # Auth
    github_installation_id = Column(String(255))  # GitHub App installation
    access_token_encrypted = Column(Text)  # Encrypted OAuth token

    # Sync settings
    auto_sync = Column(Boolean, default=True)
    sync_direction = Column(String(20), default="bidirectional")  # push, pull, bidirectional
    last_synced_at = Column(DateTime)
    last_sync_status = Column(String(50))  # success, failed, conflict

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
