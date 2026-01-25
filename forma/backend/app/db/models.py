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
