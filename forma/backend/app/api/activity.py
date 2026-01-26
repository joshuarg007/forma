"""Activity Log / Audit Trail API."""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import desc, and_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, User, ActivityLog, ActivityAction
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/activity", tags=["activity"])
user_router = APIRouter(prefix="/api/activity", tags=["activity"])


# =============================================================================
# SCHEMAS
# =============================================================================

class ActivityResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    user_id: Optional[UUID]
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[UUID]
    entity_name: Optional[str]
    description: Optional[str]
    changes: Optional[dict]
    metadata: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class ActivitySummary(BaseModel):
    total_activities: int
    activities_today: int
    active_users: int
    most_active_entity: Optional[str]
    action_breakdown: dict


class ActivityTimeline(BaseModel):
    date: str
    count: int
    actions: dict


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


def enrich_activity(activity: ActivityLog) -> ActivityResponse:
    """Enrich activity log with user info."""
    user_name = None
    user_avatar = None
    if activity.user:
        user_name = activity.user.name or activity.user.email
        user_avatar = activity.user.avatar_url

    return ActivityResponse(
        id=activity.id,
        project_id=activity.project_id,
        user_id=activity.user_id,
        user_name=user_name,
        user_avatar=user_avatar,
        action=activity.action.value,
        entity_type=activity.entity_type,
        entity_id=activity.entity_id,
        entity_name=activity.entity_name,
        description=activity.description,
        changes=activity.changes,
        metadata=activity.metadata,
        created_at=activity.created_at,
    )


async def log_activity(
    db: Session,
    action: ActivityAction,
    entity_type: str,
    entity_id: UUID = None,
    entity_name: str = None,
    description: str = None,
    changes: Dict[str, Any] = None,
    metadata: Dict[str, Any] = None,
    project_id: UUID = None,
    user_id: UUID = None,
    request: Request = None,
) -> ActivityLog:
    """Create an activity log entry."""
    ip_address = None
    user_agent = None

    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

    activity = ActivityLog(
        project_id=project_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        description=description,
        changes=changes,
        metadata=metadata or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def diff_objects(old: dict, new: dict, fields: List[str] = None) -> dict:
    """Calculate differences between two objects."""
    changes = {}

    all_keys = set(old.keys()) | set(new.keys())
    if fields:
        all_keys = all_keys & set(fields)

    for key in all_keys:
        old_val = old.get(key)
        new_val = new.get(key)

        if old_val != new_val:
            changes[key] = {
                "old": old_val,
                "new": new_val
            }

    return changes


# =============================================================================
# PROJECT ACTIVITY ENDPOINTS
# =============================================================================

@router.get("", response_model=List[ActivityResponse])
async def list_project_activity(
    project_id: UUID,
    action: Optional[ActivityAction] = None,
    entity_type: Optional[str] = None,
    user_id: Optional[UUID] = None,
    days: int = Query(30, le=90),
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List activity for a project."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    query = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= since
    )

    if action:
        query = query.filter(ActivityLog.action == action)
    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)

    activities = query.order_by(desc(ActivityLog.created_at)).offset(offset).limit(limit).all()

    return [enrich_activity(a) for a in activities]


@router.get("/summary", response_model=ActivitySummary)
async def get_activity_summary(
    project_id: UUID,
    days: int = Query(7, le=30),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get activity summary for a project."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Total activities
    total = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= since
    ).count()

    # Activities today
    today = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= today_start
    ).count()

    # Active users
    active_users = db.query(ActivityLog.user_id).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= since,
        ActivityLog.user_id.isnot(None)
    ).distinct().count()

    # Action breakdown
    action_breakdown = {}
    for act in ActivityAction:
        count = db.query(ActivityLog).filter(
            ActivityLog.project_id == project.id,
            ActivityLog.action == act,
            ActivityLog.created_at >= since
        ).count()
        if count > 0:
            action_breakdown[act.value] = count

    # Most active entity
    activities = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= since
    ).all()

    entity_counts: Dict[str, int] = {}
    for a in activities:
        key = f"{a.entity_type}:{a.entity_name or 'unknown'}"
        entity_counts[key] = entity_counts.get(key, 0) + 1

    most_active = max(entity_counts.items(), key=lambda x: x[1])[0] if entity_counts else None

    return ActivitySummary(
        total_activities=total,
        activities_today=today,
        active_users=active_users,
        most_active_entity=most_active,
        action_breakdown=action_breakdown
    )


@router.get("/timeline", response_model=List[ActivityTimeline])
async def get_activity_timeline(
    project_id: UUID,
    days: int = Query(14, le=30),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get activity timeline by day."""
    project = get_project_access(project_id, user, db)

    since = datetime.utcnow() - timedelta(days=days)

    activities = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.created_at >= since
    ).all()

    # Group by date
    daily_data: Dict[str, Dict] = {}
    for a in activities:
        date_key = a.created_at.strftime("%Y-%m-%d")
        if date_key not in daily_data:
            daily_data[date_key] = {"count": 0, "actions": {}}
        daily_data[date_key]["count"] += 1
        action_key = a.action.value
        daily_data[date_key]["actions"][action_key] = daily_data[date_key]["actions"].get(action_key, 0) + 1

    timeline = []
    for date_key in sorted(daily_data.keys()):
        timeline.append(ActivityTimeline(
            date=date_key,
            count=daily_data[date_key]["count"],
            actions=daily_data[date_key]["actions"]
        ))

    return timeline


@router.get("/entity/{entity_type}/{entity_id}", response_model=List[ActivityResponse])
async def get_entity_activity(
    project_id: UUID,
    entity_type: str,
    entity_id: UUID,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get activity for a specific entity."""
    project = get_project_access(project_id, user, db)

    activities = db.query(ActivityLog).filter(
        ActivityLog.project_id == project.id,
        ActivityLog.entity_type == entity_type,
        ActivityLog.entity_id == entity_id
    ).order_by(desc(ActivityLog.created_at)).limit(limit).all()

    return [enrich_activity(a) for a in activities]


# =============================================================================
# USER ACTIVITY ENDPOINTS
# =============================================================================

@user_router.get("/me", response_model=List[ActivityResponse])
async def get_my_activity(
    days: int = Query(30, le=90),
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get current user's activity across all projects."""
    since = datetime.utcnow() - timedelta(days=days)

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == user.id,
        ActivityLog.created_at >= since
    ).order_by(desc(ActivityLog.created_at)).offset(offset).limit(limit).all()

    return [enrich_activity(a) for a in activities]


@user_router.get("/me/summary")
async def get_my_activity_summary(
    days: int = Query(7, le=30),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get current user's activity summary."""
    since = datetime.utcnow() - timedelta(days=days)

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == user.id,
        ActivityLog.created_at >= since
    ).all()

    # Count by action
    action_counts = {}
    for a in activities:
        action_counts[a.action.value] = action_counts.get(a.action.value, 0) + 1

    # Count by project
    project_counts = {}
    for a in activities:
        if a.project_id:
            project_counts[str(a.project_id)] = project_counts.get(str(a.project_id), 0) + 1

    # Recent projects
    recent_projects = db.query(ActivityLog.project_id).filter(
        ActivityLog.user_id == user.id,
        ActivityLog.project_id.isnot(None)
    ).distinct().limit(5).all()

    return {
        "total_activities": len(activities),
        "action_breakdown": action_counts,
        "project_breakdown": project_counts,
        "recent_project_ids": [str(p[0]) for p in recent_projects]
    }


# =============================================================================
# ACTIVITY LOGGING HELPERS (for use in other modules)
# =============================================================================

# These are exported functions that other API modules can use

async def log_page_created(db: Session, user: User, project: Project, page, request: Request = None):
    """Log page creation."""
    return await log_activity(
        db=db,
        action=ActivityAction.CREATE,
        entity_type="page",
        entity_id=page.id,
        entity_name=page.name,
        description=f"Created page '{page.name}'",
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_page_updated(db: Session, user: User, project: Project, page, changes: dict, request: Request = None):
    """Log page update."""
    return await log_activity(
        db=db,
        action=ActivityAction.UPDATE,
        entity_type="page",
        entity_id=page.id,
        entity_name=page.name,
        description=f"Updated page '{page.name}'",
        changes=changes,
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_page_deleted(db: Session, user: User, project: Project, page_name: str, page_id: UUID, request: Request = None):
    """Log page deletion."""
    return await log_activity(
        db=db,
        action=ActivityAction.DELETE,
        entity_type="page",
        entity_id=page_id,
        entity_name=page_name,
        description=f"Deleted page '{page_name}'",
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_component_created(db: Session, user: User, project: Project, component, request: Request = None):
    """Log component creation."""
    return await log_activity(
        db=db,
        action=ActivityAction.CREATE,
        entity_type="component",
        entity_id=component.id,
        entity_name=component.name,
        description=f"Created component '{component.name}'",
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_deployment(db: Session, user: User, project: Project, deployment, success: bool, request: Request = None):
    """Log deployment."""
    status = "succeeded" if success else "failed"
    return await log_activity(
        db=db,
        action=ActivityAction.DEPLOY,
        entity_type="deployment",
        entity_id=deployment.id,
        entity_name=f"Deployment {status}",
        description=f"Deployment {status} for '{project.name}'",
        metadata={"success": success},
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_settings_change(db: Session, user: User, project: Project, setting_name: str, changes: dict, request: Request = None):
    """Log settings change."""
    return await log_activity(
        db=db,
        action=ActivityAction.SETTINGS_CHANGE,
        entity_type="settings",
        entity_name=setting_name,
        description=f"Changed {setting_name} settings",
        changes=changes,
        project_id=project.id,
        user_id=user.id,
        request=request,
    )


async def log_team_member_action(db: Session, user: User, project: Project, action: ActivityAction, member_name: str, member_id: UUID, request: Request = None):
    """Log team member action."""
    action_verb = {
        ActivityAction.INVITE: "invited",
        ActivityAction.JOIN: "joined",
        ActivityAction.LEAVE: "left",
    }.get(action, "modified")

    return await log_activity(
        db=db,
        action=action,
        entity_type="team_member",
        entity_id=member_id,
        entity_name=member_name,
        description=f"{member_name} {action_verb} the project",
        project_id=project.id,
        user_id=user.id,
        request=request,
    )
