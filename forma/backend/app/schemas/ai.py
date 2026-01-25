"""AI Operation Schemas"""
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID


class ProjectContext(BaseModel):
    project_id: UUID
    design_system: dict = {}
    existing_components: List[dict] = []


class GenerateRequest(BaseModel):
    intent: str
    context: ProjectContext


class EditRequest(BaseModel):
    component_id: UUID
    edit_intent: str
    context: ProjectContext


class ExplainRequest(BaseModel):
    code: str


class ComponentResult(BaseModel):
    name: str
    code: str
    props_schema: dict = {}
    explanation: str = ""


class GenerateResponse(BaseModel):
    success: bool
    result: Optional[ComponentResult] = None
    error: Optional[str] = None
    tokens_used: int = 0


class ExplainResponse(BaseModel):
    explanation: str
    tokens_used: int = 0


class UsageStats(BaseModel):
    operations_used: int
    operations_limit: int
    tokens_used: int
    cost_usd: float
    plan: str
