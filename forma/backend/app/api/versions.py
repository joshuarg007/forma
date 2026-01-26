"""Version History API for pages and components."""
import json
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, Component, PageVersion, ComponentVersion,
    VersionType, User
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}", tags=["versions"])


# =============================================================================
# SCHEMAS
# =============================================================================

class VersionBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CreateVersionRequest(VersionBase):
    """Request to create a manual checkpoint."""
    pass


class PageVersionResponse(BaseModel):
    id: UUID
    page_id: UUID
    version_number: int
    version_type: str
    name: Optional[str]
    description: Optional[str]
    file_size: Optional[int]
    created_by_id: Optional[UUID]
    created_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PageVersionDetailResponse(PageVersionResponse):
    """Version with full canvas data."""
    canvas_components: list
    page_settings: Optional[dict]


class ComponentVersionResponse(BaseModel):
    id: UUID
    component_id: UUID
    version_number: int
    version_type: str
    name: Optional[str]
    description: Optional[str]
    file_size: Optional[int]
    created_by_id: Optional[UUID]
    created_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ComponentVersionDetailResponse(ComponentVersionResponse):
    """Version with full code data."""
    code: str
    props_schema: Optional[dict]
    intent: Optional[str]


class VersionDiff(BaseModel):
    """Diff between two versions."""
    added: list
    removed: list
    modified: list
    summary: str


# =============================================================================
# HELPERS
# =============================================================================

def get_project_access(project_id: UUID, user: User, db: Session) -> Project:
    """Get project with access check."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user.id:
        # TODO: Check team membership
        raise HTTPException(status_code=403, detail="Access denied")
    return project


def create_page_version(
    db: Session,
    page: Page,
    version_type: VersionType,
    user_id: UUID = None,
    name: str = None,
    description: str = None
) -> PageVersion:
    """Create a new page version snapshot."""
    # Get next version number
    latest = db.query(PageVersion).filter(
        PageVersion.page_id == page.id
    ).order_by(desc(PageVersion.version_number)).first()

    version_number = (latest.version_number + 1) if latest else 1

    # Calculate snapshot size
    snapshot = json.dumps(page.canvas_components or [])
    file_size = len(snapshot.encode('utf-8'))

    # Build page settings snapshot
    page_settings = {
        "meta_title": page.meta_title,
        "meta_description": page.meta_description,
        "layout": page.layout,
        "is_homepage": page.is_homepage,
        "show_in_nav": page.show_in_nav,
        "nav_label": page.nav_label,
    }

    version = PageVersion(
        page_id=page.id,
        project_id=page.project_id,
        version_number=version_number,
        version_type=version_type,
        name=name,
        description=description,
        canvas_components=page.canvas_components or [],
        page_settings=page_settings,
        created_by_id=user_id,
        file_size=file_size,
    )

    db.add(version)
    db.commit()
    db.refresh(version)
    return version


def create_component_version(
    db: Session,
    component: Component,
    version_type: VersionType,
    user_id: UUID = None,
    name: str = None,
    description: str = None
) -> ComponentVersion:
    """Create a new component version snapshot."""
    # Get next version number
    latest = db.query(ComponentVersion).filter(
        ComponentVersion.component_id == component.id
    ).order_by(desc(ComponentVersion.version_number)).first()

    version_number = (latest.version_number + 1) if latest else 1

    # Calculate snapshot size
    file_size = len((component.code or "").encode('utf-8'))

    version = ComponentVersion(
        component_id=component.id,
        project_id=component.project_id,
        version_number=version_number,
        version_type=version_type,
        name=name,
        description=description,
        code=component.code or "",
        props_schema=component.props_schema,
        intent=component.intent,
        created_by_id=user_id,
        file_size=file_size,
    )

    db.add(version)
    db.commit()
    db.refresh(version)
    return version


# =============================================================================
# PAGE VERSION ENDPOINTS
# =============================================================================

@router.get("/pages/{page_id}/versions", response_model=List[PageVersionResponse])
async def list_page_versions(
    project_id: UUID,
    page_id: UUID,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all versions for a page."""
    project = get_project_access(project_id, user, db)

    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    versions = db.query(PageVersion).filter(
        PageVersion.page_id == page_id
    ).order_by(desc(PageVersion.version_number)).offset(offset).limit(limit).all()

    # Enrich with creator names
    result = []
    for v in versions:
        data = PageVersionResponse.model_validate(v)
        if v.created_by:
            data.created_by_name = v.created_by.name or v.created_by.email
        result.append(data)

    return result


@router.get("/pages/{page_id}/versions/{version_id}", response_model=PageVersionDetailResponse)
async def get_page_version(
    project_id: UUID,
    page_id: UUID,
    version_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific page version with full data."""
    project = get_project_access(project_id, user, db)

    version = db.query(PageVersion).filter(
        PageVersion.id == version_id,
        PageVersion.page_id == page_id
    ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    data = PageVersionDetailResponse.model_validate(version)
    if version.created_by:
        data.created_by_name = version.created_by.name or version.created_by.email

    return data


@router.post("/pages/{page_id}/versions", response_model=PageVersionResponse)
async def create_page_checkpoint(
    project_id: UUID,
    page_id: UUID,
    request: CreateVersionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a manual checkpoint for a page."""
    project = get_project_access(project_id, user, db)

    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    version = create_page_version(
        db=db,
        page=page,
        version_type=VersionType.MANUAL,
        user_id=user.id,
        name=request.name,
        description=request.description
    )

    return PageVersionResponse.model_validate(version)


@router.post("/pages/{page_id}/versions/{version_id}/restore")
async def restore_page_version(
    project_id: UUID,
    page_id: UUID,
    version_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Restore a page to a previous version."""
    project = get_project_access(project_id, user, db)

    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    version = db.query(PageVersion).filter(
        PageVersion.id == version_id,
        PageVersion.page_id == page_id
    ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    # Create a restore checkpoint of current state first
    create_page_version(
        db=db,
        page=page,
        version_type=VersionType.RESTORE,
        user_id=user.id,
        description=f"Backup before restoring to v{version.version_number}"
    )

    # Restore the page
    page.canvas_components = version.canvas_components
    if version.page_settings:
        page.meta_title = version.page_settings.get("meta_title")
        page.meta_description = version.page_settings.get("meta_description")
        page.layout = version.page_settings.get("layout", "default")

    page.updated_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "restored_to_version": version.version_number,
        "message": f"Page restored to version {version.version_number}"
    }


@router.get("/pages/{page_id}/versions/{v1_id}/diff/{v2_id}", response_model=VersionDiff)
async def diff_page_versions(
    project_id: UUID,
    page_id: UUID,
    v1_id: UUID,
    v2_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Compare two page versions."""
    project = get_project_access(project_id, user, db)

    v1 = db.query(PageVersion).filter(
        PageVersion.id == v1_id,
        PageVersion.page_id == page_id
    ).first()

    v2 = db.query(PageVersion).filter(
        PageVersion.id == v2_id,
        PageVersion.page_id == page_id
    ).first()

    if not v1 or not v2:
        raise HTTPException(status_code=404, detail="Version not found")

    # Extract component IDs from both versions
    v1_ids = {c.get("id") for c in (v1.canvas_components or []) if c.get("id")}
    v2_ids = {c.get("id") for c in (v2.canvas_components or []) if c.get("id")}

    # Find differences
    added_ids = v2_ids - v1_ids
    removed_ids = v1_ids - v2_ids
    common_ids = v1_ids & v2_ids

    # Get full component data for added/removed
    added = [c for c in (v2.canvas_components or []) if c.get("id") in added_ids]
    removed = [c for c in (v1.canvas_components or []) if c.get("id") in removed_ids]

    # Check for modified components
    v1_map = {c.get("id"): c for c in (v1.canvas_components or []) if c.get("id")}
    v2_map = {c.get("id"): c for c in (v2.canvas_components or []) if c.get("id")}

    modified = []
    for cid in common_ids:
        if json.dumps(v1_map[cid], sort_keys=True) != json.dumps(v2_map[cid], sort_keys=True):
            modified.append({
                "id": cid,
                "before": v1_map[cid],
                "after": v2_map[cid]
            })

    summary = f"{len(added)} added, {len(removed)} removed, {len(modified)} modified"

    return VersionDiff(
        added=added,
        removed=removed,
        modified=modified,
        summary=summary
    )


# =============================================================================
# COMPONENT VERSION ENDPOINTS
# =============================================================================

@router.get("/components/{component_id}/versions", response_model=List[ComponentVersionResponse])
async def list_component_versions(
    project_id: UUID,
    component_id: UUID,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all versions for a component."""
    project = get_project_access(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project.id
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    versions = db.query(ComponentVersion).filter(
        ComponentVersion.component_id == component_id
    ).order_by(desc(ComponentVersion.version_number)).offset(offset).limit(limit).all()

    result = []
    for v in versions:
        data = ComponentVersionResponse.model_validate(v)
        if v.created_by:
            data.created_by_name = v.created_by.name or v.created_by.email
        result.append(data)

    return result


@router.get("/components/{component_id}/versions/{version_id}", response_model=ComponentVersionDetailResponse)
async def get_component_version(
    project_id: UUID,
    component_id: UUID,
    version_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific component version with full data."""
    project = get_project_access(project_id, user, db)

    version = db.query(ComponentVersion).filter(
        ComponentVersion.id == version_id,
        ComponentVersion.component_id == component_id
    ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    data = ComponentVersionDetailResponse.model_validate(version)
    if version.created_by:
        data.created_by_name = version.created_by.name or version.created_by.email

    return data


@router.post("/components/{component_id}/versions", response_model=ComponentVersionResponse)
async def create_component_checkpoint(
    project_id: UUID,
    component_id: UUID,
    request: CreateVersionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a manual checkpoint for a component."""
    project = get_project_access(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project.id
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    version = create_component_version(
        db=db,
        component=component,
        version_type=VersionType.MANUAL,
        user_id=user.id,
        name=request.name,
        description=request.description
    )

    return ComponentVersionResponse.model_validate(version)


@router.post("/components/{component_id}/versions/{version_id}/restore")
async def restore_component_version(
    project_id: UUID,
    component_id: UUID,
    version_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Restore a component to a previous version."""
    project = get_project_access(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project.id
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    version = db.query(ComponentVersion).filter(
        ComponentVersion.id == version_id,
        ComponentVersion.component_id == component_id
    ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    # Create a restore checkpoint of current state first
    create_component_version(
        db=db,
        component=component,
        version_type=VersionType.RESTORE,
        user_id=user.id,
        description=f"Backup before restoring to v{version.version_number}"
    )

    # Restore the component
    component.code = version.code
    component.props_schema = version.props_schema
    component.intent = version.intent
    component.updated_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "restored_to_version": version.version_number,
        "message": f"Component restored to version {version.version_number}"
    }


@router.get("/components/{component_id}/versions/{v1_id}/diff/{v2_id}")
async def diff_component_versions(
    project_id: UUID,
    component_id: UUID,
    v1_id: UUID,
    v2_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Compare two component versions."""
    project = get_project_access(project_id, user, db)

    v1 = db.query(ComponentVersion).filter(
        ComponentVersion.id == v1_id,
        ComponentVersion.component_id == component_id
    ).first()

    v2 = db.query(ComponentVersion).filter(
        ComponentVersion.id == v2_id,
        ComponentVersion.component_id == component_id
    ).first()

    if not v1 or not v2:
        raise HTTPException(status_code=404, detail="Version not found")

    # Simple line-based diff for code
    v1_lines = (v1.code or "").splitlines()
    v2_lines = (v2.code or "").splitlines()

    added_lines = []
    removed_lines = []

    # Find unique lines in each version
    for i, line in enumerate(v2_lines):
        if line not in v1_lines:
            added_lines.append({"line": i + 1, "content": line})

    for i, line in enumerate(v1_lines):
        if line not in v2_lines:
            removed_lines.append({"line": i + 1, "content": line})

    return {
        "v1_version": v1.version_number,
        "v2_version": v2.version_number,
        "v1_lines": len(v1_lines),
        "v2_lines": len(v2_lines),
        "added_lines": added_lines,
        "removed_lines": removed_lines,
        "summary": f"+{len(added_lines)} -{len(removed_lines)} lines"
    }


# =============================================================================
# PROJECT-WIDE VERSION STATS
# =============================================================================

@router.get("/versions/stats")
async def get_version_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get version statistics for the project."""
    project = get_project_access(project_id, user, db)

    page_version_count = db.query(PageVersion).filter(
        PageVersion.project_id == project.id
    ).count()

    component_version_count = db.query(ComponentVersion).filter(
        ComponentVersion.project_id == project.id
    ).count()

    # Recent versions
    recent_page_versions = db.query(PageVersion).filter(
        PageVersion.project_id == project.id
    ).order_by(desc(PageVersion.created_at)).limit(5).all()

    recent_component_versions = db.query(ComponentVersion).filter(
        ComponentVersion.project_id == project.id
    ).order_by(desc(ComponentVersion.created_at)).limit(5).all()

    return {
        "page_versions_total": page_version_count,
        "component_versions_total": component_version_count,
        "recent_page_versions": [
            {
                "id": str(v.id),
                "page_id": str(v.page_id),
                "version_number": v.version_number,
                "version_type": v.version_type.value,
                "created_at": v.created_at.isoformat()
            }
            for v in recent_page_versions
        ],
        "recent_component_versions": [
            {
                "id": str(v.id),
                "component_id": str(v.component_id),
                "version_number": v.version_number,
                "version_type": v.version_type.value,
                "created_at": v.created_at.isoformat()
            }
            for v in recent_component_versions
        ]
    }
