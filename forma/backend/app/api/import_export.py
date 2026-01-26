"""Project Import/Export API."""
import io
import json
import os
import zipfile
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, Component, User,
    ProjectExport, ProjectImport,
    ExportStatus, ExportFormat, ImportStatus
)
from app.core.security import get_current_user_required as get_current_user
from app.core.config import settings


router = APIRouter(prefix="/api/projects", tags=["import-export"])


# =============================================================================
# SCHEMAS
# =============================================================================

class ExportRequest(BaseModel):
    format: ExportFormat = ExportFormat.ZIP
    include_assets: bool = True
    include_history: bool = False


class ExportResponse(BaseModel):
    id: UUID
    project_id: UUID
    format: str
    status: str
    progress: int
    file_size: Optional[int]
    download_url: Optional[str]
    expires_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ImportRequest(BaseModel):
    name: str
    overwrite_existing: bool = False


class ImportResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    source_type: str
    status: str
    progress: int
    items_imported: dict
    warnings: list
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProjectManifest(BaseModel):
    """Manifest file structure for exported projects."""
    version: str = "1.0"
    exported_at: str
    project: dict
    pages: List[dict]
    components: List[dict]
    design_system: Optional[dict] = None
    settings: Optional[dict] = None


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


def serialize_project(project: Project, db: Session) -> dict:
    """Serialize project for export."""
    return {
        "name": project.name,
        "description": project.description,
        "design_system": project.design_system,
        "settings": project.settings,
        "created_at": project.created_at.isoformat() if project.created_at else None,
    }


def serialize_page(page: Page) -> dict:
    """Serialize page for export."""
    return {
        "id": str(page.id),
        "name": page.name,
        "slug": page.slug,
        "description": page.description,
        "page_type": page.page_type.value if page.page_type else "page",
        "canvas_components": page.canvas_components,
        "layout": page.layout,
        "is_homepage": page.is_homepage,
        "is_dynamic": page.is_dynamic,
        "dynamic_param": page.dynamic_param,
        "meta_title": page.meta_title,
        "meta_description": page.meta_description,
        "og_image": page.og_image,
        "position": page.position,
        "show_in_nav": page.show_in_nav,
        "nav_label": page.nav_label,
    }


def serialize_component(component: Component) -> dict:
    """Serialize component for export."""
    return {
        "id": str(component.id),
        "name": component.name,
        "intent": component.intent,
        "code": component.code,
        "props_schema": component.props_schema,
        "tags": component.tags,
        "preview_url": component.preview_url,
        "position": component.position,
    }


async def process_export(export_id: UUID, db: Session):
    """Process export in background."""
    export_record = db.query(ProjectExport).filter(ProjectExport.id == export_id).first()
    if not export_record:
        return

    export_record.status = ExportStatus.PROCESSING
    db.commit()

    try:
        project = db.query(Project).filter(Project.id == export_record.project_id).first()
        if not project:
            raise Exception("Project not found")

        # Create export directory
        export_dir = os.path.join(settings.upload_dir if hasattr(settings, 'upload_dir') else "/tmp", "exports")
        os.makedirs(export_dir, exist_ok=True)

        export_filename = f"export_{project.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"
        export_path = os.path.join(export_dir, export_filename)

        # Get all data
        pages = db.query(Page).filter(Page.project_id == project.id).all()
        components = db.query(Component).filter(Component.project_id == project.id).all()

        export_record.progress = 20
        db.commit()

        # Build manifest
        manifest = {
            "version": "1.0",
            "exported_at": datetime.utcnow().isoformat(),
            "project": serialize_project(project, db),
            "pages": [serialize_page(p) for p in pages],
            "components": [serialize_component(c) for c in components],
        }

        export_record.progress = 50
        db.commit()

        # Create ZIP file
        with zipfile.ZipFile(export_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add manifest
            zf.writestr("manifest.json", json.dumps(manifest, indent=2))

            # Add pages as individual files
            for page in pages:
                page_data = serialize_page(page)
                zf.writestr(f"pages/{page.slug}.json", json.dumps(page_data, indent=2))

            # Add components
            for component in components:
                comp_data = serialize_component(component)
                zf.writestr(f"components/{component.name}.json", json.dumps(comp_data, indent=2))

                # Also save code separately for easier viewing
                if component.code:
                    zf.writestr(f"components/{component.name}.tsx", component.code)

        export_record.progress = 90
        db.commit()

        # Get file size
        file_size = os.path.getsize(export_path)

        # Update record
        export_record.status = ExportStatus.COMPLETED
        export_record.progress = 100
        export_record.file_path = export_path
        export_record.file_size = file_size
        export_record.download_url = f"/api/projects/{project.id}/exports/{export_record.id}/download"
        export_record.expires_at = datetime.utcnow() + timedelta(hours=24)
        export_record.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        export_record.status = ExportStatus.FAILED
        export_record.error_message = str(e)
        db.commit()


async def process_import(import_id: UUID, db: Session):
    """Process import in background."""
    import_record = db.query(ProjectImport).filter(ProjectImport.id == import_id).first()
    if not import_record:
        return

    import_record.status = ImportStatus.VALIDATING
    db.commit()

    try:
        # Read and validate ZIP file
        if not os.path.exists(import_record.source_file):
            raise Exception("Import file not found")

        with zipfile.ZipFile(import_record.source_file, 'r') as zf:
            # Read manifest
            if "manifest.json" not in zf.namelist():
                raise Exception("Invalid export file: manifest.json not found")

            manifest_data = json.loads(zf.read("manifest.json"))

        import_record.status = ImportStatus.IMPORTING
        import_record.progress = 20
        db.commit()

        # Create new project
        project = Project(
            user_id=import_record.created_by_id,
            name=import_record.import_name or manifest_data["project"]["name"],
            description=manifest_data["project"].get("description"),
            design_system=manifest_data["project"].get("design_system", {}),
            settings=manifest_data["project"].get("settings", {}),
        )
        db.add(project)
        db.flush()

        import_record.project_id = project.id
        import_record.progress = 40
        db.commit()

        # Import pages
        pages_imported = 0
        id_mapping = {}  # Map old IDs to new IDs

        for page_data in manifest_data.get("pages", []):
            old_id = page_data.pop("id", None)
            page = Page(
                project_id=project.id,
                **{k: v for k, v in page_data.items() if k not in ["page_type"]}
            )
            # Handle page_type enum
            if "page_type" in page_data:
                from app.db.models import PageType
                page.page_type = PageType(page_data["page_type"])

            db.add(page)
            db.flush()

            if old_id:
                id_mapping[old_id] = str(page.id)
            pages_imported += 1

        import_record.progress = 70
        db.commit()

        # Import components
        components_imported = 0
        for comp_data in manifest_data.get("components", []):
            old_id = comp_data.pop("id", None)
            component = Component(
                project_id=project.id,
                name=comp_data.get("name"),
                intent=comp_data.get("intent"),
                code=comp_data.get("code"),
                props_schema=comp_data.get("props_schema"),
                tags=comp_data.get("tags", []),
                position=comp_data.get("position", 0),
            )
            db.add(component)
            db.flush()

            if old_id:
                id_mapping[old_id] = str(component.id)
            components_imported += 1

        import_record.progress = 90
        db.commit()

        # Complete
        import_record.status = ImportStatus.COMPLETED
        import_record.progress = 100
        import_record.items_imported = {
            "pages": pages_imported,
            "components": components_imported,
        }
        import_record.completed_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        import_record.status = ImportStatus.FAILED
        import_record.error_message = str(e)
        db.commit()


# =============================================================================
# EXPORT ENDPOINTS
# =============================================================================

@router.post("/{project_id}/exports", response_model=ExportResponse)
async def create_export(
    project_id: UUID,
    request: ExportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Start a project export."""
    project = get_project_access(project_id, user, db)

    export_record = ProjectExport(
        project_id=project.id,
        format=request.format,
        include_assets=request.include_assets,
        include_history=request.include_history,
        created_by_id=user.id,
    )

    db.add(export_record)
    db.commit()
    db.refresh(export_record)

    # Process in background
    background_tasks.add_task(process_export, export_record.id, db)

    return ExportResponse.model_validate(export_record)


@router.get("/{project_id}/exports", response_model=List[ExportResponse])
async def list_exports(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List project exports."""
    project = get_project_access(project_id, user, db)

    exports = db.query(ProjectExport).filter(
        ProjectExport.project_id == project.id
    ).order_by(ProjectExport.created_at.desc()).limit(20).all()

    return [ExportResponse.model_validate(e) for e in exports]


@router.get("/{project_id}/exports/{export_id}", response_model=ExportResponse)
async def get_export(
    project_id: UUID,
    export_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get export status."""
    project = get_project_access(project_id, user, db)

    export_record = db.query(ProjectExport).filter(
        ProjectExport.id == export_id,
        ProjectExport.project_id == project.id
    ).first()

    if not export_record:
        raise HTTPException(status_code=404, detail="Export not found")

    return ExportResponse.model_validate(export_record)


@router.get("/{project_id}/exports/{export_id}/download")
async def download_export(
    project_id: UUID,
    export_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Download exported file."""
    project = get_project_access(project_id, user, db)

    export_record = db.query(ProjectExport).filter(
        ProjectExport.id == export_id,
        ProjectExport.project_id == project.id
    ).first()

    if not export_record:
        raise HTTPException(status_code=404, detail="Export not found")

    if export_record.status != ExportStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Export not completed")

    if export_record.expires_at and export_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Download link expired")

    if not os.path.exists(export_record.file_path):
        raise HTTPException(status_code=404, detail="Export file not found")

    def iterfile():
        with open(export_record.file_path, "rb") as f:
            yield from f

    filename = f"{project.name.replace(' ', '_')}_export.zip"

    return StreamingResponse(
        iterfile(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{project_id}/export-json")
async def export_json(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Quick JSON export (no file, direct response)."""
    project = get_project_access(project_id, user, db)

    pages = db.query(Page).filter(Page.project_id == project.id).all()
    components = db.query(Component).filter(Component.project_id == project.id).all()

    export_data = {
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "project": serialize_project(project, db),
        "pages": [serialize_page(p) for p in pages],
        "components": [serialize_component(c) for c in components],
    }

    return export_data


# =============================================================================
# IMPORT ENDPOINTS
# =============================================================================

@router.post("/import", response_model=ImportResponse)
async def import_project(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Import a project from ZIP file."""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")

    # Save uploaded file
    import_dir = os.path.join(settings.upload_dir if hasattr(settings, 'upload_dir') else "/tmp", "imports")
    os.makedirs(import_dir, exist_ok=True)

    import_filename = f"import_{uuid4()}_{file.filename}"
    import_path = os.path.join(import_dir, import_filename)

    with open(import_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create import record
    import_record = ProjectImport(
        source_type="zip",
        source_file=import_path,
        import_name=name,
        created_by_id=user.id,
    )

    db.add(import_record)
    db.commit()
    db.refresh(import_record)

    # Process in background
    if background_tasks:
        background_tasks.add_task(process_import, import_record.id, db)

    return ImportResponse.model_validate(import_record)


@router.post("/import-json", response_model=ImportResponse)
async def import_json(
    data: dict,
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Import a project from JSON data directly."""
    # Validate structure
    if "project" not in data:
        raise HTTPException(status_code=400, detail="Invalid format: 'project' key required")

    # Create import record
    import_record = ProjectImport(
        source_type="json",
        import_name=name,
        created_by_id=user.id,
        status=ImportStatus.IMPORTING,
    )
    db.add(import_record)
    db.flush()

    try:
        # Create project
        project = Project(
            user_id=user.id,
            name=name or data["project"].get("name", "Imported Project"),
            description=data["project"].get("description"),
            design_system=data["project"].get("design_system", {}),
            settings=data["project"].get("settings", {}),
        )
        db.add(project)
        db.flush()

        import_record.project_id = project.id

        # Import pages
        pages_imported = 0
        for page_data in data.get("pages", []):
            page = Page(
                project_id=project.id,
                name=page_data.get("name", "Untitled"),
                slug=page_data.get("slug", f"page-{pages_imported}"),
                description=page_data.get("description"),
                canvas_components=page_data.get("canvas_components", []),
                layout=page_data.get("layout", "default"),
                is_homepage=page_data.get("is_homepage", False),
                meta_title=page_data.get("meta_title"),
                meta_description=page_data.get("meta_description"),
                position=page_data.get("position", pages_imported),
            )
            db.add(page)
            pages_imported += 1

        # Import components
        components_imported = 0
        for comp_data in data.get("components", []):
            component = Component(
                project_id=project.id,
                name=comp_data.get("name", f"Component{components_imported}"),
                intent=comp_data.get("intent"),
                code=comp_data.get("code"),
                props_schema=comp_data.get("props_schema"),
                tags=comp_data.get("tags", []),
                position=comp_data.get("position", components_imported),
            )
            db.add(component)
            components_imported += 1

        import_record.status = ImportStatus.COMPLETED
        import_record.progress = 100
        import_record.items_imported = {
            "pages": pages_imported,
            "components": components_imported,
        }
        import_record.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(import_record)

    except Exception as e:
        import_record.status = ImportStatus.FAILED
        import_record.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

    return ImportResponse.model_validate(import_record)


@router.get("/imports", response_model=List[ImportResponse])
async def list_imports(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List user's imports."""
    imports = db.query(ProjectImport).filter(
        ProjectImport.created_by_id == user.id
    ).order_by(ProjectImport.created_at.desc()).limit(20).all()

    return [ImportResponse.model_validate(i) for i in imports]


@router.get("/imports/{import_id}", response_model=ImportResponse)
async def get_import(
    import_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get import status."""
    import_record = db.query(ProjectImport).filter(
        ProjectImport.id == import_id,
        ProjectImport.created_by_id == user.id
    ).first()

    if not import_record:
        raise HTTPException(status_code=404, detail="Import not found")

    return ImportResponse.model_validate(import_record)


# =============================================================================
# TEMPLATE EXPORT (for sharing)
# =============================================================================

@router.get("/{project_id}/export-template")
async def export_as_template(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Export project as a reusable template."""
    project = get_project_access(project_id, user, db)

    pages = db.query(Page).filter(Page.project_id == project.id).all()
    components = db.query(Component).filter(Component.project_id == project.id).all()

    # Strip IDs and user-specific data
    template = {
        "template_version": "1.0",
        "name": project.name,
        "description": project.description,
        "design_system": project.design_system,
        "pages": [
            {
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "canvas_components": p.canvas_components,
                "layout": p.layout,
                "is_homepage": p.is_homepage,
                "meta_title": p.meta_title,
                "meta_description": p.meta_description,
            }
            for p in pages
        ],
        "components": [
            {
                "name": c.name,
                "intent": c.intent,
                "code": c.code,
                "props_schema": c.props_schema,
                "tags": c.tags,
            }
            for c in components
        ],
    }

    return template
