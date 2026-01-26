"""Scheduled Publishing API."""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import desc, and_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, BlogPost, User, Deployment,
    ScheduledPublish, PublishHistory,
    ScheduledItemType, ScheduledItemStatus, BlogPostStatus
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/scheduled", tags=["scheduled"])


# =============================================================================
# SCHEMAS
# =============================================================================

class ScheduleCreate(BaseModel):
    item_type: ScheduledItemType
    item_id: Optional[UUID] = None  # Required for page/blog_post, null for site
    scheduled_at: datetime
    timezone: str = "UTC"
    action: str = "publish"
    notes: Optional[str] = None


class ScheduleUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None


class ScheduleResponse(BaseModel):
    id: UUID
    project_id: UUID
    item_type: str
    item_id: Optional[UUID]
    item_name: Optional[str] = None
    scheduled_at: datetime
    timezone: str
    status: str
    action: str
    published_at: Optional[datetime]
    error_message: Optional[str]
    created_by_id: UUID
    created_by_name: Optional[str] = None
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PublishHistoryResponse(BaseModel):
    id: UUID
    item_type: str
    item_id: Optional[UUID]
    item_name: Optional[str]
    trigger: str
    success: bool
    error_message: Optional[str]
    published_by_id: Optional[UUID]
    published_by_name: Optional[str] = None
    duration_ms: Optional[int]
    published_at: datetime

    class Config:
        from_attributes = True


class QueueStats(BaseModel):
    pending_count: int
    published_today: int
    failed_today: int
    next_scheduled: Optional[datetime]
    upcoming: List[ScheduleResponse]


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


def get_item_name(item_type: ScheduledItemType, item_id: UUID, db: Session) -> str:
    """Get display name for scheduled item."""
    if item_type == ScheduledItemType.PAGE:
        page = db.query(Page).filter(Page.id == item_id).first()
        return page.name if page else "Unknown Page"
    elif item_type == ScheduledItemType.BLOG_POST:
        post = db.query(BlogPost).filter(BlogPost.id == item_id).first()
        return post.title if post else "Unknown Post"
    else:
        return "Full Site"


def enrich_schedule(schedule: ScheduledPublish, db: Session) -> ScheduleResponse:
    """Enrich schedule with additional data."""
    item_name = get_item_name(schedule.item_type, schedule.item_id, db) if schedule.item_id else "Full Site"

    return ScheduleResponse(
        id=schedule.id,
        project_id=schedule.project_id,
        item_type=schedule.item_type.value,
        item_id=schedule.item_id,
        item_name=item_name,
        scheduled_at=schedule.scheduled_at,
        timezone=schedule.timezone,
        status=schedule.status.value,
        action=schedule.action,
        published_at=schedule.published_at,
        error_message=schedule.error_message,
        created_by_id=schedule.created_by_id,
        created_by_name=schedule.created_by.name if schedule.created_by else None,
        notes=schedule.notes,
        created_at=schedule.created_at,
    )


async def execute_scheduled_publish(schedule_id: UUID, db: Session):
    """Execute a scheduled publish."""
    schedule = db.query(ScheduledPublish).filter(ScheduledPublish.id == schedule_id).first()
    if not schedule or schedule.status != ScheduledItemStatus.PENDING:
        return

    start_time = datetime.utcnow()
    success = False
    error_message = None
    deployment = None

    try:
        if schedule.item_type == ScheduledItemType.PAGE:
            # Publish single page - mark as published
            page = db.query(Page).filter(Page.id == schedule.item_id).first()
            if page:
                # Page is published by being part of the project
                success = True
            else:
                error_message = "Page not found"

        elif schedule.item_type == ScheduledItemType.BLOG_POST:
            # Publish blog post
            post = db.query(BlogPost).filter(BlogPost.id == schedule.item_id).first()
            if post:
                post.status = BlogPostStatus.PUBLISHED
                post.published_at = datetime.utcnow()
                db.commit()
                success = True
            else:
                error_message = "Blog post not found"

        elif schedule.item_type == ScheduledItemType.SITE:
            # Trigger full site deployment
            # This would typically trigger the deployment worker
            deployment = Deployment(
                project_id=schedule.project_id,
                status="pending",
                triggered_by="scheduled",
            )
            db.add(deployment)
            db.commit()
            success = True

    except Exception as e:
        error_message = str(e)

    # Update schedule status
    schedule.status = ScheduledItemStatus.PUBLISHED if success else ScheduledItemStatus.FAILED
    schedule.published_at = datetime.utcnow() if success else None
    schedule.error_message = error_message

    # Record in history
    duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
    history = PublishHistory(
        project_id=schedule.project_id,
        item_type=schedule.item_type,
        item_id=schedule.item_id,
        item_name=get_item_name(schedule.item_type, schedule.item_id, db) if schedule.item_id else "Full Site",
        trigger="scheduled",
        scheduled_publish_id=schedule.id,
        success=success,
        error_message=error_message,
        deployment_id=deployment.id if deployment else None,
        duration_ms=duration_ms,
    )
    db.add(history)
    db.commit()


# =============================================================================
# SCHEDULE ENDPOINTS
# =============================================================================

@router.get("", response_model=List[ScheduleResponse])
async def list_scheduled(
    project_id: UUID,
    status: Optional[ScheduledItemStatus] = None,
    item_type: Optional[ScheduledItemType] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List scheduled publications."""
    project = get_project_access(project_id, user, db)

    query = db.query(ScheduledPublish).filter(
        ScheduledPublish.project_id == project.id
    )

    if status:
        query = query.filter(ScheduledPublish.status == status)
    if item_type:
        query = query.filter(ScheduledPublish.item_type == item_type)

    schedules = query.order_by(ScheduledPublish.scheduled_at).offset(offset).limit(limit).all()

    return [enrich_schedule(s, db) for s in schedules]


@router.post("", response_model=ScheduleResponse)
async def create_scheduled(
    project_id: UUID,
    request: ScheduleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Schedule a publication."""
    project = get_project_access(project_id, user, db)

    # Validate item exists
    if request.item_type == ScheduledItemType.PAGE:
        if not request.item_id:
            raise HTTPException(status_code=400, detail="item_id required for page")
        page = db.query(Page).filter(
            Page.id == request.item_id,
            Page.project_id == project.id
        ).first()
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")

    elif request.item_type == ScheduledItemType.BLOG_POST:
        if not request.item_id:
            raise HTTPException(status_code=400, detail="item_id required for blog post")
        post = db.query(BlogPost).filter(
            BlogPost.id == request.item_id,
            BlogPost.project_id == project.id
        ).first()
        if not post:
            raise HTTPException(status_code=404, detail="Blog post not found")

    # Validate scheduled time is in the future
    if request.scheduled_at <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Scheduled time must be in the future")

    # Create content snapshot
    content_snapshot = None
    if request.item_type == ScheduledItemType.PAGE:
        page = db.query(Page).filter(Page.id == request.item_id).first()
        content_snapshot = {"canvas_components": page.canvas_components}
    elif request.item_type == ScheduledItemType.BLOG_POST:
        post = db.query(BlogPost).filter(BlogPost.id == request.item_id).first()
        content_snapshot = {"title": post.title, "content": post.content}

    schedule = ScheduledPublish(
        project_id=project.id,
        item_type=request.item_type,
        item_id=request.item_id,
        scheduled_at=request.scheduled_at,
        timezone=request.timezone,
        action=request.action,
        content_snapshot=content_snapshot,
        created_by_id=user.id,
        notes=request.notes,
    )

    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return enrich_schedule(schedule, db)


@router.get("/queue", response_model=QueueStats)
async def get_queue_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get queue statistics."""
    project = get_project_access(project_id, user, db)

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    pending_count = db.query(ScheduledPublish).filter(
        ScheduledPublish.project_id == project.id,
        ScheduledPublish.status == ScheduledItemStatus.PENDING
    ).count()

    published_today = db.query(PublishHistory).filter(
        PublishHistory.project_id == project.id,
        PublishHistory.published_at >= today_start,
        PublishHistory.success == True
    ).count()

    failed_today = db.query(PublishHistory).filter(
        PublishHistory.project_id == project.id,
        PublishHistory.published_at >= today_start,
        PublishHistory.success == False
    ).count()

    # Next scheduled
    next_schedule = db.query(ScheduledPublish).filter(
        ScheduledPublish.project_id == project.id,
        ScheduledPublish.status == ScheduledItemStatus.PENDING,
        ScheduledPublish.scheduled_at > now
    ).order_by(ScheduledPublish.scheduled_at).first()

    # Upcoming (next 5)
    upcoming = db.query(ScheduledPublish).filter(
        ScheduledPublish.project_id == project.id,
        ScheduledPublish.status == ScheduledItemStatus.PENDING
    ).order_by(ScheduledPublish.scheduled_at).limit(5).all()

    return QueueStats(
        pending_count=pending_count,
        published_today=published_today,
        failed_today=failed_today,
        next_scheduled=next_schedule.scheduled_at if next_schedule else None,
        upcoming=[enrich_schedule(s, db) for s in upcoming]
    )


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_scheduled(
    project_id: UUID,
    schedule_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific scheduled item."""
    project = get_project_access(project_id, user, db)

    schedule = db.query(ScheduledPublish).filter(
        ScheduledPublish.id == schedule_id,
        ScheduledPublish.project_id == project.id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Scheduled item not found")

    return enrich_schedule(schedule, db)


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_scheduled(
    project_id: UUID,
    schedule_id: UUID,
    request: ScheduleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a scheduled item."""
    project = get_project_access(project_id, user, db)

    schedule = db.query(ScheduledPublish).filter(
        ScheduledPublish.id == schedule_id,
        ScheduledPublish.project_id == project.id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Scheduled item not found")

    if schedule.status != ScheduledItemStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only update pending items")

    if request.scheduled_at:
        if request.scheduled_at <= datetime.utcnow():
            raise HTTPException(status_code=400, detail="Scheduled time must be in the future")
        schedule.scheduled_at = request.scheduled_at

    if request.timezone:
        schedule.timezone = request.timezone
    if request.notes is not None:
        schedule.notes = request.notes

    db.commit()
    db.refresh(schedule)

    return enrich_schedule(schedule, db)


@router.delete("/{schedule_id}")
async def cancel_scheduled(
    project_id: UUID,
    schedule_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Cancel a scheduled item."""
    project = get_project_access(project_id, user, db)

    schedule = db.query(ScheduledPublish).filter(
        ScheduledPublish.id == schedule_id,
        ScheduledPublish.project_id == project.id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Scheduled item not found")

    if schedule.status != ScheduledItemStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only cancel pending items")

    schedule.status = ScheduledItemStatus.CANCELLED
    db.commit()

    return {"success": True, "message": "Scheduled publication cancelled"}


@router.post("/{schedule_id}/publish-now")
async def publish_now(
    project_id: UUID,
    schedule_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Publish a scheduled item immediately."""
    project = get_project_access(project_id, user, db)

    schedule = db.query(ScheduledPublish).filter(
        ScheduledPublish.id == schedule_id,
        ScheduledPublish.project_id == project.id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Scheduled item not found")

    if schedule.status != ScheduledItemStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only publish pending items")

    # Execute in background
    background_tasks.add_task(execute_scheduled_publish, schedule_id, db)

    return {"success": True, "message": "Publishing started"}


# =============================================================================
# HISTORY ENDPOINTS
# =============================================================================

@router.get("/history/all", response_model=List[PublishHistoryResponse])
async def list_publish_history(
    project_id: UUID,
    item_type: Optional[ScheduledItemType] = None,
    success_only: bool = False,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List publish history."""
    project = get_project_access(project_id, user, db)

    query = db.query(PublishHistory).filter(
        PublishHistory.project_id == project.id
    )

    if item_type:
        query = query.filter(PublishHistory.item_type == item_type)
    if success_only:
        query = query.filter(PublishHistory.success == True)

    history = query.order_by(desc(PublishHistory.published_at)).offset(offset).limit(limit).all()

    return [
        PublishHistoryResponse(
            id=h.id,
            item_type=h.item_type.value,
            item_id=h.item_id,
            item_name=h.item_name,
            trigger=h.trigger,
            success=h.success,
            error_message=h.error_message,
            published_by_id=h.published_by_id,
            published_by_name=h.published_by.name if h.published_by else None,
            duration_ms=h.duration_ms,
            published_at=h.published_at,
        )
        for h in history
    ]


# =============================================================================
# MANUAL PUBLISH ENDPOINTS
# =============================================================================

@router.post("/publish/page/{page_id}")
async def publish_page_now(
    project_id: UUID,
    page_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Publish a page immediately."""
    project = get_project_access(project_id, user, db)

    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Record in history
    history = PublishHistory(
        project_id=project.id,
        item_type=ScheduledItemType.PAGE,
        item_id=page.id,
        item_name=page.name,
        trigger="manual",
        success=True,
        published_by_id=user.id,
    )
    db.add(history)
    db.commit()

    return {"success": True, "message": f"Page '{page.name}' published"}


@router.post("/publish/blog/{post_id}")
async def publish_blog_now(
    project_id: UUID,
    post_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Publish a blog post immediately."""
    project = get_project_access(project_id, user, db)

    post = db.query(BlogPost).filter(
        BlogPost.id == post_id,
        BlogPost.project_id == project.id
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    post.status = BlogPostStatus.PUBLISHED
    post.published_at = datetime.utcnow()

    # Record in history
    history = PublishHistory(
        project_id=project.id,
        item_type=ScheduledItemType.BLOG_POST,
        item_id=post.id,
        item_name=post.title,
        trigger="manual",
        success=True,
        published_by_id=user.id,
    )
    db.add(history)
    db.commit()

    return {"success": True, "message": f"Blog post '{post.title}' published"}


@router.post("/publish/site")
async def publish_site_now(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Trigger a full site deployment."""
    project = get_project_access(project_id, user, db)

    # Create deployment
    deployment = Deployment(
        project_id=project.id,
        status="pending",
        triggered_by="manual",
    )
    db.add(deployment)
    db.flush()

    # Record in history
    history = PublishHistory(
        project_id=project.id,
        item_type=ScheduledItemType.SITE,
        item_id=None,
        item_name="Full Site",
        trigger="manual",
        success=True,
        published_by_id=user.id,
        deployment_id=deployment.id,
    )
    db.add(history)
    db.commit()

    return {
        "success": True,
        "message": "Site deployment queued",
        "deployment_id": str(deployment.id)
    }
