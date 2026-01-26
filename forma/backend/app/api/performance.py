"""Performance Monitoring API."""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, func, and_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, User,
    PerformanceMetric, PerformanceBudget, PerformanceAlert
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/performance", tags=["performance"])
public_router = APIRouter(prefix="/api/rum", tags=["rum"])


# =============================================================================
# SCHEMAS
# =============================================================================

class MetricCreate(BaseModel):
    url: str
    page_id: Optional[UUID] = None
    device_type: str = "desktop"
    connection_type: Optional[str] = None

    # Core Web Vitals
    lcp: Optional[float] = None
    fid: Optional[float] = None
    cls: Optional[float] = None
    inp: Optional[float] = None
    ttfb: Optional[float] = None
    fcp: Optional[float] = None

    # Additional metrics
    speed_index: Optional[float] = None
    time_to_interactive: Optional[float] = None
    total_blocking_time: Optional[float] = None
    dom_content_loaded: Optional[float] = None
    load_time: Optional[float] = None

    # Resource metrics
    total_size_bytes: Optional[int] = None
    html_size_bytes: Optional[int] = None
    css_size_bytes: Optional[int] = None
    js_size_bytes: Optional[int] = None
    image_size_bytes: Optional[int] = None
    font_size_bytes: Optional[int] = None

    # Request counts
    total_requests: Optional[int] = None

    # Scores
    performance_score: Optional[int] = None
    accessibility_score: Optional[int] = None
    best_practices_score: Optional[int] = None
    seo_score: Optional[int] = None

    # Source
    source: str = "synthetic"

    # RUM fields
    user_agent: Optional[str] = None
    country: Optional[str] = None


class MetricResponse(BaseModel):
    id: UUID
    project_id: UUID
    page_id: Optional[UUID]
    url: str
    device_type: str
    lcp: Optional[float]
    fid: Optional[float]
    cls: Optional[float]
    inp: Optional[float]
    ttfb: Optional[float]
    fcp: Optional[float]
    performance_score: Optional[int]
    source: str
    measured_at: datetime

    class Config:
        from_attributes = True


class BudgetUpdate(BaseModel):
    lcp_warning: Optional[float] = None
    lcp_error: Optional[float] = None
    fid_warning: Optional[float] = None
    fid_error: Optional[float] = None
    cls_warning: Optional[float] = None
    cls_error: Optional[float] = None
    total_size_warning: Optional[int] = None
    total_size_error: Optional[int] = None
    js_size_warning: Optional[int] = None
    js_size_error: Optional[int] = None
    performance_score_warning: Optional[int] = None
    performance_score_error: Optional[int] = None
    alert_on_warning: Optional[bool] = None
    alert_on_error: Optional[bool] = None
    alert_email: Optional[str] = None


class BudgetResponse(BaseModel):
    id: UUID
    project_id: UUID
    lcp_warning: float
    lcp_error: float
    fid_warning: float
    fid_error: float
    cls_warning: float
    cls_error: float
    total_size_warning: int
    total_size_error: int
    js_size_warning: int
    js_size_error: int
    performance_score_warning: int
    performance_score_error: int
    alert_on_warning: bool
    alert_on_error: bool
    alert_email: Optional[str]

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: UUID
    project_id: UUID
    metric_name: str
    threshold_type: str
    threshold_value: float
    actual_value: float
    url: Optional[str]
    acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CoreWebVitalsScore(BaseModel):
    name: str
    value: Optional[float]
    score: str  # "good", "needs-improvement", "poor"
    percentile: Optional[float]


class PerformanceSummary(BaseModel):
    overall_score: Optional[int]
    core_web_vitals: List[CoreWebVitalsScore]
    measurements_count: int
    time_range: str
    trend: str  # "improving", "stable", "declining"


class TrendData(BaseModel):
    date: str
    lcp: Optional[float]
    fid: Optional[float]
    cls: Optional[float]
    performance_score: Optional[int]


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


def get_or_create_budget(project_id: UUID, db: Session) -> PerformanceBudget:
    """Get or create performance budget."""
    budget = db.query(PerformanceBudget).filter(
        PerformanceBudget.project_id == project_id
    ).first()

    if not budget:
        budget = PerformanceBudget(project_id=project_id)
        db.add(budget)
        db.commit()
        db.refresh(budget)

    return budget


def score_web_vital(name: str, value: float) -> str:
    """Score a Core Web Vital."""
    thresholds = {
        "lcp": (2500, 4000),
        "fid": (100, 300),
        "cls": (0.1, 0.25),
        "inp": (200, 500),
        "ttfb": (800, 1800),
        "fcp": (1800, 3000),
    }

    if name not in thresholds:
        return "unknown"

    good, poor = thresholds[name]

    if value <= good:
        return "good"
    elif value <= poor:
        return "needs-improvement"
    else:
        return "poor"


def check_budget_violations(metric: PerformanceMetric, budget: PerformanceBudget, db: Session):
    """Check for budget violations and create alerts."""
    violations = []

    # Check LCP
    if metric.lcp:
        if metric.lcp > budget.lcp_error:
            violations.append(("lcp", "error", budget.lcp_error, metric.lcp))
        elif metric.lcp > budget.lcp_warning and budget.alert_on_warning:
            violations.append(("lcp", "warning", budget.lcp_warning, metric.lcp))

    # Check FID
    if metric.fid:
        if metric.fid > budget.fid_error:
            violations.append(("fid", "error", budget.fid_error, metric.fid))
        elif metric.fid > budget.fid_warning and budget.alert_on_warning:
            violations.append(("fid", "warning", budget.fid_warning, metric.fid))

    # Check CLS
    if metric.cls:
        if metric.cls > budget.cls_error:
            violations.append(("cls", "error", budget.cls_error, metric.cls))
        elif metric.cls > budget.cls_warning and budget.alert_on_warning:
            violations.append(("cls", "warning", budget.cls_warning, metric.cls))

    # Check total size
    if metric.total_size_bytes:
        if metric.total_size_bytes > budget.total_size_error:
            violations.append(("total_size", "error", budget.total_size_error, metric.total_size_bytes))
        elif metric.total_size_bytes > budget.total_size_warning and budget.alert_on_warning:
            violations.append(("total_size", "warning", budget.total_size_warning, metric.total_size_bytes))

    # Check performance score
    if metric.performance_score:
        if metric.performance_score < budget.performance_score_error:
            violations.append(("performance_score", "error", budget.performance_score_error, metric.performance_score))
        elif metric.performance_score < budget.performance_score_warning and budget.alert_on_warning:
            violations.append(("performance_score", "warning", budget.performance_score_warning, metric.performance_score))

    # Create alerts
    for metric_name, threshold_type, threshold_value, actual_value in violations:
        alert = PerformanceAlert(
            project_id=metric.project_id,
            metric_id=metric.id,
            metric_name=metric_name,
            threshold_type=threshold_type,
            threshold_value=threshold_value,
            actual_value=actual_value,
            url=metric.url,
        )
        db.add(alert)

    if violations:
        db.commit()


# =============================================================================
# METRIC ENDPOINTS
# =============================================================================

@router.post("/metrics", response_model=MetricResponse)
async def record_metric(
    project_id: UUID,
    request: MetricCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Record a performance metric."""
    project = get_project_access(project_id, user, db)

    metric = PerformanceMetric(
        project_id=project.id,
        page_id=request.page_id,
        url=request.url,
        device_type=request.device_type,
        connection_type=request.connection_type,
        lcp=request.lcp,
        fid=request.fid,
        cls=request.cls,
        inp=request.inp,
        ttfb=request.ttfb,
        fcp=request.fcp,
        speed_index=request.speed_index,
        time_to_interactive=request.time_to_interactive,
        total_blocking_time=request.total_blocking_time,
        dom_content_loaded=request.dom_content_loaded,
        load_time=request.load_time,
        total_size_bytes=request.total_size_bytes,
        html_size_bytes=request.html_size_bytes,
        css_size_bytes=request.css_size_bytes,
        js_size_bytes=request.js_size_bytes,
        image_size_bytes=request.image_size_bytes,
        font_size_bytes=request.font_size_bytes,
        total_requests=request.total_requests,
        performance_score=request.performance_score,
        accessibility_score=request.accessibility_score,
        best_practices_score=request.best_practices_score,
        seo_score=request.seo_score,
        source=request.source,
        user_agent=request.user_agent,
        country=request.country,
    )

    db.add(metric)
    db.commit()
    db.refresh(metric)

    # Check budget violations
    budget = get_or_create_budget(project.id, db)
    check_budget_violations(metric, budget, db)

    return MetricResponse.model_validate(metric)


@router.get("/metrics", response_model=List[MetricResponse])
async def list_metrics(
    project_id: UUID,
    page_id: Optional[UUID] = None,
    device_type: Optional[str] = None,
    source: Optional[str] = None,
    days: int = Query(7, le=90),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List performance metrics."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    query = db.query(PerformanceMetric).filter(
        PerformanceMetric.project_id == project.id,
        PerformanceMetric.measured_at >= since
    )

    if page_id:
        query = query.filter(PerformanceMetric.page_id == page_id)
    if device_type:
        query = query.filter(PerformanceMetric.device_type == device_type)
    if source:
        query = query.filter(PerformanceMetric.source == source)

    metrics = query.order_by(desc(PerformanceMetric.measured_at)).limit(limit).all()

    return [MetricResponse.model_validate(m) for m in metrics]


@router.get("/summary", response_model=PerformanceSummary)
async def get_performance_summary(
    project_id: UUID,
    days: int = Query(7, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get performance summary with Core Web Vitals."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    # Get aggregated metrics
    metrics = db.query(PerformanceMetric).filter(
        PerformanceMetric.project_id == project.id,
        PerformanceMetric.measured_at >= since
    ).all()

    if not metrics:
        return PerformanceSummary(
            overall_score=None,
            core_web_vitals=[],
            measurements_count=0,
            time_range=f"last {days} days",
            trend="stable"
        )

    # Calculate averages
    lcp_values = [m.lcp for m in metrics if m.lcp]
    fid_values = [m.fid for m in metrics if m.fid]
    cls_values = [m.cls for m in metrics if m.cls]
    inp_values = [m.inp for m in metrics if m.inp]
    scores = [m.performance_score for m in metrics if m.performance_score]

    avg_lcp = sum(lcp_values) / len(lcp_values) if lcp_values else None
    avg_fid = sum(fid_values) / len(fid_values) if fid_values else None
    avg_cls = sum(cls_values) / len(cls_values) if cls_values else None
    avg_inp = sum(inp_values) / len(inp_values) if inp_values else None
    avg_score = int(sum(scores) / len(scores)) if scores else None

    # Build Core Web Vitals scores
    cwv = []
    if avg_lcp is not None:
        cwv.append(CoreWebVitalsScore(
            name="LCP",
            value=avg_lcp,
            score=score_web_vital("lcp", avg_lcp),
            percentile=75
        ))
    if avg_fid is not None:
        cwv.append(CoreWebVitalsScore(
            name="FID",
            value=avg_fid,
            score=score_web_vital("fid", avg_fid),
            percentile=75
        ))
    if avg_cls is not None:
        cwv.append(CoreWebVitalsScore(
            name="CLS",
            value=avg_cls,
            score=score_web_vital("cls", avg_cls),
            percentile=75
        ))
    if avg_inp is not None:
        cwv.append(CoreWebVitalsScore(
            name="INP",
            value=avg_inp,
            score=score_web_vital("inp", avg_inp),
            percentile=75
        ))

    # Calculate trend
    if len(scores) >= 2:
        first_half = scores[:len(scores)//2]
        second_half = scores[len(scores)//2:]
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)

        if second_avg > first_avg + 5:
            trend = "improving"
        elif second_avg < first_avg - 5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return PerformanceSummary(
        overall_score=avg_score,
        core_web_vitals=cwv,
        measurements_count=len(metrics),
        time_range=f"last {days} days",
        trend=trend
    )


@router.get("/trends", response_model=List[TrendData])
async def get_performance_trends(
    project_id: UUID,
    days: int = Query(30, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get daily performance trends."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    # Get metrics grouped by day
    metrics = db.query(PerformanceMetric).filter(
        PerformanceMetric.project_id == project.id,
        PerformanceMetric.measured_at >= since
    ).all()

    # Group by date
    daily_data: Dict[str, list] = {}
    for m in metrics:
        date_key = m.measured_at.strftime("%Y-%m-%d")
        if date_key not in daily_data:
            daily_data[date_key] = []
        daily_data[date_key].append(m)

    # Calculate daily averages
    trends = []
    for date_key in sorted(daily_data.keys()):
        day_metrics = daily_data[date_key]

        lcp_values = [m.lcp for m in day_metrics if m.lcp]
        fid_values = [m.fid for m in day_metrics if m.fid]
        cls_values = [m.cls for m in day_metrics if m.cls]
        scores = [m.performance_score for m in day_metrics if m.performance_score]

        trends.append(TrendData(
            date=date_key,
            lcp=sum(lcp_values) / len(lcp_values) if lcp_values else None,
            fid=sum(fid_values) / len(fid_values) if fid_values else None,
            cls=sum(cls_values) / len(cls_values) if cls_values else None,
            performance_score=int(sum(scores) / len(scores)) if scores else None
        ))

    return trends


# =============================================================================
# BUDGET ENDPOINTS
# =============================================================================

@router.get("/budget", response_model=BudgetResponse)
async def get_budget(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get performance budget."""
    project = get_project_access(project_id, user, db)
    budget = get_or_create_budget(project.id, db)
    return BudgetResponse.model_validate(budget)


@router.put("/budget", response_model=BudgetResponse)
async def update_budget(
    project_id: UUID,
    request: BudgetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update performance budget."""
    project = get_project_access(project_id, user, db)
    budget = get_or_create_budget(project.id, db)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)

    return BudgetResponse.model_validate(budget)


# =============================================================================
# ALERT ENDPOINTS
# =============================================================================

@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    project_id: UUID,
    unacknowledged_only: bool = False,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List performance alerts."""
    project = get_project_access(project_id, user, db)

    query = db.query(PerformanceAlert).filter(
        PerformanceAlert.project_id == project.id
    )

    if unacknowledged_only:
        query = query.filter(PerformanceAlert.acknowledged == False)

    alerts = query.order_by(desc(PerformanceAlert.created_at)).limit(limit).all()

    return [AlertResponse.model_validate(a) for a in alerts]


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    project_id: UUID,
    alert_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Acknowledge a performance alert."""
    project = get_project_access(project_id, user, db)

    alert = db.query(PerformanceAlert).filter(
        PerformanceAlert.id == alert_id,
        PerformanceAlert.project_id == project.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.acknowledged = True
    alert.acknowledged_by_id = user.id
    alert.acknowledged_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Alert acknowledged"}


@router.post("/alerts/acknowledge-all")
async def acknowledge_all_alerts(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Acknowledge all alerts."""
    project = get_project_access(project_id, user, db)

    db.query(PerformanceAlert).filter(
        PerformanceAlert.project_id == project.id,
        PerformanceAlert.acknowledged == False
    ).update({
        PerformanceAlert.acknowledged: True,
        PerformanceAlert.acknowledged_by_id: user.id,
        PerformanceAlert.acknowledged_at: datetime.utcnow()
    }, synchronize_session=False)

    db.commit()

    return {"success": True, "message": "All alerts acknowledged"}


# =============================================================================
# PAGE-LEVEL ANALYSIS
# =============================================================================

@router.get("/pages")
async def get_pages_performance(
    project_id: UUID,
    days: int = Query(7, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get performance breakdown by page."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    # Get pages with their metrics
    pages = db.query(Page).filter(Page.project_id == project.id).all()

    result = []
    for page in pages:
        metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.page_id == page.id,
            PerformanceMetric.measured_at >= since
        ).all()

        if metrics:
            lcp_values = [m.lcp for m in metrics if m.lcp]
            cls_values = [m.cls for m in metrics if m.cls]
            scores = [m.performance_score for m in metrics if m.performance_score]

            result.append({
                "page_id": str(page.id),
                "name": page.name,
                "slug": page.slug,
                "measurements": len(metrics),
                "avg_lcp": sum(lcp_values) / len(lcp_values) if lcp_values else None,
                "avg_cls": sum(cls_values) / len(cls_values) if cls_values else None,
                "avg_score": int(sum(scores) / len(scores)) if scores else None,
                "lcp_score": score_web_vital("lcp", sum(lcp_values) / len(lcp_values)) if lcp_values else "unknown",
                "cls_score": score_web_vital("cls", sum(cls_values) / len(cls_values)) if cls_values else "unknown",
            })

    # Sort by score (worst first)
    result.sort(key=lambda x: x.get("avg_score") or 0)

    return result


# =============================================================================
# PUBLIC RUM ENDPOINT (for real user monitoring)
# =============================================================================

@public_router.post("/{project_id}")
async def record_rum_metric(
    project_id: UUID,
    request: MetricCreate,
    db: Session = Depends(get_db)
):
    """Record a Real User Monitoring metric (public endpoint)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Parse user agent for browser/OS
    browser = None
    os_name = None
    if request.user_agent:
        ua = request.user_agent.lower()
        if "chrome" in ua:
            browser = "Chrome"
        elif "firefox" in ua:
            browser = "Firefox"
        elif "safari" in ua:
            browser = "Safari"
        elif "edge" in ua:
            browser = "Edge"

        if "windows" in ua:
            os_name = "Windows"
        elif "mac" in ua:
            os_name = "macOS"
        elif "linux" in ua:
            os_name = "Linux"
        elif "android" in ua:
            os_name = "Android"
        elif "ios" in ua or "iphone" in ua:
            os_name = "iOS"

    metric = PerformanceMetric(
        project_id=project.id,
        page_id=request.page_id,
        url=request.url,
        device_type=request.device_type,
        connection_type=request.connection_type,
        lcp=request.lcp,
        fid=request.fid,
        cls=request.cls,
        inp=request.inp,
        ttfb=request.ttfb,
        fcp=request.fcp,
        total_size_bytes=request.total_size_bytes,
        source="rum",
        user_agent=request.user_agent,
        browser=browser,
        os=os_name,
        country=request.country,
    )

    db.add(metric)
    db.commit()

    # Check budget violations
    budget = get_or_create_budget(project.id, db)
    check_budget_violations(metric, budget, db)

    return {"success": True}
