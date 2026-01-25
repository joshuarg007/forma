"""Hosting Schemas for Forma Hosting"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import re


# =============================================================================
# DEPLOYMENT SCHEMAS
# =============================================================================

class DeploymentCreate(BaseModel):
    """Request body for triggering a new deployment."""
    commit_message: Optional[str] = Field(None, max_length=500)
    is_preview: bool = False


class DeploymentResponse(BaseModel):
    """Response for a deployment."""
    id: UUID
    project_id: UUID
    user_id: UUID
    version: int
    status: str
    subdomain: str
    production_url: Optional[str]
    preview_url: Optional[str]
    build_started_at: Optional[datetime]
    build_completed_at: Optional[datetime]
    deploy_started_at: Optional[datetime]
    deploy_completed_at: Optional[datetime]
    commit_message: Optional[str]
    is_production: bool
    triggered_by: str
    error_message: Optional[str]
    error_code: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeploymentListResponse(BaseModel):
    """Response for listing deployments."""
    deployments: List[DeploymentResponse]
    total: int


# =============================================================================
# HOSTING CONFIG SCHEMAS
# =============================================================================

class HostingConfigCreate(BaseModel):
    """Request body for setting up hosting."""
    subdomain: str = Field(..., min_length=3, max_length=63)

    @validator('subdomain')
    def validate_subdomain(cls, v):
        # Subdomain must be lowercase alphanumeric with hyphens (not at start/end)
        pattern = r'^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'
        if not re.match(pattern, v.lower()):
            raise ValueError(
                'Subdomain must be 3-63 characters, lowercase alphanumeric with hyphens, '
                'cannot start or end with a hyphen'
            )
        return v.lower()


class HostingConfigUpdate(BaseModel):
    """Request body for updating hosting config."""
    auto_deploy_enabled: Optional[bool] = None
    build_command: Optional[str] = None
    output_directory: Optional[str] = None
    node_version: Optional[str] = None
    analytics_enabled: Optional[bool] = None


class HostingConfigResponse(BaseModel):
    """Response for hosting configuration."""
    id: UUID
    project_id: UUID
    subdomain: str
    production_url: str
    current_deployment_id: Optional[UUID]
    auto_deploy_enabled: bool
    build_command: str
    output_directory: str
    node_version: str
    analytics_enabled: bool
    created_at: datetime
    updated_at: datetime
    # Nested
    current_deployment: Optional[DeploymentResponse] = None
    custom_domains: List['CustomDomainResponse'] = []

    class Config:
        from_attributes = True


# =============================================================================
# CUSTOM DOMAIN SCHEMAS
# =============================================================================

class CustomDomainCreate(BaseModel):
    """Request body for adding a custom domain."""
    domain: str = Field(..., min_length=4, max_length=255)

    @validator('domain')
    def validate_domain(cls, v):
        # Basic domain validation
        pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        if not re.match(pattern, v.lower()):
            raise ValueError('Invalid domain format')
        return v.lower()


class CustomDomainResponse(BaseModel):
    """Response for a custom domain."""
    id: UUID
    project_id: UUID
    domain: str
    status: str
    dns_record_type: str
    dns_record_name: Optional[str]
    dns_record_value: Optional[str]
    dns_verified_at: Optional[datetime]
    ssl_status: str
    ssl_expires_at: Optional[datetime]
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomDomainListResponse(BaseModel):
    """Response for listing custom domains."""
    domains: List[CustomDomainResponse]
    total: int


# =============================================================================
# BUILD LOG SCHEMAS
# =============================================================================

class BuildLogEntry(BaseModel):
    """A single build log entry."""
    id: UUID
    level: str
    message: str
    step: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class BuildLogResponse(BaseModel):
    """Response for build logs."""
    deployment_id: UUID
    logs: List[BuildLogEntry]
    total: int


# =============================================================================
# SUBDOMAIN SCHEMAS
# =============================================================================

class SubdomainCheck(BaseModel):
    """Request to check subdomain availability."""
    subdomain: str

    @validator('subdomain')
    def validate_subdomain(cls, v):
        pattern = r'^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'
        if not re.match(pattern, v.lower()):
            raise ValueError('Invalid subdomain format')
        return v.lower()


class SubdomainCheckResponse(BaseModel):
    """Response for subdomain availability check."""
    subdomain: str
    available: bool
    suggested: Optional[str] = None  # Suggestion if not available


# =============================================================================
# ENVIRONMENT VARIABLE SCHEMAS
# =============================================================================

class EnvVarCreate(BaseModel):
    """Request body for creating an environment variable."""
    key: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1)
    is_secret: bool = True

    @validator('key')
    def validate_key(cls, v):
        # Env var keys must be uppercase alphanumeric with underscores
        pattern = r'^[A-Z][A-Z0-9_]*$'
        if not re.match(pattern, v.upper()):
            raise ValueError('Key must be uppercase alphanumeric with underscores, starting with a letter')
        return v.upper()


class EnvVarUpdate(BaseModel):
    """Request body for updating an environment variable."""
    value: str = Field(..., min_length=1)


class EnvVarResponse(BaseModel):
    """Response for an environment variable."""
    id: UUID
    project_id: UUID
    key: str
    is_secret: bool
    # Value is only shown if not secret, otherwise masked
    value: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnvVarListResponse(BaseModel):
    """Response for listing environment variables."""
    variables: List[EnvVarResponse]
    total: int


# Update forward references
HostingConfigResponse.model_rebuild()
