"""Analytics API - Page views, events, and dashboard data"""
from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID
import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db.database import get_db
from app.db.models import User, Project, PageView, AnalyticsEvent, AnalyticsSummary
from app.core.security import get_current_user_required

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# =============================================================================
# SCHEMAS
# =============================================================================

class PageViewCreate(BaseModel):
    """Page view event from tracking script."""
    page_path: str
    page_title: Optional[str] = None
    referrer: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    screen_width: Optional[int] = None


class EventCreate(BaseModel):
    """Custom event from tracking script."""
    event_name: str
    event_category: Optional[str] = None
    event_value: Optional[float] = None
    page_path: Optional[str] = None
    properties: Optional[dict] = None


class AnalyticsOverview(BaseModel):
    """Overview metrics for dashboard."""
    page_views: int
    unique_visitors: int
    sessions: int
    avg_session_duration: float  # seconds
    bounce_rate: float  # percentage
    views_change: float  # percentage change from previous period
    visitors_change: float


class TopPage(BaseModel):
    """Top page with view count."""
    page_path: str
    page_title: Optional[str] = None
    views: int
    unique_visitors: int


class TopReferrer(BaseModel):
    """Top referrer domain."""
    domain: str
    visits: int
    percentage: float


class DeviceBreakdown(BaseModel):
    """Device type breakdown."""
    desktop: int
    mobile: int
    tablet: int


class TimeSeriesPoint(BaseModel):
    """Single point in time series."""
    date: str
    value: int


class AnalyticsDashboard(BaseModel):
    """Full analytics dashboard data."""
    overview: AnalyticsOverview
    top_pages: List[TopPage]
    top_referrers: List[TopReferrer]
    devices: DeviceBreakdown
    countries: dict  # country_code -> count
    page_views_series: List[TimeSeriesPoint]
    visitors_series: List[TimeSeriesPoint]


# =============================================================================
# PUBLIC TRACKING ENDPOINTS (for deployed sites)
# =============================================================================

tracking_router = APIRouter(prefix="/api/track", tags=["tracking"])


def get_visitor_id(request: Request) -> str:
    """Generate anonymous visitor ID from request."""
    # Use IP + User-Agent for fingerprinting (hashed for privacy)
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")
    raw = f"{ip}:{ua}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def get_session_id(request: Request, visitor_id: str) -> str:
    """Generate session ID (changes daily)."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    raw = f"{visitor_id}:{today}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def parse_referrer_domain(referrer: str) -> Optional[str]:
    """Extract domain from referrer URL."""
    if not referrer:
        return None
    try:
        from urllib.parse import urlparse
        parsed = urlparse(referrer)
        return parsed.netloc or None
    except:
        return None


def detect_device_type(user_agent: str) -> str:
    """Detect device type from user agent."""
    ua_lower = user_agent.lower()
    if "mobile" in ua_lower or "android" in ua_lower and "mobile" in ua_lower:
        return "mobile"
    elif "tablet" in ua_lower or "ipad" in ua_lower:
        return "tablet"
    return "desktop"


def detect_browser(user_agent: str) -> str:
    """Detect browser from user agent."""
    ua_lower = user_agent.lower()
    if "chrome" in ua_lower:
        return "Chrome"
    elif "firefox" in ua_lower:
        return "Firefox"
    elif "safari" in ua_lower:
        return "Safari"
    elif "edge" in ua_lower:
        return "Edge"
    elif "opera" in ua_lower:
        return "Opera"
    return "Other"


def detect_os(user_agent: str) -> str:
    """Detect OS from user agent."""
    ua_lower = user_agent.lower()
    if "windows" in ua_lower:
        return "Windows"
    elif "mac" in ua_lower:
        return "macOS"
    elif "linux" in ua_lower:
        return "Linux"
    elif "android" in ua_lower:
        return "Android"
    elif "iphone" in ua_lower or "ipad" in ua_lower:
        return "iOS"
    return "Other"


@tracking_router.post("/{project_id}/pageview")
async def track_pageview(
    project_id: UUID,
    data: PageViewCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Track a page view (called from deployed sites)."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_agent = request.headers.get("user-agent", "")
    visitor_id = get_visitor_id(request)
    session_id = get_session_id(request, visitor_id)

    # Create page view
    pageview = PageView(
        project_id=project_id,
        page_path=data.page_path,
        page_title=data.page_title,
        visitor_id=visitor_id,
        session_id=session_id,
        referrer=data.referrer,
        referrer_domain=parse_referrer_domain(data.referrer),
        utm_source=data.utm_source,
        utm_medium=data.utm_medium,
        utm_campaign=data.utm_campaign,
        device_type=detect_device_type(user_agent),
        browser=detect_browser(user_agent),
        os=detect_os(user_agent),
        screen_width=data.screen_width,
        # country will be set by IP geolocation later
    )

    db.add(pageview)
    db.commit()

    return {"status": "ok"}


@tracking_router.post("/{project_id}/event")
async def track_event(
    project_id: UUID,
    data: EventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Track a custom event (called from deployed sites)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    visitor_id = get_visitor_id(request)
    session_id = get_session_id(request, visitor_id)

    event = AnalyticsEvent(
        project_id=project_id,
        event_name=data.event_name,
        event_category=data.event_category,
        event_value=data.event_value,
        page_path=data.page_path,
        visitor_id=visitor_id,
        session_id=session_id,
        properties=data.properties or {}
    )

    db.add(event)
    db.commit()

    return {"status": "ok"}


# =============================================================================
# AUTHENTICATED DASHBOARD ENDPOINTS
# =============================================================================

@router.get("/project/{project_id}", response_model=AnalyticsDashboard)
async def get_project_analytics(
    project_id: UUID,
    period: str = Query("7d", regex="^(24h|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get analytics dashboard for a project."""
    # Verify project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate date range
    now = datetime.utcnow()
    if period == "24h":
        start_date = now - timedelta(hours=24)
        prev_start = now - timedelta(hours=48)
        prev_end = now - timedelta(hours=24)
    elif period == "7d":
        start_date = now - timedelta(days=7)
        prev_start = now - timedelta(days=14)
        prev_end = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
        prev_start = now - timedelta(days=60)
        prev_end = now - timedelta(days=30)
    else:  # 90d
        start_date = now - timedelta(days=90)
        prev_start = now - timedelta(days=180)
        prev_end = now - timedelta(days=90)

    # Query current period
    current_views = db.query(PageView).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date
    )

    # Query previous period for comparison
    prev_views = db.query(PageView).filter(
        PageView.project_id == project_id,
        PageView.created_at >= prev_start,
        PageView.created_at < prev_end
    )

    # Calculate metrics
    total_views = current_views.count()
    unique_visitors = db.query(func.count(func.distinct(PageView.visitor_id))).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date
    ).scalar() or 0

    sessions = db.query(func.count(func.distinct(PageView.session_id))).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date
    ).scalar() or 0

    prev_views_count = prev_views.count()
    prev_visitors = db.query(func.count(func.distinct(PageView.visitor_id))).filter(
        PageView.project_id == project_id,
        PageView.created_at >= prev_start,
        PageView.created_at < prev_end
    ).scalar() or 0

    # Calculate percentage changes
    views_change = ((total_views - prev_views_count) / max(prev_views_count, 1)) * 100
    visitors_change = ((unique_visitors - prev_visitors) / max(prev_visitors, 1)) * 100

    # Top pages
    top_pages_query = db.query(
        PageView.page_path,
        PageView.page_title,
        func.count(PageView.id).label('views'),
        func.count(func.distinct(PageView.visitor_id)).label('visitors')
    ).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date
    ).group_by(
        PageView.page_path, PageView.page_title
    ).order_by(desc('views')).limit(10).all()

    top_pages = [
        TopPage(
            page_path=p.page_path,
            page_title=p.page_title,
            views=p.views,
            unique_visitors=p.visitors
        )
        for p in top_pages_query
    ]

    # Top referrers
    top_referrers_query = db.query(
        PageView.referrer_domain,
        func.count(PageView.id).label('visits')
    ).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date,
        PageView.referrer_domain.isnot(None)
    ).group_by(PageView.referrer_domain).order_by(desc('visits')).limit(10).all()

    top_referrers = [
        TopReferrer(
            domain=r.referrer_domain,
            visits=r.visits,
            percentage=round((r.visits / max(total_views, 1)) * 100, 1)
        )
        for r in top_referrers_query
    ]

    # Device breakdown
    device_counts = db.query(
        PageView.device_type,
        func.count(PageView.id)
    ).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date
    ).group_by(PageView.device_type).all()

    devices = {"desktop": 0, "mobile": 0, "tablet": 0}
    for device_type, count in device_counts:
        if device_type in devices:
            devices[device_type] = count

    # Country breakdown
    country_counts = db.query(
        PageView.country,
        func.count(PageView.id)
    ).filter(
        PageView.project_id == project_id,
        PageView.created_at >= start_date,
        PageView.country.isnot(None)
    ).group_by(PageView.country).order_by(desc(func.count(PageView.id))).limit(10).all()

    countries = {c: count for c, count in country_counts}

    # Time series (daily for week/month, hourly for 24h)
    if period == "24h":
        # Hourly
        series_query = db.query(
            func.strftime('%Y-%m-%d %H:00', PageView.created_at).label('hour'),
            func.count(PageView.id).label('views'),
            func.count(func.distinct(PageView.visitor_id)).label('visitors')
        ).filter(
            PageView.project_id == project_id,
            PageView.created_at >= start_date
        ).group_by('hour').order_by('hour').all()

        page_views_series = [TimeSeriesPoint(date=s.hour, value=s.views) for s in series_query]
        visitors_series = [TimeSeriesPoint(date=s.hour, value=s.visitors) for s in series_query]
    else:
        # Daily
        series_query = db.query(
            func.date(PageView.created_at).label('day'),
            func.count(PageView.id).label('views'),
            func.count(func.distinct(PageView.visitor_id)).label('visitors')
        ).filter(
            PageView.project_id == project_id,
            PageView.created_at >= start_date
        ).group_by('day').order_by('day').all()

        page_views_series = [TimeSeriesPoint(date=str(s.day), value=s.views) for s in series_query]
        visitors_series = [TimeSeriesPoint(date=str(s.day), value=s.visitors) for s in series_query]

    return AnalyticsDashboard(
        overview=AnalyticsOverview(
            page_views=total_views,
            unique_visitors=unique_visitors,
            sessions=sessions,
            avg_session_duration=0,  # TODO: Calculate from session data
            bounce_rate=0,  # TODO: Calculate from session data
            views_change=round(views_change, 1),
            visitors_change=round(visitors_change, 1)
        ),
        top_pages=top_pages,
        top_referrers=top_referrers,
        devices=DeviceBreakdown(**devices),
        countries=countries,
        page_views_series=page_views_series,
        visitors_series=visitors_series
    )


@router.get("/project/{project_id}/events")
async def get_project_events(
    project_id: UUID,
    event_name: Optional[str] = None,
    period: str = Query("7d", regex="^(24h|7d|30d|90d)$"),
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get custom events for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate date range
    now = datetime.utcnow()
    if period == "24h":
        start_date = now - timedelta(hours=24)
    elif period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=90)

    query = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.project_id == project_id,
        AnalyticsEvent.created_at >= start_date
    )

    if event_name:
        query = query.filter(AnalyticsEvent.event_name == event_name)

    events = query.order_by(desc(AnalyticsEvent.created_at)).limit(limit).all()

    # Group by event name for summary
    event_summary = db.query(
        AnalyticsEvent.event_name,
        func.count(AnalyticsEvent.id).label('count'),
        func.sum(AnalyticsEvent.event_value).label('total_value')
    ).filter(
        AnalyticsEvent.project_id == project_id,
        AnalyticsEvent.created_at >= start_date
    ).group_by(AnalyticsEvent.event_name).all()

    return {
        "summary": [
            {
                "event_name": e.event_name,
                "count": e.count,
                "total_value": float(e.total_value) if e.total_value else 0
            }
            for e in event_summary
        ],
        "events": [
            {
                "id": str(e.id),
                "event_name": e.event_name,
                "event_category": e.event_category,
                "event_value": e.event_value,
                "page_path": e.page_path,
                "properties": e.properties,
                "created_at": e.created_at.isoformat()
            }
            for e in events
        ]
    }
