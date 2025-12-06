"""Page Routes - Multi-page project support"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, Page
from app.core.security import get_current_user_required
from app.schemas.page import (
    PageCreate, PageUpdate, PageResponse, PageListResponse, PageReorderRequest
)

router = APIRouter(prefix="/api/projects/{project_id}/pages", tags=["pages"])


def get_project_or_404(project_id: UUID, user: User, db: Session) -> Project:
    """Helper to get project and verify ownership."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.get("", response_model=PageListResponse)
async def list_pages(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List all pages in a project."""
    project = get_project_or_404(project_id, user, db)
    pages = db.query(Page).filter(Page.project_id == project.id).order_by(Page.position).all()
    return PageListResponse(
        pages=[PageResponse.model_validate(p) for p in pages],
        total=len(pages)
    )


@router.post("", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(
    project_id: UUID,
    data: PageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new page in a project."""
    project = get_project_or_404(project_id, user, db)

    # Check for duplicate slug
    existing = db.query(Page).filter(
        Page.project_id == project.id,
        Page.slug == data.slug
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Page with slug '{data.slug}' already exists"
        )

    # Get max position
    max_pos = db.query(Page).filter(Page.project_id == project.id).count()

    # If this is homepage, unset any existing homepage
    if data.is_homepage:
        db.query(Page).filter(
            Page.project_id == project.id,
            Page.is_homepage == True
        ).update({"is_homepage": False})

    page = Page(
        project_id=project.id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        page_type=data.page_type,
        layout=data.layout,
        is_homepage=data.is_homepage,
        is_dynamic=data.is_dynamic,
        dynamic_param=data.dynamic_param,
        meta_title=data.meta_title,
        meta_description=data.meta_description,
        show_in_nav=data.show_in_nav,
        nav_label=data.nav_label,
        nav_icon=data.nav_icon,
        canvas_components=data.canvas_components,
        position=max_pos
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return PageResponse.model_validate(page)


@router.get("/{page_id}", response_model=PageResponse)
async def get_page(
    project_id: UUID,
    page_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a single page."""
    project = get_project_or_404(project_id, user, db)
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

    return PageResponse.model_validate(page)


@router.put("/{page_id}", response_model=PageResponse)
async def update_page(
    project_id: UUID,
    page_id: UUID,
    data: PageUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a page."""
    project = get_project_or_404(project_id, user, db)
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

    # Check for duplicate slug if changing
    if data.slug is not None and data.slug != page.slug:
        existing = db.query(Page).filter(
            Page.project_id == project.id,
            Page.slug == data.slug,
            Page.id != page_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Page with slug '{data.slug}' already exists"
            )

    # If setting as homepage, unset others
    if data.is_homepage is True and not page.is_homepage:
        db.query(Page).filter(
            Page.project_id == project.id,
            Page.is_homepage == True,
            Page.id != page_id
        ).update({"is_homepage": False})

    # Apply updates
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(page, key, value)

    db.commit()
    db.refresh(page)
    return PageResponse.model_validate(page)


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    project_id: UUID,
    page_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a page."""
    project = get_project_or_404(project_id, user, db)
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

    db.delete(page)
    db.commit()


@router.post("/{page_id}/duplicate", response_model=PageResponse)
async def duplicate_page(
    project_id: UUID,
    page_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Duplicate a page."""
    project = get_project_or_404(project_id, user, db)
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project.id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

    # Generate unique slug
    base_slug = f"{page.slug}-copy"
    slug = base_slug
    counter = 1
    while db.query(Page).filter(Page.project_id == project.id, Page.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Get max position
    max_pos = db.query(Page).filter(Page.project_id == project.id).count()

    new_page = Page(
        project_id=project.id,
        name=f"{page.name} (Copy)",
        slug=slug,
        description=page.description,
        page_type=page.page_type,
        layout=page.layout,
        is_homepage=False,  # Copy is never homepage
        is_dynamic=page.is_dynamic,
        dynamic_param=page.dynamic_param,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        show_in_nav=page.show_in_nav,
        nav_label=page.nav_label,
        nav_icon=page.nav_icon,
        canvas_components=page.canvas_components,  # Copy the canvas state
        position=max_pos
    )
    db.add(new_page)
    db.commit()
    db.refresh(new_page)
    return PageResponse.model_validate(new_page)


@router.post("/reorder", status_code=status.HTTP_200_OK)
async def reorder_pages(
    project_id: UUID,
    data: PageReorderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Reorder pages in a project."""
    project = get_project_or_404(project_id, user, db)

    for item in data.pages:
        db.query(Page).filter(
            Page.id == item.id,
            Page.project_id == project.id
        ).update({"position": item.position})

    db.commit()
    return {"ok": True}


@router.get("/by-slug/{slug}", response_model=PageResponse)
async def get_page_by_slug(
    project_id: UUID,
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a page by its slug."""
    project = get_project_or_404(project_id, user, db)
    page = db.query(Page).filter(
        Page.project_id == project.id,
        Page.slug == slug
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )

    return PageResponse.model_validate(page)
