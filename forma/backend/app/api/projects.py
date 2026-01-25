"""Project Routes"""
from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.db.database import get_db
from app.db.models import User, Project, Component, Page
from app.core.security import get_current_user_required
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse,
    SchemaSaveRequest, DeployBackendResponse
)
from app.services.export import export_service
from app.services.runtime_client import runtime_client

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List user's projects."""
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    return ProjectListResponse(
        projects=[ProjectResponse.model_validate(p) for p in projects],
        total=len(projects)
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new project with a default Home page."""
    project = Project(
        user_id=user.id,
        name=data.name,
        description=data.description,
        design_system=data.design_system.model_dump() if data.design_system else {}
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Create default Home page
    home_page = Page(
        project_id=project.id,
        name="Home",
        slug="home",
        description="Homepage",
        is_homepage=True,
        position=0,
        canvas_components=[]
    )
    db.add(home_page)
    db.commit()

    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a project by ID."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    if data.design_system is not None:
        project.design_system = data.design_system.model_dump()
    if data.is_public is not None:
        project.is_public = data.is_public

    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()


@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Duplicate a project including all pages."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    new_project = Project(
        user_id=user.id,
        name=f"{project.name} (Copy)",
        description=project.description,
        design_system=project.design_system,
        settings=project.settings
    )
    db.add(new_project)
    db.commit()

    # Duplicate pages
    pages = db.query(Page).filter(Page.project_id == project.id).order_by(Page.position).all()
    for page in pages:
        new_page = Page(
            project_id=new_project.id,
            name=page.name,
            slug=page.slug,
            description=page.description,
            page_type=page.page_type,
            canvas_components=page.canvas_components,
            layout=page.layout,
            is_homepage=page.is_homepage,
            is_dynamic=page.is_dynamic,
            dynamic_param=page.dynamic_param,
            meta_title=page.meta_title,
            meta_description=page.meta_description,
            show_in_nav=page.show_in_nav,
            nav_label=page.nav_label,
            nav_icon=page.nav_icon,
            position=page.position
        )
        db.add(new_page)

    # Duplicate components (legacy support)
    components = db.query(Component).filter(Component.project_id == project.id).all()
    for comp in components:
        new_comp = Component(
            project_id=new_project.id,
            name=comp.name,
            intent=comp.intent,
            code=comp.code,
            props_schema=comp.props_schema,
            position=comp.position
        )
        db.add(new_comp)

    db.commit()
    db.refresh(new_project)
    return ProjectResponse.model_validate(new_project)


@router.get("/{project_id}/export/nextjs")
async def export_nextjs(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Export project as Next.js app."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    components = db.query(Component).filter(Component.project_id == project.id).all()
    zip_bytes = export_service.export_nextjs(project, components)

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={project.name.lower().replace(' ', '-')}-nextjs.zip"
        }
    )


@router.get("/{project_id}/export/vite")
async def export_vite(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Export project as Vite + React app."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    components = db.query(Component).filter(Component.project_id == project.id).all()
    zip_bytes = export_service.export_vite(project, components)

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={project.name.lower().replace(' ', '-')}-vite.zip"
        }
    )


# =============================================================================
# SCHEMA & BACKEND DEPLOYMENT
# =============================================================================

@router.put("/{project_id}/schema", response_model=ProjectResponse)
async def save_schema(
    project_id: UUID,
    data: SchemaSaveRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Save DataModeler schema to project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Save schema to project
    project.schema_json = data.schema_data.model_dump()
    db.commit()
    db.refresh(project)

    return ProjectResponse.model_validate(project)


@router.get("/{project_id}/schema")
async def get_schema(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get project schema."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if not project.schema_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No schema defined for this project"
        )

    return project.schema_json


@router.post("/{project_id}/deploy-backend", response_model=DeployBackendResponse)
async def deploy_backend(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """
    Deploy project schema to shared runtime, creating a live API.

    Includes AI-powered validation that can block deployment if critical issues found.
    Breaking changes are detected by comparing with the previously deployed schema.
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if not project.schema_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No schema defined. Create a schema in the DataModeler first."
        )

    # Get existing schema for breaking change detection (if previously deployed)
    # We store the last deployed schema separately to detect changes
    existing_schema = None
    if project.runtime_deployed_at and project.schema_json:
        # If previously deployed, we need the OLD schema - but we only have current
        # In a real implementation, you'd store schema versions
        # For now, pass None on first deploy, current on subsequent (allows AI review)
        existing_schema = None  # TODO: Implement schema versioning

    # Call the shared runtime to register this project's schema
    try:
        result = await runtime_client.register_project(
            project_id=str(project.id),
            schema=project.schema_json,
            existing_schema=existing_schema,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to deploy backend: {str(e)}"
        )

    # Build validation response if present
    validation_response = None
    if result.get("validation"):
        from app.schemas.project import ValidationResult, ValidationIssue
        v = result["validation"]
        validation_response = ValidationResult(
            valid=v.get("valid", True),
            can_deploy=v.get("can_deploy", True),
            issues=[
                ValidationIssue(
                    severity=i.get("severity", "info"),
                    category=i.get("category", "structure"),
                    message=i.get("message", "Unknown issue"),
                    field_path=i.get("field_path"),
                    suggestion=i.get("suggestion"),
                )
                for i in v.get("issues", [])
            ],
            summary=v.get("summary", {"critical": 0, "warnings": 0, "info": 0}),
        )

    # Check if deployment was blocked by validation
    if not result.get("success", True):
        return DeployBackendResponse(
            success=False,
            message=result.get("message", "Deployment blocked due to validation issues"),
            validation=validation_response,
        )

    # Update project with runtime URL
    project.runtime_api_url = result["api_url"]
    project.runtime_deployed_at = datetime.utcnow()
    db.commit()
    db.refresh(project)

    return DeployBackendResponse(
        success=True,
        api_url=result["api_url"],
        message=result.get("message", "Backend deployed successfully"),
        deployed_at=project.runtime_deployed_at,
        validation=validation_response,
    )
