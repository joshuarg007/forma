"""Menu Routes - Reusable navigation menus"""
import re
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, Menu
from app.core.security import get_current_user_required

router = APIRouter(prefix="/api/projects/{project_id}/menus", tags=["menus"])


# --- Pydantic schemas ---

class MenuItemSchema(BaseModel):
    id: str
    label: str
    type: str = "url"  # 'page' or 'url'
    page_id: Optional[str] = None
    page_slug: Optional[str] = None
    url: Optional[str] = None
    open_new_tab: bool = False
    children: List["MenuItemSchema"] = []


class MenuCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    items: List[MenuItemSchema] = []


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[MenuItemSchema]] = None


class MenuResponse(BaseModel):
    id: str
    project_id: str
    name: str
    slug: str
    description: Optional[str] = None
    items: list = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MenuListResponse(BaseModel):
    menus: List[MenuResponse]
    total: int


# --- Helpers ---

def get_project_or_404(project_id: UUID, user: User, db: Session) -> Project:
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


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'-+', '-', text).strip('-')


# --- Endpoints ---

@router.get("", response_model=MenuListResponse)
async def list_menus(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    project = get_project_or_404(project_id, user, db)
    menus = db.query(Menu).filter(Menu.project_id == project.id).order_by(Menu.created_at).all()
    return MenuListResponse(
        menus=[MenuResponse.model_validate(m) for m in menus],
        total=len(menus)
    )


@router.post("", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
async def create_menu(
    project_id: UUID,
    data: MenuCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    project = get_project_or_404(project_id, user, db)

    slug = data.slug or slugify(data.name)

    # Check duplicate slug
    existing = db.query(Menu).filter(
        Menu.project_id == project.id,
        Menu.slug == slug
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Menu with slug '{slug}' already exists"
        )

    menu = Menu(
        project_id=project.id,
        name=data.name,
        slug=slug,
        description=data.description,
        items=[item.model_dump() for item in data.items],
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return MenuResponse.model_validate(menu)


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(
    project_id: UUID,
    menu_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    project = get_project_or_404(project_id, user, db)
    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.project_id == project.id
    ).first()
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return MenuResponse.model_validate(menu)


@router.put("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    project_id: UUID,
    menu_id: UUID,
    data: MenuUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    project = get_project_or_404(project_id, user, db)
    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.project_id == project.id
    ).first()
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )

    if data.name is not None:
        menu.name = data.name
    if data.slug is not None:
        # Check duplicate slug
        existing = db.query(Menu).filter(
            Menu.project_id == project.id,
            Menu.slug == data.slug,
            Menu.id != menu_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu with slug '{data.slug}' already exists"
            )
        menu.slug = data.slug
    if data.description is not None:
        menu.description = data.description
    if data.items is not None:
        menu.items = [item.model_dump() for item in data.items]

    db.commit()
    db.refresh(menu)
    return MenuResponse.model_validate(menu)


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(
    project_id: UUID,
    menu_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    project = get_project_or_404(project_id, user, db)
    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.project_id == project.id
    ).first()
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    db.delete(menu)
    db.commit()
