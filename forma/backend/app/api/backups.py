"""Backup/Restore System API."""
import hashlib
import json
import os
import zipfile
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, Component, User,
    ProjectBackup, BackupSchedule, RestoreLog,
    BackupType, BackupStatus
)
from app.core.security import get_current_user_required as get_current_user
from app.core.config import settings


router = APIRouter(prefix="/api/projects/{project_id}/backups", tags=["backups"])


# =============================================================================
# SCHEMAS
# =============================================================================

class BackupCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class BackupResponse(BaseModel):
    id: UUID
    project_id: UUID
    backup_type: str
    name: Optional[str]
    description: Optional[str]
    status: str
    error_message: Optional[str]
    file_size: Optional[int]
    pages_count: int
    components_count: int
    assets_count: int
    expires_at: Optional[datetime]
    is_pinned: bool
    created_by_id: Optional[UUID]
    trigger_reason: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ScheduleUpdate(BaseModel):
    enabled: Optional[bool] = None
    frequency: Optional[str] = None
    hour: Optional[int] = None
    day_of_week: Optional[int] = None
    day_of_month: Optional[int] = None
    timezone: Optional[str] = None
    retention_count: Optional[int] = None
    retention_days: Optional[int] = None


class ScheduleResponse(BaseModel):
    id: UUID
    project_id: UUID
    enabled: bool
    frequency: str
    hour: int
    day_of_week: Optional[int]
    day_of_month: Optional[int]
    timezone: str
    retention_count: int
    retention_days: int
    last_run_at: Optional[datetime]
    last_status: Optional[str]
    next_run_at: Optional[datetime]

    class Config:
        from_attributes = True


class RestoreRequest(BaseModel):
    restore_pages: bool = True
    restore_components: bool = True
    restore_settings: bool = True
    create_pre_restore_backup: bool = True


class RestoreLogResponse(BaseModel):
    id: UUID
    backup_id: UUID
    success: bool
    error_message: Optional[str]
    pages_restored: int
    components_restored: int
    settings_restored: bool
    pre_restore_backup_id: Optional[UUID]
    restored_by_id: UUID
    duration_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


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


def get_or_create_schedule(project_id: UUID, db: Session) -> BackupSchedule:
    """Get or create backup schedule."""
    schedule = db.query(BackupSchedule).filter(
        BackupSchedule.project_id == project_id
    ).first()

    if not schedule:
        schedule = BackupSchedule(
            project_id=project_id,
            enabled=False,
            frequency="daily",
            hour=3,
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

    return schedule


def serialize_project_data(project: Project, db: Session) -> dict:
    """Serialize all project data for backup."""
    pages = db.query(Page).filter(Page.project_id == project.id).all()
    components = db.query(Component).filter(Component.project_id == project.id).all()

    return {
        "version": "1.0",
        "backed_up_at": datetime.utcnow().isoformat(),
        "project": {
            "name": project.name,
            "description": project.description,
            "design_system": project.design_system,
            "settings": project.settings,
        },
        "pages": [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "page_type": p.page_type.value if p.page_type else "page",
                "canvas_components": p.canvas_components,
                "layout": p.layout,
                "is_homepage": p.is_homepage,
                "meta_title": p.meta_title,
                "meta_description": p.meta_description,
                "position": p.position,
            }
            for p in pages
        ],
        "components": [
            {
                "id": str(c.id),
                "name": c.name,
                "intent": c.intent,
                "code": c.code,
                "props_schema": c.props_schema,
                "tags": c.tags,
                "position": c.position,
            }
            for c in components
        ],
    }


async def create_backup_file(backup: ProjectBackup, project: Project, db: Session):
    """Create the backup file."""
    backup.status = BackupStatus.IN_PROGRESS
    db.commit()

    try:
        # Get project data
        data = serialize_project_data(project, db)

        # Update counts
        backup.pages_count = len(data["pages"])
        backup.components_count = len(data["components"])

        # Create backup directory
        backup_dir = os.path.join(
            settings.upload_dir if hasattr(settings, 'upload_dir') else "/tmp",
            "backups",
            str(project.id)
        )
        os.makedirs(backup_dir, exist_ok=True)

        # Create filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.zip"
        filepath = os.path.join(backup_dir, filename)

        # Create ZIP file
        with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add manifest
            zf.writestr("manifest.json", json.dumps(data, indent=2))

            # Add pages individually
            for page in data["pages"]:
                zf.writestr(f"pages/{page['slug']}.json", json.dumps(page, indent=2))

            # Add components individually
            for comp in data["components"]:
                zf.writestr(f"components/{comp['name']}.json", json.dumps(comp, indent=2))
                if comp.get("code"):
                    zf.writestr(f"components/{comp['name']}.tsx", comp["code"])

        # Calculate checksum
        with open(filepath, 'rb') as f:
            checksum = hashlib.sha256(f.read()).hexdigest()

        # Update backup record
        backup.file_path = filepath
        backup.file_size = os.path.getsize(filepath)
        backup.checksum = checksum
        backup.status = BackupStatus.COMPLETED
        backup.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        backup.status = BackupStatus.FAILED
        backup.error_message = str(e)
        db.commit()


async def restore_from_backup(
    backup: ProjectBackup,
    project: Project,
    options: RestoreRequest,
    user: User,
    db: Session
) -> RestoreLog:
    """Restore project from backup."""
    start_time = datetime.utcnow()
    pre_restore_backup_id = None

    # Create pre-restore backup
    if options.create_pre_restore_backup:
        pre_backup = ProjectBackup(
            project_id=project.id,
            backup_type=BackupType.AUTO,
            name=f"Pre-restore backup",
            trigger_reason=f"Before restoring from backup {backup.id}",
            created_by_id=user.id,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )
        db.add(pre_backup)
        db.flush()
        await create_backup_file(pre_backup, project, db)
        pre_restore_backup_id = pre_backup.id

    pages_restored = 0
    components_restored = 0
    settings_restored = False

    try:
        # Read backup file
        with zipfile.ZipFile(backup.file_path, 'r') as zf:
            manifest = json.loads(zf.read("manifest.json"))

        # Restore settings
        if options.restore_settings:
            project.design_system = manifest["project"].get("design_system", {})
            project.settings = manifest["project"].get("settings", {})
            settings_restored = True

        # Restore pages
        if options.restore_pages:
            # Delete existing pages
            db.query(Page).filter(Page.project_id == project.id).delete()

            for page_data in manifest.get("pages", []):
                page = Page(
                    project_id=project.id,
                    name=page_data["name"],
                    slug=page_data["slug"],
                    description=page_data.get("description"),
                    canvas_components=page_data.get("canvas_components", []),
                    layout=page_data.get("layout", "default"),
                    is_homepage=page_data.get("is_homepage", False),
                    meta_title=page_data.get("meta_title"),
                    meta_description=page_data.get("meta_description"),
                    position=page_data.get("position", 0),
                )
                db.add(page)
                pages_restored += 1

        # Restore components
        if options.restore_components:
            # Delete existing components
            db.query(Component).filter(Component.project_id == project.id).delete()

            for comp_data in manifest.get("components", []):
                component = Component(
                    project_id=project.id,
                    name=comp_data["name"],
                    intent=comp_data.get("intent"),
                    code=comp_data.get("code"),
                    props_schema=comp_data.get("props_schema"),
                    tags=comp_data.get("tags", []),
                    position=comp_data.get("position", 0),
                )
                db.add(component)
                components_restored += 1

        db.commit()

        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        log = RestoreLog(
            project_id=project.id,
            backup_id=backup.id,
            success=True,
            pages_restored=pages_restored,
            components_restored=components_restored,
            settings_restored=settings_restored,
            pre_restore_backup_id=pre_restore_backup_id,
            restored_by_id=user.id,
            duration_ms=duration,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return log

    except Exception as e:
        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        log = RestoreLog(
            project_id=project.id,
            backup_id=backup.id,
            success=False,
            error_message=str(e),
            pre_restore_backup_id=pre_restore_backup_id,
            restored_by_id=user.id,
            duration_ms=duration,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return log


# =============================================================================
# BACKUP ENDPOINTS
# =============================================================================

@router.get("", response_model=List[BackupResponse])
async def list_backups(
    project_id: UUID,
    status: Optional[BackupStatus] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List project backups."""
    project = get_project_access(project_id, user, db)

    query = db.query(ProjectBackup).filter(ProjectBackup.project_id == project.id)

    if status:
        query = query.filter(ProjectBackup.status == status)

    backups = query.order_by(desc(ProjectBackup.created_at)).offset(offset).limit(limit).all()

    return [BackupResponse.model_validate(b) for b in backups]


@router.post("", response_model=BackupResponse)
async def create_backup(
    project_id: UUID,
    request: BackupCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a manual backup."""
    project = get_project_access(project_id, user, db)

    backup = ProjectBackup(
        project_id=project.id,
        backup_type=BackupType.MANUAL,
        name=request.name,
        description=request.description,
        trigger_reason="User requested",
        created_by_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=30),
    )

    db.add(backup)
    db.commit()
    db.refresh(backup)

    # Create backup in background
    background_tasks.add_task(create_backup_file, backup, project, db)

    return BackupResponse.model_validate(backup)


@router.get("/{backup_id}", response_model=BackupResponse)
async def get_backup(
    project_id: UUID,
    backup_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific backup."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    return BackupResponse.model_validate(backup)


@router.delete("/{backup_id}")
async def delete_backup(
    project_id: UUID,
    backup_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a backup."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    # Delete file
    if backup.file_path and os.path.exists(backup.file_path):
        os.remove(backup.file_path)

    db.delete(backup)
    db.commit()

    return {"success": True}


@router.get("/{backup_id}/download")
async def download_backup(
    project_id: UUID,
    backup_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Download a backup file."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    if backup.status != BackupStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Backup not ready")

    if not backup.file_path or not os.path.exists(backup.file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")

    def iterfile():
        with open(backup.file_path, "rb") as f:
            yield from f

    filename = f"{project.name.replace(' ', '_')}_backup_{backup.created_at.strftime('%Y%m%d')}.zip"

    return StreamingResponse(
        iterfile(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/{backup_id}/pin")
async def pin_backup(
    project_id: UUID,
    backup_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Pin a backup (prevent auto-deletion)."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    backup.is_pinned = True
    backup.expires_at = None
    db.commit()

    return {"success": True}


@router.post("/{backup_id}/unpin")
async def unpin_backup(
    project_id: UUID,
    backup_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Unpin a backup."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    backup.is_pinned = False
    backup.expires_at = datetime.utcnow() + timedelta(days=30)
    db.commit()

    return {"success": True}


# =============================================================================
# RESTORE ENDPOINTS
# =============================================================================

@router.post("/{backup_id}/restore", response_model=RestoreLogResponse)
async def restore_backup(
    project_id: UUID,
    backup_id: UUID,
    request: RestoreRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Restore project from a backup."""
    project = get_project_access(project_id, user, db)

    backup = db.query(ProjectBackup).filter(
        ProjectBackup.id == backup_id,
        ProjectBackup.project_id == project.id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    if backup.status != BackupStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Backup not ready")

    if not backup.file_path or not os.path.exists(backup.file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")

    log = await restore_from_backup(backup, project, request, user, db)

    if not log.success:
        raise HTTPException(status_code=500, detail=log.error_message)

    return RestoreLogResponse.model_validate(log)


@router.get("/restore/history", response_model=List[RestoreLogResponse])
async def list_restore_history(
    project_id: UUID,
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List restore history."""
    project = get_project_access(project_id, user, db)

    logs = db.query(RestoreLog).filter(
        RestoreLog.project_id == project.id
    ).order_by(desc(RestoreLog.created_at)).limit(limit).all()

    return [RestoreLogResponse.model_validate(l) for l in logs]


# =============================================================================
# SCHEDULE ENDPOINTS
# =============================================================================

@router.get("/schedule", response_model=ScheduleResponse)
async def get_schedule(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get backup schedule."""
    project = get_project_access(project_id, user, db)
    schedule = get_or_create_schedule(project.id, db)
    return ScheduleResponse.model_validate(schedule)


@router.put("/schedule", response_model=ScheduleResponse)
async def update_schedule(
    project_id: UUID,
    request: ScheduleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update backup schedule."""
    project = get_project_access(project_id, user, db)
    schedule = get_or_create_schedule(project.id, db)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(schedule, field, value)

    # Calculate next run time
    if schedule.enabled:
        now = datetime.utcnow()
        if schedule.frequency == "hourly":
            schedule.next_run_at = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        elif schedule.frequency == "daily":
            next_run = now.replace(hour=schedule.hour, minute=0, second=0, microsecond=0)
            if next_run <= now:
                next_run += timedelta(days=1)
            schedule.next_run_at = next_run
        elif schedule.frequency == "weekly":
            days_ahead = schedule.day_of_week - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            next_run = now + timedelta(days=days_ahead)
            schedule.next_run_at = next_run.replace(hour=schedule.hour, minute=0, second=0, microsecond=0)

    db.commit()
    db.refresh(schedule)

    return ScheduleResponse.model_validate(schedule)


# =============================================================================
# STATS
# =============================================================================

@router.get("/stats")
async def get_backup_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get backup statistics."""
    project = get_project_access(project_id, user, db)

    total = db.query(ProjectBackup).filter(
        ProjectBackup.project_id == project.id
    ).count()

    completed = db.query(ProjectBackup).filter(
        ProjectBackup.project_id == project.id,
        ProjectBackup.status == BackupStatus.COMPLETED
    ).count()

    # Total storage
    backups = db.query(ProjectBackup).filter(
        ProjectBackup.project_id == project.id,
        ProjectBackup.file_size.isnot(None)
    ).all()
    total_size = sum(b.file_size or 0 for b in backups)

    # Latest backup
    latest = db.query(ProjectBackup).filter(
        ProjectBackup.project_id == project.id,
        ProjectBackup.status == BackupStatus.COMPLETED
    ).order_by(desc(ProjectBackup.completed_at)).first()

    # Schedule info
    schedule = db.query(BackupSchedule).filter(
        BackupSchedule.project_id == project.id
    ).first()

    return {
        "total_backups": total,
        "completed_backups": completed,
        "total_storage_bytes": total_size,
        "latest_backup": {
            "id": str(latest.id),
            "created_at": latest.created_at.isoformat(),
            "file_size": latest.file_size
        } if latest else None,
        "schedule_enabled": schedule.enabled if schedule else False,
        "next_scheduled": schedule.next_run_at.isoformat() if schedule and schedule.next_run_at else None
    }
