"""Page Schemas"""
from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class PageCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    page_type: str = "page"
    layout: str = "default"
    is_homepage: bool = False
    is_dynamic: bool = False
    dynamic_param: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    show_in_nav: bool = True
    nav_label: Optional[str] = None
    nav_icon: Optional[str] = None
    canvas_components: List[Any] = []


class PageUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    page_type: Optional[str] = None
    layout: Optional[str] = None
    parent_layout_id: Optional[UUID] = None
    is_homepage: Optional[bool] = None
    is_dynamic: Optional[bool] = None
    dynamic_param: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None
    show_in_nav: Optional[bool] = None
    nav_label: Optional[str] = None
    nav_icon: Optional[str] = None
    canvas_components: Optional[List[Any]] = None
    position: Optional[int] = None


class PageResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    slug: str
    description: Optional[str]
    page_type: str
    canvas_components: List[Any]
    layout: str
    parent_layout_id: Optional[UUID]
    is_homepage: bool
    is_dynamic: bool
    dynamic_param: Optional[str]
    meta_title: Optional[str]
    meta_description: Optional[str]
    og_image: Optional[str]
    position: int
    show_in_nav: bool
    nav_label: Optional[str]
    nav_icon: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageListResponse(BaseModel):
    pages: List[PageResponse]
    total: int


class PageReorder(BaseModel):
    id: UUID
    position: int


class PageReorderRequest(BaseModel):
    pages: List[PageReorder]
