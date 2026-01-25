"""Component Schemas"""
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ComponentCreate(BaseModel):
    name: str
    intent: Optional[str] = None
    code: Optional[str] = None
    parent_id: Optional[UUID] = None


class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    intent: Optional[str] = None
    code: Optional[str] = None
    props_schema: Optional[dict] = None
    position: Optional[int] = None


class ComponentResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    intent: Optional[str]
    code: Optional[str]
    props_schema: dict
    parent_id: Optional[UUID]
    position: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IntentionResponse(BaseModel):
    id: UUID
    component_id: UUID
    intent_text: str
    version: int
    created_at: datetime

    class Config:
        from_attributes = True
