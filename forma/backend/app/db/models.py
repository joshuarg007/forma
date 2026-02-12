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

    # DataModeler schema for backend API generation
    schema_json = Column(JSON, nullable=True)  # Schema definition from DataModeler
    runtime_deployed_at = Column(DateTime, nullable=True)  # Last backend deployment time
    runtime_api_url = Column(String(500), nullable=True)  # e.g., https://api.forma.dev/p/abc123

    # Figma integration
    figma_token = Column(Text, nullable=True)  # Encrypted Figma access token
    figma_user_id = Column(String(100), nullable=True)
    figma_user_email = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    pages = relationship("Page", back_populates="project", cascade="all, delete-orphan", order_by="Page.position")
    components = relationship("Component", back_populates="project", cascade="all, delete-orphan")
    intentions = relationship("Intention", back_populates="project", cascade="all, delete-orphan")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    # Hosting relationships
    deployments = relationship("Deployment", back_populates="project", cascade="all, delete-orphan")
    custom_domains = relationship("CustomDomain", back_populates="project", cascade="all, delete-orphan")
    hosting_config = relationship("ProjectHostingConfig", back_populates="project", uselist=False, cascade="all, delete-orphan")


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


class Menu(Base):
    """Reusable navigation menus (project-scoped)."""
    __tablename__ = "menus"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(Text)
    items = Column(JSON, default=list)  # Array of MenuItem objects

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="menus")


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


# =============================================================================
# HOSTING MODELS
# =============================================================================

class DeploymentStatus(str, PyEnum):
    PENDING = "pending"           # Queued for build
    BUILDING = "building"         # Building project
    UPLOADING = "uploading"       # Uploading to CDN
    DEPLOYED = "deployed"         # Live
    FAILED = "failed"             # Build or deploy failed
    CANCELLED = "cancelled"       # Cancelled by user


class Deployment(Base):
    """Deployment record for a hosted project."""
    __tablename__ = "deployments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Deployment info
    version = Column(Integer, nullable=False)  # Auto-incrementing per project
    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.PENDING)

    # URLs
    subdomain = Column(String(100), nullable=False)  # "myproject" -> myproject.forma.app
    production_url = Column(String(500))  # https://myproject.forma.app
    preview_url = Column(String(500))     # For draft deployments

    # Cloudflare integration
    cloudflare_project_name = Column(String(100))  # Cloudflare Pages project name
    cloudflare_deployment_id = Column(String(255))

    # Build info
    build_started_at = Column(DateTime)
    build_completed_at = Column(DateTime)
    deploy_started_at = Column(DateTime)
    deploy_completed_at = Column(DateTime)

    # Snapshot of what was deployed
    pages_snapshot = Column(JSON)  # Copy of all pages at deployment time
    design_system_snapshot = Column(JSON)

    # Metadata
    commit_message = Column(String(500))  # User-provided description
    is_production = Column(Boolean, default=False)  # Is this the live deployment?
    triggered_by = Column(String(50), default="manual")  # "manual", "auto", "rollback"

    # Error tracking
    error_message = Column(Text)
    error_code = Column(String(50))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="deployments")
    user = relationship("User")
    build_logs = relationship("BuildLog", back_populates="deployment", cascade="all, delete-orphan")


class CustomDomainStatus(str, PyEnum):
    PENDING_VALIDATION = "pending_validation"
    VALIDATING = "validating"
    ACTIVE = "active"
    FAILED = "failed"
    EXPIRED = "expired"


class CustomDomain(Base):
    """Custom domain configuration for a project."""
    __tablename__ = "custom_domains"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)

    # Domain info
    domain = Column(String(255), unique=True, nullable=False)  # "mysite.com"
    status = Column(Enum(CustomDomainStatus), default=CustomDomainStatus.PENDING_VALIDATION)

    # DNS validation
    dns_record_type = Column(String(10), default="CNAME")  # CNAME or TXT
    dns_record_name = Column(String(255))  # e.g., "_acme-challenge" or "@"
    dns_record_value = Column(String(500))  # The value to set

    dns_verified_at = Column(DateTime)

    # SSL Certificate
    ssl_status = Column(String(50), default="pending")  # "pending", "active", "expired"
    ssl_expires_at = Column(DateTime)
    ssl_certificate_id = Column(String(255))  # Cloudflare certificate ID

    # Primary domain flag
    is_primary = Column(Boolean, default=False)  # Primary domain for the project

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="custom_domains")


class BuildLogLevel(str, PyEnum):
    INFO = "info"
    WARN = "warn"
    ERROR = "error"
    DEBUG = "debug"


class BuildLog(Base):
    """Build log entries for a deployment."""
    __tablename__ = "build_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(GUID(), ForeignKey("deployments.id"), nullable=False)

    level = Column(Enum(BuildLogLevel), default=BuildLogLevel.INFO)
    message = Column(Text, nullable=False)
    step = Column(String(100))  # "export", "build", "upload", "dns"

    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    deployment = relationship("Deployment", back_populates="build_logs")


class ProjectHostingConfig(Base):
    """Hosting configuration for a project."""
    __tablename__ = "project_hosting_configs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), unique=True, nullable=False)

    # Subdomain
    subdomain = Column(String(100), unique=True, nullable=False)  # "myproject" -> myproject.forma.app
    subdomain_verified = Column(Boolean, default=True)  # Always true for forma.app subdomains

    # Current deployment
    current_deployment_id = Column(GUID(), ForeignKey("deployments.id"), nullable=True)

    # Auto-deploy settings
    auto_deploy_enabled = Column(Boolean, default=False)  # Auto-deploy on save
    auto_deploy_branch = Column(String(100), default="main")  # For GitHub sync

    # Build settings
    build_command = Column(String(500), default="npm run build")
    output_directory = Column(String(255), default="out")
    node_version = Column(String(20), default="18")

    # Analytics
    analytics_enabled = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="hosting_config")
    current_deployment = relationship("Deployment", foreign_keys=[current_deployment_id])


# =============================================================================
# FORM BUILDER MODELS
# =============================================================================

class FormStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Form(Base):
    """Form definition for a project."""
    __tablename__ = "forms"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)

    # Form identity
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)  # URL-friendly identifier
    description = Column(Text)
    status = Column(Enum(FormStatus), default=FormStatus.DRAFT)

    # Form configuration
    fields = Column(JSON, nullable=False, default=list)  # Array of field definitions
    settings = Column(JSON, default=dict)  # Submit URL, redirect, notifications, etc.

    # Styling
    styles = Column(JSON, default=dict)  # Custom styling options

    # Success behavior
    success_message = Column(Text, default="Thank you for your submission!")
    redirect_url = Column(String(500))  # Optional redirect after submit

    # Notifications
    notify_email = Column(String(255))  # Email to notify on submission
    notify_enabled = Column(Boolean, default=True)

    # Spam protection
    recaptcha_enabled = Column(Boolean, default=False)
    honeypot_enabled = Column(Boolean, default=True)

    # Stats
    submission_count = Column(Integer, default=0)
    last_submission_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="forms")
    submissions = relationship("FormSubmission", back_populates="form", cascade="all, delete-orphan")


class FormSubmissionStatus(str, PyEnum):
    NEW = "new"
    READ = "read"
    ARCHIVED = "archived"
    SPAM = "spam"


# =============================================================================
# ANALYTICS MODELS
# =============================================================================

class PageView(Base):
    """Page view event for a deployed project."""
    __tablename__ = "page_views"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Page info
    page_path = Column(String(500), nullable=False)
    page_title = Column(String(255))

    # Visitor info (anonymized)
    visitor_id = Column(String(64), index=True)  # Hashed identifier
    session_id = Column(String(64), index=True)

    # Traffic source
    referrer = Column(String(500))
    referrer_domain = Column(String(255))
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(255))

    # Device info
    device_type = Column(String(20))  # desktop, mobile, tablet
    browser = Column(String(50))
    os = Column(String(50))
    screen_width = Column(Integer)

    # Location (country-level only for privacy)
    country = Column(String(2))  # ISO country code

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    project = relationship("Project", backref="page_views")


class AnalyticsEvent(Base):
    """Custom event tracking for deployed projects."""
    __tablename__ = "analytics_events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Event info
    event_name = Column(String(100), nullable=False, index=True)
    event_category = Column(String(50))  # click, form, purchase, etc.
    event_value = Column(Float)  # Optional numeric value

    # Context
    page_path = Column(String(500))
    visitor_id = Column(String(64))
    session_id = Column(String(64))

    # Additional data
    properties = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    project = relationship("Project", backref="analytics_events")


class AnalyticsSummary(Base):
    """Pre-aggregated analytics for performance."""
    __tablename__ = "analytics_summaries"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Time period
    period_date = Column(DateTime, nullable=False, index=True)  # Date of the summary
    period_type = Column(String(10), nullable=False)  # "day", "week", "month"

    # Metrics
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    sessions = Column(Integer, default=0)
    avg_session_duration = Column(Float, default=0)  # seconds
    bounce_rate = Column(Float, default=0)  # percentage

    # Top pages (JSON array)
    top_pages = Column(JSON, default=list)
    # Top referrers (JSON array)
    top_referrers = Column(JSON, default=list)
    # Device breakdown (JSON object)
    device_breakdown = Column(JSON, default=dict)
    # Country breakdown (JSON object)
    country_breakdown = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    project = relationship("Project", backref="analytics_summaries")


class FormSubmission(Base):
    """Submission to a form."""
    __tablename__ = "form_submissions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    form_id = Column(GUID(), ForeignKey("forms.id"), nullable=False)

    # Submission data
    data = Column(JSON, nullable=False)  # The actual form field values
    status = Column(Enum(FormSubmissionStatus), default=FormSubmissionStatus.NEW)

    # Metadata
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    referrer = Column(String(500))
    page_url = Column(String(500))  # Which page the form was on

    # Spam detection
    is_spam = Column(Boolean, default=False)
    spam_score = Column(Float, default=0.0)

    # Notes
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)

    # Relationships
    form = relationship("Form", back_populates="submissions")


# =============================================================================
# E-COMMERCE MODELS
# =============================================================================

class ProductStatus(str, PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    OUT_OF_STOCK = "out_of_stock"


class Product(Base):
    """Product for e-commerce sites."""
    __tablename__ = "products"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Product info
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)  # URL-friendly identifier
    description = Column(Text)
    long_description = Column(Text)  # Markdown supported

    # Pricing
    price_cents = Column(Integer, nullable=False)  # Price in cents
    compare_at_price_cents = Column(Integer)  # Original price (for sales)
    currency = Column(String(3), default="USD")

    # Inventory
    sku = Column(String(100))  # Stock keeping unit
    quantity = Column(Integer, default=0)  # Stock quantity (-1 for unlimited)
    track_inventory = Column(Boolean, default=False)

    # Status
    status = Column(Enum(ProductStatus), default=ProductStatus.DRAFT)

    # Media
    images = Column(JSON, default=list)  # Array of image URLs
    thumbnail_url = Column(String(500))

    # Variants (for products with options like size/color)
    variants = Column(JSON, default=list)  # Array of variant objects
    options = Column(JSON, default=list)  # Array of option definitions

    # Categorization
    category = Column(String(100))
    tags = Column(JSON, default=list)

    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)

    # Shipping
    weight_grams = Column(Integer)
    requires_shipping = Column(Boolean, default=True)

    # Stats
    view_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="products")
    order_items = relationship("OrderItem", back_populates="product")


class OrderStatus(str, PyEnum):
    PENDING = "pending"          # Order created, awaiting payment
    PAID = "paid"                # Payment received
    PROCESSING = "processing"    # Being prepared
    SHIPPED = "shipped"          # Shipped to customer
    DELIVERED = "delivered"      # Delivered to customer
    CANCELLED = "cancelled"      # Order cancelled
    REFUNDED = "refunded"        # Payment refunded


class Order(Base):
    """Order for e-commerce purchases."""
    __tablename__ = "orders"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Order number (human-readable)
    order_number = Column(String(50), unique=True, nullable=False)

    # Customer info
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255))
    customer_phone = Column(String(50))

    # Shipping address
    shipping_address_line1 = Column(String(255))
    shipping_address_line2 = Column(String(255))
    shipping_city = Column(String(100))
    shipping_state = Column(String(100))
    shipping_postal_code = Column(String(20))
    shipping_country = Column(String(2))  # ISO country code

    # Billing address (if different)
    billing_address_line1 = Column(String(255))
    billing_address_line2 = Column(String(255))
    billing_city = Column(String(100))
    billing_state = Column(String(100))
    billing_postal_code = Column(String(20))
    billing_country = Column(String(2))

    # Pricing
    subtotal_cents = Column(Integer, nullable=False)
    shipping_cents = Column(Integer, default=0)
    tax_cents = Column(Integer, default=0)
    discount_cents = Column(Integer, default=0)
    total_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD")

    # Payment
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    stripe_payment_intent_id = Column(String(255))
    stripe_checkout_session_id = Column(String(255))
    paid_at = Column(DateTime)

    # Shipping
    shipping_method = Column(String(100))
    tracking_number = Column(String(255))
    tracking_url = Column(String(500))
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)

    # Notes
    customer_notes = Column(Text)  # From customer
    internal_notes = Column(Text)  # For store owner

    # Metadata
    source = Column(String(50), default="web")  # web, api, manual
    ip_address = Column(String(50))
    user_agent = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Individual item in an order."""
    __tablename__ = "order_items"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID(), ForeignKey("orders.id"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id"), nullable=True)  # Nullable if product deleted

    # Product snapshot (in case product changes/deleted)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    variant_name = Column(String(255))  # e.g., "Large / Blue"

    # Pricing
    unit_price_cents = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    total_cents = Column(Integer, nullable=False)

    # Image (snapshot)
    image_url = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# =============================================================================
# SITE AUTH MODELS (For deployed sites)
# =============================================================================

class SiteUser(Base):
    """User account for a deployed site (project-scoped)."""
    __tablename__ = "site_users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Auth credentials
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Profile
    name = Column(String(255))
    avatar_url = Column(String(500))
    phone = Column(String(50))

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)

    # OAuth (optional)
    google_id = Column(String(255))
    github_id = Column(String(255))

    # Custom data
    custom_data = Column(JSON, default=dict)  # Custom fields

    # Password reset
    reset_token = Column(String(255))
    reset_token_expires = Column(DateTime)

    # Stats
    last_login_at = Column(DateTime)
    login_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="site_users")
    sessions = relationship("SiteSession", back_populates="user", cascade="all, delete-orphan")

    # Unique email per project
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class SiteSession(Base):
    """Session for site user authentication."""
    __tablename__ = "site_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("site_users.id"), nullable=False, index=True)

    # Token
    token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True)

    # Device/session info
    device_info = Column(String(500))
    ip_address = Column(String(50))
    user_agent = Column(String(500))

    # Expiration
    expires_at = Column(DateTime, nullable=False)
    refresh_expires_at = Column(DateTime)

    # Status
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("SiteUser", back_populates="sessions")


# =============================================================================
# BLOG/CMS MODELS
# =============================================================================

class BlogPostStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"
    ARCHIVED = "archived"


class BlogCategory(Base):
    """Blog category for organizing posts."""
    __tablename__ = "blog_categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Hex color
    icon = Column(String(50))  # Icon name

    # Hierarchy
    parent_id = Column(GUID(), ForeignKey("blog_categories.id"), nullable=True)
    position = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="blog_categories")
    parent = relationship("BlogCategory", remote_side=[id], backref="children")
    posts = relationship("BlogPost", back_populates="category")


class BlogPost(Base):
    """Blog post for CMS functionality."""
    __tablename__ = "blog_posts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    category_id = Column(GUID(), ForeignKey("blog_categories.id"), nullable=True)
    author_id = Column(GUID(), ForeignKey("site_users.id"), nullable=True)

    # Content
    title = Column(String(500), nullable=False)
    slug = Column(String(500), nullable=False, index=True)
    excerpt = Column(Text)  # Short summary
    content = Column(Text)  # Markdown content
    content_html = Column(Text)  # Rendered HTML

    # Media
    featured_image = Column(String(500))
    images = Column(JSON, default=list)  # Gallery images

    # Status
    status = Column(Enum(BlogPostStatus), default=BlogPostStatus.DRAFT)
    published_at = Column(DateTime)
    scheduled_for = Column(DateTime)

    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)
    og_image = Column(String(500))
    canonical_url = Column(String(500))

    # Tags
    tags = Column(JSON, default=list)  # Array of tag strings

    # Settings
    allow_comments = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)

    # Stats
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)

    # Reading time (calculated)
    reading_time_minutes = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="blog_posts")
    category = relationship("BlogCategory", back_populates="posts")
    author = relationship("SiteUser", backref="blog_posts")
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")


class BlogComment(Base):
    """Comment on a blog post."""
    __tablename__ = "blog_comments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("blog_posts.id"), nullable=False, index=True)
    author_id = Column(GUID(), ForeignKey("site_users.id"), nullable=True)
    parent_id = Column(GUID(), ForeignKey("blog_comments.id"), nullable=True)

    # Author info (for guest comments)
    author_name = Column(String(100))
    author_email = Column(String(255))
    author_website = Column(String(500))

    # Content
    content = Column(Text, nullable=False)

    # Status
    is_approved = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)

    # Metadata
    ip_address = Column(String(50))
    user_agent = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = relationship("BlogPost", back_populates="comments")
    author = relationship("SiteUser", backref="blog_comments")
    parent = relationship("BlogComment", remote_side=[id], backref="replies")


# =============================================================================
# API KEYS AND WEBHOOKS
# =============================================================================

class WebhookEvent(str, PyEnum):
    """Events that can trigger webhooks."""
    # Form events
    FORM_SUBMISSION = "form.submission"

    # E-commerce events
    ORDER_CREATED = "order.created"
    ORDER_PAID = "order.paid"
    ORDER_SHIPPED = "order.shipped"
    ORDER_COMPLETED = "order.completed"
    ORDER_CANCELLED = "order.cancelled"
    ORDER_REFUNDED = "order.refunded"

    # User events
    USER_REGISTERED = "user.registered"
    USER_LOGGED_IN = "user.logged_in"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"

    # Blog events
    POST_PUBLISHED = "blog.post_published"
    POST_UPDATED = "blog.post_updated"
    COMMENT_CREATED = "blog.comment_created"

    # Deployment events
    DEPLOYMENT_STARTED = "deployment.started"
    DEPLOYMENT_COMPLETED = "deployment.completed"
    DEPLOYMENT_FAILED = "deployment.failed"


class APIKey(Base):
    """API key for programmatic access to project data."""
    __tablename__ = "api_keys"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Key info
    name = Column(String(100), nullable=False)  # Human-readable name
    key_prefix = Column(String(8), nullable=False)  # First 8 chars of key (for identification)
    key_hash = Column(String(255), nullable=False)  # SHA-256 hash of full key

    # Permissions (scopes)
    scopes = Column(JSON, default=list)  # ['read:products', 'write:orders', etc.]

    # Rate limiting
    rate_limit_per_minute = Column(Integer, default=60)

    # Status
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    # Relationships
    project = relationship("Project", backref="api_keys")
    created_by = relationship("User", backref="created_api_keys")


class Webhook(Base):
    """Webhook configuration for sending events to external URLs."""
    __tablename__ = "webhooks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Webhook config
    name = Column(String(100), nullable=False)
    url = Column(String(2000), nullable=False)
    secret = Column(String(255), nullable=False)  # For signing payloads

    # Events to subscribe to
    events = Column(JSON, default=list)  # List of WebhookEvent values

    # Headers to send with requests
    headers = Column(JSON, default=dict)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Set after successful delivery

    # Stats
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    last_triggered_at = Column(DateTime, nullable=True)
    last_success_at = Column(DateTime, nullable=True)
    last_failure_at = Column(DateTime, nullable=True)
    last_failure_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="webhooks")
    created_by = relationship("User", backref="created_webhooks")
    deliveries = relationship("WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan")


class WebhookDeliveryStatus(str, PyEnum):
    """Status of a webhook delivery attempt."""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    RETRYING = "retrying"


class WebhookDelivery(Base):
    """Log of webhook delivery attempts."""
    __tablename__ = "webhook_deliveries"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    webhook_id = Column(GUID(), ForeignKey("webhooks.id"), nullable=False, index=True)

    # Event info
    event_type = Column(String(50), nullable=False)
    event_id = Column(GUID(), default=uuid.uuid4)  # Unique ID for this event

    # Request
    request_url = Column(String(2000), nullable=False)
    request_headers = Column(JSON, default=dict)
    request_body = Column(Text, nullable=False)

    # Response
    response_status = Column(Integer, nullable=True)
    response_headers = Column(JSON, nullable=True)
    response_body = Column(Text, nullable=True)
    response_time_ms = Column(Integer, nullable=True)

    # Status
    status = Column(Enum(WebhookDeliveryStatus), default=WebhookDeliveryStatus.PENDING)
    error_message = Column(Text, nullable=True)

    # Retry info
    attempt_number = Column(Integer, default=1)
    next_retry_at = Column(DateTime, nullable=True)
    max_retries = Column(Integer, default=3)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    webhook = relationship("Webhook", back_populates="deliveries")


# =============================================================================
# SEO SETTINGS
# =============================================================================

class SEOSettings(Base):
    """Global SEO settings for a project."""
    __tablename__ = "seo_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True, index=True)

    # Global defaults
    default_title_template = Column(String(255), default="{page_title} | {site_name}")
    default_description = Column(Text)
    default_keywords = Column(Text)  # Comma-separated

    # Site info
    site_name = Column(String(255))
    site_logo_url = Column(String(500))
    site_language = Column(String(10), default="en")
    site_locale = Column(String(10), default="en_US")

    # Social
    twitter_handle = Column(String(50))  # @username
    facebook_app_id = Column(String(50))

    # Open Graph defaults
    og_type = Column(String(50), default="website")
    og_image_url = Column(String(500))
    og_image_width = Column(Integer, default=1200)
    og_image_height = Column(Integer, default=630)

    # Twitter Card defaults
    twitter_card_type = Column(String(50), default="summary_large_image")
    twitter_image_url = Column(String(500))

    # Structured data (JSON-LD)
    organization_name = Column(String(255))
    organization_logo_url = Column(String(500))
    organization_url = Column(String(500))
    organization_social_profiles = Column(JSON, default=list)  # List of URLs

    # Contact info for local business schema
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_state = Column(String(100))
    address_postal = Column(String(20))
    address_country = Column(String(100))

    # Robots
    robots_txt_content = Column(Text)
    allow_indexing = Column(Boolean, default=True)
    allow_follow = Column(Boolean, default=True)

    # Sitemap
    sitemap_enabled = Column(Boolean, default=True)
    sitemap_change_freq = Column(String(20), default="weekly")  # daily, weekly, monthly
    sitemap_priority = Column(Float, default=0.5)

    # Verification codes
    google_site_verification = Column(String(100))
    bing_site_verification = Column(String(100))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="seo_settings", uselist=False)


class PageSEO(Base):
    """Page-specific SEO settings."""
    __tablename__ = "page_seo"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    page_id = Column(GUID(), ForeignKey("pages.id"), nullable=False, unique=True, index=True)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Meta tags
    title = Column(String(70))  # Recommended max 60 chars
    description = Column(String(320))  # Recommended max 160 chars
    keywords = Column(Text)  # Comma-separated
    canonical_url = Column(String(500))

    # Robots
    noindex = Column(Boolean, default=False)
    nofollow = Column(Boolean, default=False)
    noarchive = Column(Boolean, default=False)
    nosnippet = Column(Boolean, default=False)

    # Open Graph
    og_title = Column(String(95))
    og_description = Column(String(300))
    og_image_url = Column(String(500))
    og_type = Column(String(50))  # article, product, etc.

    # Twitter Card
    twitter_title = Column(String(70))
    twitter_description = Column(String(200))
    twitter_image_url = Column(String(500))
    twitter_card_type = Column(String(50))

    # Structured data (page-specific JSON-LD)
    structured_data = Column(JSON)  # Custom JSON-LD for this page

    # Sitemap
    sitemap_priority = Column(Float)
    sitemap_change_freq = Column(String(20))
    exclude_from_sitemap = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    page = relationship("Page", backref="seo", uselist=False)
    project = relationship("Project", backref="page_seo_entries")


# =============================================================================
# EMAIL TEMPLATES
# =============================================================================

class EmailTemplateType(str, PyEnum):
    """Types of email templates."""
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    FORM_SUBMISSION = "form_submission"
    FORM_CONFIRMATION = "form_confirmation"
    COMMENT_NOTIFICATION = "comment_notification"
    CUSTOM = "custom"


class EmailTemplate(Base):
    """Email template for a project."""
    __tablename__ = "email_templates"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Template info
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)  # For programmatic reference
    template_type = Column(Enum(EmailTemplateType), nullable=False)
    description = Column(Text)

    # Email content
    subject = Column(String(255), nullable=False)
    html_body = Column(Text, nullable=False)
    text_body = Column(Text)  # Plain text version

    # Sender info
    from_name = Column(String(100))
    from_email = Column(String(255))
    reply_to = Column(String(255))

    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Default template for this type

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="email_templates")


class EmailProviderType(str, PyEnum):
    """Supported email providers."""
    SMTP = "smtp"
    SENDGRID = "sendgrid"
    MAILGUN = "mailgun"
    SES = "ses"
    RESEND = "resend"


class EmailSettings(Base):
    """Email provider settings for a project."""
    __tablename__ = "email_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True, index=True)

    # Provider configuration
    provider = Column(Enum(EmailProviderType), default=EmailProviderType.SMTP)

    # SMTP settings
    smtp_host = Column(String(255))
    smtp_port = Column(Integer, default=587)
    smtp_username = Column(String(255))
    smtp_password = Column(String(255))  # Should be encrypted
    smtp_use_tls = Column(Boolean, default=True)

    # API key (for SendGrid, Mailgun, etc.)
    api_key = Column(String(500))  # Should be encrypted
    api_domain = Column(String(255))  # For Mailgun

    # Default sender
    default_from_name = Column(String(100))
    default_from_email = Column(String(255))
    default_reply_to = Column(String(255))

    # Status
    is_configured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="email_settings", uselist=False)


class EmailLogStatus(str, PyEnum):
    """Status of email delivery."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"
    SPAM = "spam"


class EmailLog(Base):
    """Log of sent emails."""
    __tablename__ = "email_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    template_id = Column(GUID(), ForeignKey("email_templates.id"), nullable=True)

    # Email details
    to_email = Column(String(255), nullable=False, index=True)
    to_name = Column(String(100))
    from_email = Column(String(255), nullable=False)
    from_name = Column(String(100))
    reply_to = Column(String(255))

    # Content
    subject = Column(String(255), nullable=False)
    html_body = Column(Text)
    text_body = Column(Text)

    # Status
    status = Column(Enum(EmailLogStatus), default=EmailLogStatus.PENDING)
    error_message = Column(Text)
    provider_message_id = Column(String(255))  # ID from provider

    # Metadata
    template_type = Column(String(50))
    context_data = Column(JSON)  # Variables used for rendering
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    opened_at = Column(DateTime)
    clicked_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="email_logs")
    template = relationship("EmailTemplate", backref="logs")


# =============================================================================
# A/B TESTING
# =============================================================================

class ExperimentStatus(str, PyEnum):
    """Status of an A/B experiment."""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Experiment(Base):
    """A/B test experiment."""
    __tablename__ = "experiments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Experiment info
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text)

    # Target
    target_page_id = Column(GUID(), ForeignKey("pages.id"), nullable=True)  # Specific page
    target_url_pattern = Column(String(255))  # URL pattern to match

    # Goals
    primary_goal = Column(String(50))  # 'click', 'form_submit', 'purchase', 'custom'
    primary_goal_selector = Column(String(255))  # CSS selector for click goal
    secondary_goals = Column(JSON, default=list)

    # Traffic allocation
    traffic_percentage = Column(Integer, default=100)  # % of visitors to include

    # Status
    status = Column(Enum(ExperimentStatus), default=ExperimentStatus.DRAFT)

    # Timing
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    # Statistical settings
    confidence_level = Column(Float, default=0.95)  # 95% confidence
    minimum_sample_size = Column(Integer, default=100)  # Per variant

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="experiments")
    target_page = relationship("Page", backref="experiments")
    variants = relationship("ExperimentVariant", back_populates="experiment", cascade="all, delete-orphan")


class ExperimentVariant(Base):
    """Variant in an A/B experiment."""
    __tablename__ = "experiment_variants"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(GUID(), ForeignKey("experiments.id"), nullable=False, index=True)

    # Variant info
    name = Column(String(100), nullable=False)
    slug = Column(String(50), nullable=False)  # 'control', 'variant_a', etc.
    description = Column(Text)

    # Traffic weight (e.g., 50 for 50%)
    weight = Column(Integer, default=50)

    # Control flag
    is_control = Column(Boolean, default=False)

    # Changes (what differs from control)
    changes = Column(JSON, default=dict)  # Component prop overrides

    # Stats
    visitors = Column(Integer, default=0)
    conversions = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    experiment = relationship("Experiment", back_populates="variants")


class ExperimentAssignment(Base):
    """Visitor assignment to experiment variant."""
    __tablename__ = "experiment_assignments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(GUID(), ForeignKey("experiments.id"), nullable=False, index=True)
    variant_id = Column(GUID(), ForeignKey("experiment_variants.id"), nullable=False)

    # Visitor identification
    visitor_id = Column(String(100), nullable=False, index=True)  # Anonymous ID or user ID

    # Assignment
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Conversion
    converted = Column(Boolean, default=False)
    converted_at = Column(DateTime, nullable=True)
    conversion_value = Column(Float, nullable=True)  # For revenue goals

    # Relationships
    experiment = relationship("Experiment", backref="assignments")
    variant = relationship("ExperimentVariant", backref="assignments")


# =============================================================================
# MEDIA LIBRARY
# =============================================================================

class MediaType(str, PyEnum):
    """Types of media files."""
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    OTHER = "other"


class MediaFolder(Base):
    """Folder in media library."""
    __tablename__ = "media_folders"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    parent_id = Column(GUID(), ForeignKey("media_folders.id"), nullable=True)

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)
    path = Column(String(500), nullable=False)  # Full path: /images/products

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="media_folders")
    parent = relationship("MediaFolder", remote_side=[id], backref="children")


class MediaFile(Base):
    """Media file in library."""
    __tablename__ = "media_files"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    folder_id = Column(GUID(), ForeignKey("media_folders.id"), nullable=True, index=True)

    # File info
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    media_type = Column(Enum(MediaType), nullable=False)
    file_size = Column(Integer, nullable=False)  # In bytes

    # Storage
    storage_path = Column(String(500), nullable=False)  # Path on disk/S3
    url = Column(String(500), nullable=False)  # Public URL
    cdn_url = Column(String(500))  # CDN URL if available

    # Image dimensions
    width = Column(Integer)
    height = Column(Integer)

    # Variants (for images)
    variants = Column(JSON, default=dict)  # {thumb: {url, width, height}, medium: {...}}

    # Metadata
    alt_text = Column(String(255))
    caption = Column(Text)
    tags = Column(JSON, default=list)

    # Usage tracking
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="media_files")
    folder = relationship("MediaFolder", backref="files")


# =============================================================================
# VERSION HISTORY MODELS
# =============================================================================

class VersionType(str, PyEnum):
    AUTO = "auto"           # Automatic save
    MANUAL = "manual"       # User-created checkpoint
    PUBLISH = "publish"     # Created on publish
    RESTORE = "restore"     # Created when restoring


class PageVersion(Base):
    """Version history for pages."""
    __tablename__ = "page_versions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    page_id = Column(GUID(), ForeignKey("pages.id"), nullable=False, index=True)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Version info
    version_number = Column(Integer, nullable=False)
    version_type = Column(Enum(VersionType), default=VersionType.AUTO)
    name = Column(String(255))  # Optional user-provided name
    description = Column(Text)  # What changed in this version

    # Snapshot of page state
    canvas_components = Column(JSON, nullable=False)  # Full snapshot
    page_settings = Column(JSON)  # meta_title, meta_description, layout, etc.

    # Change metadata
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    file_size = Column(Integer)  # Size of snapshot in bytes

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    page = relationship("Page", backref="versions")
    project = relationship("Project", backref="page_versions")
    created_by = relationship("User", backref="page_versions")


class ComponentVersion(Base):
    """Version history for reusable components."""
    __tablename__ = "component_versions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    component_id = Column(GUID(), ForeignKey("components.id"), nullable=False, index=True)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Version info
    version_number = Column(Integer, nullable=False)
    version_type = Column(Enum(VersionType), default=VersionType.AUTO)
    name = Column(String(255))
    description = Column(Text)

    # Snapshot of component state
    code = Column(Text, nullable=False)
    props_schema = Column(JSON)
    intent = Column(Text)

    # Change metadata
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    file_size = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    component = relationship("Component", backref="component_versions")
    project = relationship("Project", backref="component_versions")
    created_by = relationship("User", backref="component_versions")


# =============================================================================
# COMMENTS AND COLLABORATION MODELS
# =============================================================================

class CommentTargetType(str, PyEnum):
    PAGE = "page"
    COMPONENT = "component"
    PROJECT = "project"


class CommentStatus(str, PyEnum):
    OPEN = "open"
    RESOLVED = "resolved"


class Comment(Base):
    """Comment on a page, component, or project."""
    __tablename__ = "comments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # What is being commented on
    target_type = Column(Enum(CommentTargetType), nullable=False)
    target_id = Column(GUID(), nullable=False, index=True)  # page_id, component_id, or project_id

    # For component-level comments: specific element on canvas
    canvas_element_id = Column(String(100))  # ID of specific element if commenting on canvas

    # Position (for pinned comments on canvas)
    position_x = Column(Float)
    position_y = Column(Float)

    # Thread structure
    parent_id = Column(GUID(), ForeignKey("comments.id"), nullable=True, index=True)

    # Author
    author_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Content
    content = Column(Text, nullable=False)
    content_html = Column(Text)  # Rendered with @mentions

    # Status
    status = Column(Enum(CommentStatus), default=CommentStatus.OPEN)
    resolved_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime)

    # Metadata
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="comments")
    author = relationship("User", foreign_keys=[author_id], backref="authored_comments")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id], backref="resolved_comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
    mentions = relationship("CommentMention", back_populates="comment", cascade="all, delete-orphan")
    reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")


class CommentMention(Base):
    """Track @mentions in comments."""
    __tablename__ = "comment_mentions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    comment_id = Column(GUID(), ForeignKey("comments.id"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    # Notification status
    notified = Column(Boolean, default=False)
    notified_at = Column(DateTime)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    comment = relationship("Comment", back_populates="mentions")
    user = relationship("User", backref="comment_mentions")


class ReactionType(str, PyEnum):
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    HEART = "heart"
    CELEBRATE = "celebrate"
    THINKING = "thinking"
    EYES = "eyes"


class CommentReaction(Base):
    """Reactions on comments."""
    __tablename__ = "comment_reactions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    comment_id = Column(GUID(), ForeignKey("comments.id"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    reaction_type = Column(Enum(ReactionType), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    comment = relationship("Comment", back_populates="reactions")
    user = relationship("User", backref="comment_reactions")


# =============================================================================
# DESIGN SYSTEM / THEME MODELS
# =============================================================================

class DesignSystem(Base):
    """Project design system with tokens."""
    __tablename__ = "design_systems"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True, index=True)

    name = Column(String(100), default="Default")
    description = Column(Text)

    # Color tokens
    colors = Column(JSON, default=dict)  # {primary: {50, 100, ..., 900}, secondary, ...}

    # Typography
    typography = Column(JSON, default=dict)  # {fontFamilies, fontSizes, fontWeights, lineHeights}

    # Spacing
    spacing = Column(JSON, default=dict)  # {xs, sm, md, lg, xl, 2xl, ...}

    # Border radius
    radii = Column(JSON, default=dict)  # {none, sm, md, lg, xl, full}

    # Shadows
    shadows = Column(JSON, default=dict)  # {sm, md, lg, xl, inner}

    # Breakpoints
    breakpoints = Column(JSON, default=dict)  # {sm, md, lg, xl, 2xl}

    # Z-index scale
    z_indices = Column(JSON, default=dict)  # {dropdown, modal, toast, tooltip}

    # Animation
    transitions = Column(JSON, default=dict)  # {fast, normal, slow}

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="design_system_obj", uselist=False)
    themes = relationship("Theme", back_populates="design_system", cascade="all, delete-orphan")


class Theme(Base):
    """Individual theme within a design system."""
    __tablename__ = "themes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    design_system_id = Column(GUID(), ForeignKey("design_systems.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)  # "Light", "Dark", "Custom"
    slug = Column(String(100), nullable=False)  # "light", "dark"
    description = Column(Text)

    # Is this the default theme?
    is_default = Column(Boolean, default=False)

    # Color mode
    color_mode = Column(String(20), default="light")  # "light" or "dark"

    # Theme-specific color overrides (semantic tokens)
    colors = Column(JSON, default=dict)  # {background, foreground, muted, accent, ...}

    # Other semantic tokens
    semantic_tokens = Column(JSON, default=dict)  # {card, popover, border, input, ring}

    # CSS variables output
    css_variables = Column(Text)  # Pre-generated CSS

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    design_system = relationship("DesignSystem", back_populates="themes")


class ComponentStyle(Base):
    """Reusable component style preset."""
    __tablename__ = "component_styles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    design_system_id = Column(GUID(), ForeignKey("design_systems.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    component_type = Column(String(50), nullable=False)  # "button", "card", "input"
    variant = Column(String(50), default="default")  # "primary", "secondary", "outline"

    # Style properties
    styles = Column(JSON, nullable=False)  # {backgroundColor, padding, borderRadius, ...}

    # Responsive variants
    responsive = Column(JSON, default=dict)  # {sm: {...}, md: {...}}

    # State variants
    states = Column(JSON, default=dict)  # {hover: {...}, active: {...}, disabled: {...}}

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    design_system = relationship("DesignSystem", backref="component_styles")


# =============================================================================
# SCHEDULED PUBLISHING MODELS
# =============================================================================

class ScheduledItemType(str, PyEnum):
    PAGE = "page"
    BLOG_POST = "blog_post"
    SITE = "site"  # Full site deployment


class ScheduledItemStatus(str, PyEnum):
    PENDING = "pending"
    PUBLISHED = "published"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScheduledPublish(Base):
    """Scheduled publication item."""
    __tablename__ = "scheduled_publishes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # What to publish
    item_type = Column(Enum(ScheduledItemType), nullable=False)
    item_id = Column(GUID(), nullable=True, index=True)  # page_id or blog_post_id (null for full site)

    # When to publish
    scheduled_at = Column(DateTime, nullable=False, index=True)
    timezone = Column(String(50), default="UTC")

    # Status tracking
    status = Column(Enum(ScheduledItemStatus), default=ScheduledItemStatus.PENDING)
    published_at = Column(DateTime)
    error_message = Column(Text)

    # What to do
    action = Column(String(50), default="publish")  # "publish", "unpublish", "update"

    # Snapshot of content at schedule time (for review)
    content_snapshot = Column(JSON)

    # Who scheduled it
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Notes
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="scheduled_publishes")
    created_by = relationship("User", backref="scheduled_publishes")


class PublishHistory(Base):
    """History of all publications."""
    __tablename__ = "publish_history"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # What was published
    item_type = Column(Enum(ScheduledItemType), nullable=False)
    item_id = Column(GUID(), nullable=True)
    item_name = Column(String(255))  # For display

    # Trigger
    trigger = Column(String(50))  # "manual", "scheduled", "api"
    scheduled_publish_id = Column(GUID(), ForeignKey("scheduled_publishes.id"), nullable=True)

    # Result
    success = Column(Boolean, nullable=False)
    error_message = Column(Text)
    deployment_id = Column(GUID(), ForeignKey("deployments.id"), nullable=True)

    # Metadata
    published_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    duration_ms = Column(Integer)  # How long the publish took

    published_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="publish_history")
    published_by = relationship("User", backref="publish_history")
    scheduled_publish = relationship("ScheduledPublish", backref="history")
    deployment = relationship("Deployment", backref="publish_history")


# =============================================================================
# IMPORT/EXPORT MODELS
# =============================================================================

class ExportStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ExportFormat(str, PyEnum):
    ZIP = "zip"
    JSON = "json"


class ProjectExport(Base):
    """Record of project exports."""
    __tablename__ = "project_exports"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Export configuration
    format = Column(Enum(ExportFormat), default=ExportFormat.ZIP)
    include_assets = Column(Boolean, default=True)
    include_history = Column(Boolean, default=False)

    # Status
    status = Column(Enum(ExportStatus), default=ExportStatus.PENDING)
    progress = Column(Integer, default=0)  # 0-100
    error_message = Column(Text)

    # Output
    file_path = Column(String(500))  # Path to export file
    file_size = Column(Integer)  # Size in bytes
    download_url = Column(String(500))
    expires_at = Column(DateTime)  # When download link expires

    # Metadata
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", backref="exports")
    created_by = relationship("User", backref="project_exports")


class ImportStatus(str, PyEnum):
    PENDING = "pending"
    VALIDATING = "validating"
    IMPORTING = "importing"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectImport(Base):
    """Record of project imports."""
    __tablename__ = "project_imports"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # Target project (created on successful import)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=True)

    # Source
    source_type = Column(String(50), nullable=False)  # "zip", "figma", "url"
    source_file = Column(String(500))  # Uploaded file path
    source_url = Column(String(500))  # For URL imports

    # Import options
    import_name = Column(String(255))  # Name for imported project
    overwrite_existing = Column(Boolean, default=False)

    # Status
    status = Column(Enum(ImportStatus), default=ImportStatus.PENDING)
    progress = Column(Integer, default=0)
    error_message = Column(Text)

    # Results
    items_imported = Column(JSON, default=dict)  # {pages: 5, components: 10, ...}
    warnings = Column(JSON, default=list)

    # Metadata
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", backref="imports")
    created_by = relationship("User", backref="project_imports")


# =============================================================================
# PERFORMANCE MONITORING MODELS
# =============================================================================

class PerformanceMetric(Base):
    """Individual performance metric measurement."""
    __tablename__ = "performance_metrics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    page_id = Column(GUID(), ForeignKey("pages.id"), nullable=True, index=True)

    # Measurement context
    url = Column(String(500), nullable=False)
    device_type = Column(String(20), default="desktop")  # "desktop", "mobile"
    connection_type = Column(String(20))  # "4g", "3g", "wifi"

    # Core Web Vitals
    lcp = Column(Float)  # Largest Contentful Paint (ms)
    fid = Column(Float)  # First Input Delay (ms)
    cls = Column(Float)  # Cumulative Layout Shift
    inp = Column(Float)  # Interaction to Next Paint (ms)
    ttfb = Column(Float)  # Time to First Byte (ms)
    fcp = Column(Float)  # First Contentful Paint (ms)

    # Additional metrics
    speed_index = Column(Float)  # Speed Index
    time_to_interactive = Column(Float)  # TTI (ms)
    total_blocking_time = Column(Float)  # TBT (ms)
    dom_content_loaded = Column(Float)  # DOMContentLoaded (ms)
    load_time = Column(Float)  # Full load time (ms)

    # Resource metrics
    total_size_bytes = Column(Integer)  # Total page size
    html_size_bytes = Column(Integer)
    css_size_bytes = Column(Integer)
    js_size_bytes = Column(Integer)
    image_size_bytes = Column(Integer)
    font_size_bytes = Column(Integer)

    # Request counts
    total_requests = Column(Integer)
    js_requests = Column(Integer)
    css_requests = Column(Integer)
    image_requests = Column(Integer)
    font_requests = Column(Integer)

    # Scores (0-100)
    performance_score = Column(Integer)
    accessibility_score = Column(Integer)
    best_practices_score = Column(Integer)
    seo_score = Column(Integer)

    # Source of measurement
    source = Column(String(50), default="synthetic")  # "synthetic", "rum", "lighthouse"

    # User agent / browser info (for RUM)
    user_agent = Column(String(500))
    browser = Column(String(50))
    os = Column(String(50))

    # Geographic info
    country = Column(String(2))
    region = Column(String(100))

    measured_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    project = relationship("Project", backref="performance_metrics")
    page = relationship("Page", backref="performance_metrics")


class PerformanceBudget(Base):
    """Performance budget thresholds for a project."""
    __tablename__ = "performance_budgets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True)

    # Core Web Vitals thresholds
    lcp_warning = Column(Float, default=2500)  # Yellow threshold
    lcp_error = Column(Float, default=4000)  # Red threshold
    fid_warning = Column(Float, default=100)
    fid_error = Column(Float, default=300)
    cls_warning = Column(Float, default=0.1)
    cls_error = Column(Float, default=0.25)

    # Size budgets (bytes)
    total_size_warning = Column(Integer, default=1000000)  # 1MB
    total_size_error = Column(Integer, default=2000000)  # 2MB
    js_size_warning = Column(Integer, default=300000)  # 300KB
    js_size_error = Column(Integer, default=500000)  # 500KB
    image_size_warning = Column(Integer, default=500000)  # 500KB
    image_size_error = Column(Integer, default=1000000)  # 1MB

    # Score thresholds
    performance_score_warning = Column(Integer, default=50)
    performance_score_error = Column(Integer, default=30)

    # Alert settings
    alert_on_warning = Column(Boolean, default=False)
    alert_on_error = Column(Boolean, default=True)
    alert_email = Column(String(255))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="performance_budget", uselist=False)


class PerformanceAlert(Base):
    """Performance budget violation alerts."""
    __tablename__ = "performance_alerts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    metric_id = Column(GUID(), ForeignKey("performance_metrics.id"), nullable=False)

    # Alert details
    metric_name = Column(String(50), nullable=False)  # "lcp", "cls", "total_size", etc.
    threshold_type = Column(String(20), nullable=False)  # "warning", "error"
    threshold_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    url = Column(String(500))

    # Status
    acknowledged = Column(Boolean, default=False)
    acknowledged_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="performance_alerts")
    metric = relationship("PerformanceMetric", backref="alerts")
    acknowledged_by = relationship("User", backref="acknowledged_alerts")


# =============================================================================
# NOTIFICATIONS SYSTEM
# =============================================================================

class NotificationType(str, PyEnum):
    COMMENT = "comment"
    MENTION = "mention"
    REPLY = "reply"
    TEAM_INVITE = "team_invite"
    TEAM_JOIN = "team_join"
    DEPLOYMENT = "deployment"
    DEPLOYMENT_FAILED = "deployment_failed"
    PUBLISH = "publish"
    PERFORMANCE_ALERT = "performance_alert"
    FORM_SUBMISSION = "form_submission"
    ORDER = "order"
    SYSTEM = "system"


class NotificationPriority(str, PyEnum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    """User notification."""
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    # Notification type and priority
    notification_type = Column(Enum(NotificationType), nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)

    # Content
    title = Column(String(255), nullable=False)
    message = Column(Text)
    icon = Column(String(50))  # Icon name or emoji

    # Related entities
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=True, index=True)
    related_type = Column(String(50))  # "comment", "deployment", "order", etc.
    related_id = Column(GUID())  # ID of related entity

    # Action link
    action_url = Column(String(500))  # URL to navigate to
    action_label = Column(String(100))  # Button text

    # Sender (if from another user)
    sender_id = Column(GUID(), ForeignKey("users.id"), nullable=True)

    # Status
    read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime)
    archived = Column(Boolean, default=False)
    archived_at = Column(DateTime)

    # Delivery
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime)
    push_sent = Column(Boolean, default=False)
    push_sent_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="notifications")
    project = relationship("Project", backref="notifications")
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_notifications")


class NotificationPreference(Base):
    """User notification preferences."""
    __tablename__ = "notification_preferences"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, unique=True)

    # In-app notifications (always on, but can filter)
    in_app_enabled = Column(Boolean, default=True)

    # Email notifications
    email_enabled = Column(Boolean, default=True)
    email_comments = Column(Boolean, default=True)
    email_mentions = Column(Boolean, default=True)
    email_deployments = Column(Boolean, default=True)
    email_team = Column(Boolean, default=True)
    email_performance = Column(Boolean, default=False)
    email_forms = Column(Boolean, default=True)
    email_orders = Column(Boolean, default=True)
    email_digest = Column(String(20), default="daily")  # "none", "daily", "weekly"

    # Push notifications
    push_enabled = Column(Boolean, default=False)
    push_comments = Column(Boolean, default=True)
    push_mentions = Column(Boolean, default=True)
    push_deployments = Column(Boolean, default=True)

    # Quiet hours
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5))  # "22:00"
    quiet_hours_end = Column(String(5))  # "08:00"
    timezone = Column(String(50), default="UTC")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="notification_preferences", uselist=False)


# =============================================================================
# ACTIVITY LOG / AUDIT TRAIL
# =============================================================================

class ActivityAction(str, PyEnum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    PUBLISH = "publish"
    UNPUBLISH = "unpublish"
    DEPLOY = "deploy"
    RESTORE = "restore"
    IMPORT = "import"
    EXPORT = "export"
    INVITE = "invite"
    JOIN = "join"
    LEAVE = "leave"
    LOGIN = "login"
    LOGOUT = "logout"
    SETTINGS_CHANGE = "settings_change"


class ActivityLog(Base):
    """Audit trail for project activities."""
    __tablename__ = "activity_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=True, index=True)

    # Action details
    action = Column(Enum(ActivityAction), nullable=False)
    entity_type = Column(String(50), nullable=False)  # "page", "component", "project", etc.
    entity_id = Column(GUID(), nullable=True)
    entity_name = Column(String(255))  # Human-readable name

    # Change details
    description = Column(Text)  # Human-readable description
    changes = Column(JSON)  # {field: {old: x, new: y}, ...}
    activity_metadata = Column("metadata", JSON, default=dict)  # Additional context

    # Request context
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    request_id = Column(String(100))  # For correlating related changes

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    project = relationship("Project", backref="activity_logs")
    user = relationship("User", backref="activity_logs")


# =============================================================================
# LOCALIZATION / I18N
# =============================================================================

class LocaleSettings(Base):
    """Project localization settings."""
    __tablename__ = "locale_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True)

    # Default locale
    default_locale = Column(String(10), default="en")  # e.g., "en", "es", "fr"

    # Enabled locales
    enabled_locales = Column(JSON, default=list)  # ["en", "es", "fr", "de"]

    # Detection settings
    auto_detect = Column(Boolean, default=True)  # Auto-detect from browser
    fallback_locale = Column(String(10), default="en")

    # URL strategy
    url_strategy = Column(String(20), default="path")  # "path" (/en/about), "subdomain" (en.example.com), "query" (?lang=en)

    # RTL locales
    rtl_locales = Column(JSON, default=list)  # ["ar", "he", "fa"]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="locale_settings", uselist=False)
    translations = relationship("Translation", back_populates="locale_settings", cascade="all, delete-orphan")


class Translation(Base):
    """Translation string."""
    __tablename__ = "translations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    locale_settings_id = Column(GUID(), ForeignKey("locale_settings.id"), nullable=False, index=True)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Translation key
    key = Column(String(255), nullable=False, index=True)  # e.g., "nav.home", "button.submit"
    namespace = Column(String(100), default="common")  # Grouping: "common", "errors", "forms"

    # Locale
    locale = Column(String(10), nullable=False, index=True)

    # Value
    value = Column(Text, nullable=False)

    # Context for translators
    context = Column(Text)  # Description of where this is used
    max_length = Column(Integer)  # Character limit hint

    # Status
    is_reviewed = Column(Boolean, default=False)
    reviewed_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime)

    # Auto-translation flag
    is_auto_translated = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    locale_settings = relationship("LocaleSettings", back_populates="translations")
    project = relationship("Project", backref="translations")
    reviewed_by = relationship("User", backref="reviewed_translations")

    # Unique constraint on key + locale + namespace per project
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class TranslationImport(Base):
    """Import history for translations."""
    __tablename__ = "translation_imports"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Import source
    source_type = Column(String(50), nullable=False)  # "json", "csv", "xliff", "po"
    source_filename = Column(String(255))

    # Results
    locale = Column(String(10), nullable=False)
    strings_imported = Column(Integer, default=0)
    strings_updated = Column(Integer, default=0)
    strings_skipped = Column(Integer, default=0)
    errors = Column(JSON, default=list)

    # Metadata
    imported_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="translation_imports")
    imported_by = relationship("User", backref="translation_imports")


# =============================================================================
# CODE SNIPPETS LIBRARY
# =============================================================================

class SnippetLanguage(str, PyEnum):
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JSX = "jsx"
    TSX = "tsx"
    CSS = "css"
    SCSS = "scss"
    HTML = "html"
    JSON = "json"
    MARKDOWN = "markdown"
    PYTHON = "python"
    SQL = "sql"
    SHELL = "shell"
    OTHER = "other"


class SnippetVisibility(str, PyEnum):
    PRIVATE = "private"  # Only visible to owner
    PROJECT = "project"  # Visible to project members
    PUBLIC = "public"  # Visible to all users


class SnippetFolder(Base):
    """Folder for organizing snippets."""
    __tablename__ = "snippet_folders"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Hex color
    icon = Column(String(50))

    # Hierarchy
    parent_id = Column(GUID(), ForeignKey("snippet_folders.id"), nullable=True)
    position = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="snippet_folders")
    parent = relationship("SnippetFolder", remote_side=[id], backref="children")


class CodeSnippet(Base):
    """Reusable code snippet."""
    __tablename__ = "code_snippets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    folder_id = Column(GUID(), ForeignKey("snippet_folders.id"), nullable=True, index=True)

    # Basic info
    title = Column(String(255), nullable=False)
    description = Column(Text)
    language = Column(Enum(SnippetLanguage), default=SnippetLanguage.TYPESCRIPT)

    # Code content
    code = Column(Text, nullable=False)
    code_preview = Column(String(500))  # First few lines for display

    # Organization
    tags = Column(JSON, default=list)  # ["react", "hook", "animation"]
    visibility = Column(Enum(SnippetVisibility), default=SnippetVisibility.PRIVATE)

    # Associated project (optional)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=True, index=True)

    # Stats
    use_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    favorite = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="code_snippets")
    folder = relationship("SnippetFolder", backref="snippets")
    project = relationship("Project", backref="code_snippets")


class SnippetShare(Base):
    """Shared snippet with another user."""
    __tablename__ = "snippet_shares"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    snippet_id = Column(GUID(), ForeignKey("code_snippets.id"), nullable=False, index=True)
    shared_with_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    shared_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    # Permissions
    can_edit = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    snippet = relationship("CodeSnippet", backref="shares")
    shared_with = relationship("User", foreign_keys=[shared_with_id], backref="received_snippets")
    shared_by = relationship("User", foreign_keys=[shared_by_id], backref="shared_snippets")


# =============================================================================
# INTEGRATIONS HUB
# =============================================================================

class IntegrationType(str, PyEnum):
    SLACK = "slack"
    DISCORD = "discord"
    GOOGLE_ANALYTICS = "google_analytics"
    SEGMENT = "segment"
    ZAPIER = "zapier"
    CUSTOM_WEBHOOK = "custom_webhook"
    GITHUB = "github"
    VERCEL = "vercel"
    NETLIFY = "netlify"


class IntegrationStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"


class Integration(Base):
    """Third-party integration for a project."""
    __tablename__ = "integrations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Integration type
    integration_type = Column(Enum(IntegrationType), nullable=False)
    name = Column(String(100), nullable=False)  # User-friendly name

    # Status
    status = Column(Enum(IntegrationStatus), default=IntegrationStatus.PENDING)
    error_message = Column(Text)
    last_error_at = Column(DateTime)

    # Configuration (encrypted sensitive data)
    config = Column(JSON, default=dict)  # Non-sensitive config
    credentials = Column(Text)  # Encrypted credentials (API keys, tokens)

    # OAuth tokens (for OAuth-based integrations)
    access_token = Column(Text)  # Encrypted
    refresh_token = Column(Text)  # Encrypted
    token_expires_at = Column(DateTime)

    # Event subscriptions
    events = Column(JSON, default=list)  # ["deployment", "form_submission", "order"]

    # Stats
    last_triggered_at = Column(DateTime)
    trigger_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)

    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="integrations")
    created_by = relationship("User", backref="created_integrations")
    logs = relationship("IntegrationLog", back_populates="integration", cascade="all, delete-orphan")


class IntegrationLog(Base):
    """Log of integration triggers."""
    __tablename__ = "integration_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    integration_id = Column(GUID(), ForeignKey("integrations.id"), nullable=False, index=True)

    # Trigger details
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSON)

    # Result
    success = Column(Boolean, nullable=False)
    status_code = Column(Integer)
    response_body = Column(Text)
    error_message = Column(Text)
    duration_ms = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    integration = relationship("Integration", back_populates="logs")


# =============================================================================
# BACKUP / RESTORE SYSTEM
# =============================================================================

class BackupType(str, PyEnum):
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    AUTO = "auto"  # Before destructive operations


class BackupStatus(str, PyEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class ProjectBackup(Base):
    """Project backup snapshot."""
    __tablename__ = "project_backups"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)

    # Backup info
    backup_type = Column(Enum(BackupType), default=BackupType.MANUAL)
    name = Column(String(255))  # Optional user-provided name
    description = Column(Text)

    # Status
    status = Column(Enum(BackupStatus), default=BackupStatus.PENDING)
    error_message = Column(Text)

    # Storage
    file_path = Column(String(500))
    file_size = Column(Integer)  # Bytes
    checksum = Column(String(64))  # SHA-256

    # Contents summary
    pages_count = Column(Integer, default=0)
    components_count = Column(Integer, default=0)
    assets_count = Column(Integer, default=0)

    # Retention
    expires_at = Column(DateTime)  # When backup will be auto-deleted
    is_pinned = Column(Boolean, default=False)  # Pinned backups don't expire

    # Metadata
    created_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    trigger_reason = Column(String(255))  # "User requested", "Before deployment", etc.

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", backref="backups")
    created_by = relationship("User", backref="created_backups")


class BackupSchedule(Base):
    """Scheduled backup configuration."""
    __tablename__ = "backup_schedules"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, unique=True)

    # Schedule
    enabled = Column(Boolean, default=True)
    frequency = Column(String(20), default="daily")  # "hourly", "daily", "weekly", "monthly"
    hour = Column(Integer, default=3)  # Hour of day (0-23)
    day_of_week = Column(Integer)  # 0-6 for weekly
    day_of_month = Column(Integer)  # 1-31 for monthly
    timezone = Column(String(50), default="UTC")

    # Retention
    retention_count = Column(Integer, default=7)  # Keep last N backups
    retention_days = Column(Integer, default=30)  # Or delete after N days

    # Last run
    last_run_at = Column(DateTime)
    last_status = Column(Enum(BackupStatus))
    next_run_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="backup_schedule", uselist=False)


class RestoreLog(Base):
    """Log of restore operations."""
    __tablename__ = "restore_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    backup_id = Column(GUID(), ForeignKey("project_backups.id"), nullable=False)

    # Status
    success = Column(Boolean, nullable=False)
    error_message = Column(Text)

    # What was restored
    pages_restored = Column(Integer, default=0)
    components_restored = Column(Integer, default=0)
    settings_restored = Column(Boolean, default=False)

    # Pre-restore backup
    pre_restore_backup_id = Column(GUID(), ForeignKey("project_backups.id"), nullable=True)

    # Metadata
    restored_by_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    duration_ms = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="restore_logs")
    backup = relationship("ProjectBackup", foreign_keys=[backup_id], backref="restores")
    pre_restore_backup = relationship("ProjectBackup", foreign_keys=[pre_restore_backup_id])
    restored_by = relationship("User", backref="restore_operations")


# =============================================================================
# FIGMA INTEGRATION
# =============================================================================

class FigmaImportStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FigmaImport(Base):
    """Figma file import record."""
    __tablename__ = "figma_imports"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    # Figma file info
    file_key = Column(String(100), nullable=False)
    node_ids = Column(JSON, nullable=True)  # Specific nodes to import

    # Import options
    import_assets = Column(Boolean, default=True)
    import_styles = Column(Boolean, default=True)
    import_components = Column(Boolean, default=True)
    target_page_id = Column(GUID(), nullable=True)  # Page to import into

    # Status
    status = Column(Enum(FigmaImportStatus), default=FigmaImportStatus.PENDING)
    progress = Column(Integer, default=0)  # 0-100
    message = Column(String(255))
    error = Column(Text)

    # Results
    result = Column(JSON, nullable=True)  # Converted components, tokens, assets

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    project = relationship("Project", backref="figma_imports")
    user = relationship("User", backref="figma_imports")


# =============================================================================
# TEAMS
# =============================================================================

class Team(Base):
    """Team/organization for multi-user workspaces."""
    __tablename__ = "teams"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    owner_id = Column(GUID(), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", backref="owned_teams", foreign_keys=[owner_id])


class TeamMember(Base):
    """Team membership."""
    __tablename__ = "team_members"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    team_id = Column(GUID(), ForeignKey("teams.id"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), default="member")  # owner, admin, member
    status = Column(String(20), default="active")  # active, invited
    invited_by_id = Column(GUID(), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    team = relationship("Team", backref="members")
    user = relationship("User", backref="team_memberships", foreign_keys=[user_id])


# =============================================================================
# ENTERPRISE SSO
# =============================================================================

class SSOProvider(str, PyEnum):
    SAML = "saml"
    OIDC = "oidc"
    OKTA = "okta"
    AZURE_AD = "azure_ad"
    GOOGLE_WORKSPACE = "google_workspace"


class SSOConfig(Base):
    """SSO configuration for a team."""
    __tablename__ = "sso_configs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    team_id = Column(GUID(), ForeignKey("teams.id"), nullable=False, unique=True)

    provider = Column(Enum(SSOProvider), nullable=False)
    display_name = Column(String(100))  # "Company Okta"
    enabled = Column(Boolean, default=False)

    # SAML settings
    idp_entity_id = Column(String(500))
    idp_sso_url = Column(String(500))
    idp_certificate = Column(Text)  # X.509 certificate

    # OIDC settings
    client_id = Column(String(255))
    client_secret = Column(Text)  # Encrypted
    authorization_url = Column(String(500))
    token_url = Column(String(500))
    userinfo_url = Column(String(500))
    scopes = Column(String(255), default="openid profile email")

    # Domain verification
    allowed_domains = Column(JSON, default=list)  # ["company.com", "subsidiary.com"]

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    team = relationship("Team", backref="sso_config", uselist=False)


class SSOSession(Base):
    """Temporary session for SSO login flow."""
    __tablename__ = "sso_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    sso_config_id = Column(GUID(), ForeignKey("sso_configs.id"), nullable=False)

    state = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(255))
    redirect_url = Column(String(500))

    used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sso_config = relationship("SSOConfig", backref="sessions")
