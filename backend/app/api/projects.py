"""Project Routes"""
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
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
)
from app.services.export import export_service

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
