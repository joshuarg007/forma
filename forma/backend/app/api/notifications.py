"""Notifications System API."""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, and_, or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    User, Project, Notification, NotificationPreference,
    NotificationType, NotificationPriority
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# =============================================================================
# SCHEMAS
# =============================================================================

class NotificationResponse(BaseModel):
    id: UUID
    notification_type: str
    priority: str
    title: str
    message: Optional[str]
    icon: Optional[str]
    project_id: Optional[UUID]
    project_name: Optional[str] = None
    related_type: Optional[str]
    related_id: Optional[UUID]
    action_url: Optional[str]
    action_label: Optional[str]
    sender_id: Optional[UUID]
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    read: bool
    read_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    """For internal/admin use."""
    user_id: UUID
    notification_type: NotificationType
    priority: NotificationPriority = NotificationPriority.NORMAL
    title: str
    message: Optional[str] = None
    icon: Optional[str] = None
    project_id: Optional[UUID] = None
    related_type: Optional[str] = None
    related_id: Optional[UUID] = None
    action_url: Optional[str] = None
    action_label: Optional[str] = None


class PreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    email_comments: Optional[bool] = None
    email_mentions: Optional[bool] = None
    email_deployments: Optional[bool] = None
    email_team: Optional[bool] = None
    email_performance: Optional[bool] = None
    email_forms: Optional[bool] = None
    email_orders: Optional[bool] = None
    email_digest: Optional[str] = None
    push_enabled: Optional[bool] = None
    push_comments: Optional[bool] = None
    push_mentions: Optional[bool] = None
    push_deployments: Optional[bool] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    timezone: Optional[str] = None


class PreferencesResponse(BaseModel):
    email_enabled: bool
    email_comments: bool
    email_mentions: bool
    email_deployments: bool
    email_team: bool
    email_performance: bool
    email_forms: bool
    email_orders: bool
    email_digest: str
    push_enabled: bool
    push_comments: bool
    push_mentions: bool
    push_deployments: bool
    quiet_hours_enabled: bool
    quiet_hours_start: Optional[str]
    quiet_hours_end: Optional[str]
    timezone: str

    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    total_unread: int
    unread_by_type: dict
    recent_count: int


# =============================================================================
# HELPERS
# =============================================================================

def get_or_create_preferences(user_id: UUID, db: Session) -> NotificationPreference:
    """Get or create notification preferences for a user."""
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()

    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs


def enrich_notification(notification: Notification, db: Session) -> NotificationResponse:
    """Enrich notification with related data."""
    project_name = None
    if notification.project:
        project_name = notification.project.name

    sender_name = None
    sender_avatar = None
    if notification.sender:
        sender_name = notification.sender.name or notification.sender.email
        sender_avatar = notification.sender.avatar_url

    return NotificationResponse(
        id=notification.id,
        notification_type=notification.notification_type.value,
        priority=notification.priority.value,
        title=notification.title,
        message=notification.message,
        icon=notification.icon,
        project_id=notification.project_id,
        project_name=project_name,
        related_type=notification.related_type,
        related_id=notification.related_id,
        action_url=notification.action_url,
        action_label=notification.action_label,
        sender_id=notification.sender_id,
        sender_name=sender_name,
        sender_avatar=sender_avatar,
        read=notification.read,
        read_at=notification.read_at,
        created_at=notification.created_at,
    )


async def create_notification(
    db: Session,
    user_id: UUID,
    notification_type: NotificationType,
    title: str,
    message: str = None,
    icon: str = None,
    project_id: UUID = None,
    related_type: str = None,
    related_id: UUID = None,
    action_url: str = None,
    action_label: str = None,
    sender_id: UUID = None,
    priority: NotificationPriority = NotificationPriority.NORMAL,
) -> Notification:
    """Create a notification for a user."""
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        priority=priority,
        title=title,
        message=message,
        icon=icon,
        project_id=project_id,
        related_type=related_type,
        related_id=related_id,
        action_url=action_url,
        action_label=action_label,
        sender_id=sender_id,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# Notification helper functions for common events
async def notify_comment(
    db: Session,
    user_id: UUID,
    commenter_name: str,
    project_id: UUID,
    comment_id: UUID,
    comment_preview: str,
    sender_id: UUID = None
):
    """Notify user of a new comment."""
    return await create_notification(
        db=db,
        user_id=user_id,
        notification_type=NotificationType.COMMENT,
        title=f"{commenter_name} commented",
        message=comment_preview[:100],
        icon="comment",
        project_id=project_id,
        related_type="comment",
        related_id=comment_id,
        action_url=f"/projects/{project_id}/comments/{comment_id}",
        action_label="View Comment",
        sender_id=sender_id,
    )


async def notify_mention(
    db: Session,
    user_id: UUID,
    mentioner_name: str,
    project_id: UUID,
    comment_id: UUID,
    context: str,
    sender_id: UUID = None
):
    """Notify user of being mentioned."""
    return await create_notification(
        db=db,
        user_id=user_id,
        notification_type=NotificationType.MENTION,
        title=f"{mentioner_name} mentioned you",
        message=context[:100],
        icon="at",
        project_id=project_id,
        related_type="comment",
        related_id=comment_id,
        action_url=f"/projects/{project_id}/comments/{comment_id}",
        action_label="View",
        sender_id=sender_id,
        priority=NotificationPriority.HIGH,
    )


async def notify_deployment(
    db: Session,
    user_id: UUID,
    project_id: UUID,
    project_name: str,
    deployment_id: UUID,
    success: bool
):
    """Notify user of deployment completion."""
    notification_type = NotificationType.DEPLOYMENT if success else NotificationType.DEPLOYMENT_FAILED
    title = f"Deployment {'succeeded' if success else 'failed'}"
    icon = "check-circle" if success else "x-circle"
    priority = NotificationPriority.NORMAL if success else NotificationPriority.HIGH

    return await create_notification(
        db=db,
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=f"{project_name} has been {'deployed' if success else 'failed to deploy'}",
        icon=icon,
        project_id=project_id,
        related_type="deployment",
        related_id=deployment_id,
        action_url=f"/projects/{project_id}/deployments/{deployment_id}",
        action_label="View Details",
        priority=priority,
    )


async def notify_team_invite(
    db: Session,
    user_id: UUID,
    inviter_name: str,
    project_id: UUID,
    project_name: str,
    sender_id: UUID = None
):
    """Notify user of team invitation."""
    return await create_notification(
        db=db,
        user_id=user_id,
        notification_type=NotificationType.TEAM_INVITE,
        title=f"Invitation to {project_name}",
        message=f"{inviter_name} invited you to collaborate",
        icon="users",
        project_id=project_id,
        related_type="project",
        related_id=project_id,
        action_url=f"/invites/accept?project={project_id}",
        action_label="View Invitation",
        sender_id=sender_id,
        priority=NotificationPriority.HIGH,
    )


# =============================================================================
# NOTIFICATION ENDPOINTS
# =============================================================================

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    notification_type: Optional[NotificationType] = None,
    project_id: Optional[UUID] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List user's notifications."""
    query = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.archived == False
    )

    if unread_only:
        query = query.filter(Notification.read == False)
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    if project_id:
        query = query.filter(Notification.project_id == project_id)

    notifications = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()

    return [enrich_notification(n, db) for n in notifications]


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get notification statistics."""
    # Total unread
    total_unread = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.read == False,
        Notification.archived == False
    ).count()

    # Unread by type
    unread_by_type = {}
    for ntype in NotificationType:
        count = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.notification_type == ntype,
            Notification.read == False,
            Notification.archived == False
        ).count()
        if count > 0:
            unread_by_type[ntype.value] = count

    # Recent (last 24 hours)
    recent_count = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.created_at >= datetime.utcnow() - timedelta(hours=24),
        Notification.archived == False
    ).count()

    return NotificationStats(
        total_unread=total_unread,
        unread_by_type=unread_by_type,
        recent_count=recent_count
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return enrich_notification(notification, db)


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.read = True
    notification.read_at = datetime.utcnow()
    db.commit()

    return {"success": True}


@router.post("/{notification_id}/unread")
async def mark_as_unread(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark a notification as unread."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.read = False
    notification.read_at = None
    db.commit()

    return {"success": True}


@router.post("/read-all")
async def mark_all_as_read(
    project_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark all notifications as read."""
    query = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.read == False
    )

    if project_id:
        query = query.filter(Notification.project_id == project_id)

    query.update({
        Notification.read: True,
        Notification.read_at: datetime.utcnow()
    }, synchronize_session=False)

    db.commit()

    return {"success": True}


@router.post("/{notification_id}/archive")
async def archive_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Archive a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.archived = True
    notification.archived_at = datetime.utcnow()
    db.commit()

    return {"success": True}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()

    return {"success": True}


@router.delete("")
async def clear_notifications(
    read_only: bool = True,
    older_than_days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Clear old notifications."""
    cutoff = datetime.utcnow() - timedelta(days=older_than_days)

    query = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.created_at < cutoff
    )

    if read_only:
        query = query.filter(Notification.read == True)

    deleted_count = query.delete(synchronize_session=False)
    db.commit()

    return {"success": True, "deleted_count": deleted_count}


# =============================================================================
# PREFERENCES ENDPOINTS
# =============================================================================

@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get notification preferences."""
    prefs = get_or_create_preferences(user.id, db)
    return PreferencesResponse.model_validate(prefs)


@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    request: PreferencesUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update notification preferences."""
    prefs = get_or_create_preferences(user.id, db)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(prefs, field, value)

    db.commit()
    db.refresh(prefs)

    return PreferencesResponse.model_validate(prefs)


# =============================================================================
# INTERNAL NOTIFICATION CREATION (for other services)
# =============================================================================

@router.post("/internal/create", include_in_schema=False)
async def create_notification_internal(
    request: NotificationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a notification (internal use)."""
    # This would typically check for admin privileges
    notification = await create_notification(
        db=db,
        user_id=request.user_id,
        notification_type=request.notification_type,
        title=request.title,
        message=request.message,
        icon=request.icon,
        project_id=request.project_id,
        related_type=request.related_type,
        related_id=request.related_id,
        action_url=request.action_url,
        action_label=request.action_label,
        priority=request.priority,
    )

    return enrich_notification(notification, db)
