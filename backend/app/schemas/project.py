"""Project Schemas"""
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class DesignSystem(BaseModel):
    colors: dict = {}
    typography: dict = {}
    spacing: dict = {}
    borders: dict = {}
    shadows: dict = {}


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    design_system: Optional[DesignSystem] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    design_system: Optional[DesignSystem] = None
    is_public: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    design_system: dict
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
