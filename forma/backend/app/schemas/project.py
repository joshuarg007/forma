"""Project Schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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
    schema_json: Optional[Dict[str, Any]] = None
    runtime_deployed_at: Optional[datetime] = None
    runtime_api_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int


# =============================================================================
# SCHEMA & BACKEND DEPLOYMENT
# =============================================================================

class FieldDefinition(BaseModel):
    """Individual field in a collection."""
    type: str  # text, email, integer, float, boolean, datetime, date, enum, json, richtext, file, relation
    required: Optional[bool] = False
    unique: Optional[bool] = False
    default: Optional[Any] = None
    # Relation fields
    target: Optional[str] = None  # Target collection name
    relation: Optional[str] = None  # many-to-one, one-to-many, many-to-many, one-to-one
    # Enum fields
    options: Optional[List[str]] = None
    # Validation
    minLength: Optional[int] = None
    maxLength: Optional[int] = None
    min: Optional[float] = None
    max: Optional[float] = None
    pattern: Optional[str] = None
    # File fields
    accept: Optional[List[str]] = None
    maxSize: Optional[int] = None
    # Display
    displayName: Optional[str] = None
    description: Optional[str] = None
    searchable: Optional[bool] = False
    admin: Optional[bool] = False  # Hide from public API


class CollectionPermissions(BaseModel):
    """Permission rules for a collection."""
    create: Optional[List[str]] = None  # Roles that can create
    read: Optional[List[str]] = None  # Roles that can read
    update: Optional[List[str]] = None  # Roles that can update
    delete: Optional[List[str]] = None  # Roles that can delete


class CollectionApiConfig(BaseModel):
    """API configuration for a collection."""
    defaultLimit: Optional[int] = 20
    maxLimit: Optional[int] = 100
    searchFields: Optional[List[str]] = None


class CollectionDefinition(BaseModel):
    """Collection (table) definition in schema."""
    displayName: Optional[str] = None
    auth: Optional[bool] = False  # Is this the user/auth collection?
    timestamps: Optional[bool] = True
    softDelete: Optional[bool] = False
    fields: Dict[str, FieldDefinition]
    permissions: Optional[CollectionPermissions] = None
    api: Optional[CollectionApiConfig] = None


class AuthSettings(BaseModel):
    """Authentication settings."""
    providers: List[str] = ["email"]
    sessionDuration: int = 604800  # 7 days in seconds
    allowRegistration: bool = True
    defaultRole: str = "user"


class SchemaSettings(BaseModel):
    """Global schema settings."""
    auth: Optional[AuthSettings] = None


class SchemaDefinition(BaseModel):
    """Complete schema definition from DataModeler."""
    version: str = "1.0"
    name: str
    collections: Dict[str, CollectionDefinition]
    settings: Optional[SchemaSettings] = None


class SchemaSaveRequest(BaseModel):
    """Request to save schema to a project."""
    schema_data: SchemaDefinition = Field(..., alias="schema")

    class Config:
        populate_by_name = True


class ValidationIssue(BaseModel):
    """A validation issue found in the schema."""
    severity: str  # critical, warning, info
    category: str  # security, breaking_change, best_practice, performance, structure
    message: str
    field_path: Optional[str] = None
    suggestion: Optional[str] = None


class ValidationResult(BaseModel):
    """Result from schema validation."""
    valid: bool
    can_deploy: bool
    issues: List[ValidationIssue]
    summary: Dict[str, int]  # critical, warnings, info counts


class DeployBackendResponse(BaseModel):
    """Response from deploying backend."""
    success: bool
    api_url: Optional[str] = None
    message: str
    deployed_at: Optional[datetime] = None
    validation: Optional[ValidationResult] = None
