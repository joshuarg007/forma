"""Hosting API Routes - Deploy projects to forma.app"""
from typing import List
from uuid import UUID
import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import (
    User, Project, Page,
    Deployment, DeploymentStatus,
    CustomDomain, CustomDomainStatus,
    BuildLog, BuildLogLevel,
    ProjectHostingConfig
)
from app.core.security import get_current_user_required
from app.core.config import settings
from app.schemas.hosting import (
    DeploymentCreate, DeploymentResponse, DeploymentListResponse,
    HostingConfigCreate, HostingConfigUpdate, HostingConfigResponse,
    CustomDomainCreate, CustomDomainResponse, CustomDomainListResponse,
    BuildLogEntry, BuildLogResponse,
    SubdomainCheck, SubdomainCheckResponse,
)

router = APIRouter(prefix="/api/projects", tags=["hosting"])


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_project_or_404(project_id: UUID, user: User, db: Session) -> Project:
    """Get a project or raise 404."""
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


def generate_subdomain_suggestion(base: str, db: Session) -> str:
    """Generate a unique subdomain suggestion."""
    # Try base, then base-1, base-2, etc.
    for i in range(1, 100):
        candidate = f"{base}-{i}" if i > 1 else base
        exists = db.query(ProjectHostingConfig).filter(
            ProjectHostingConfig.subdomain == candidate
        ).first()
        if not exists:
            return candidate
    # Fallback with random suffix
    return f"{base}-{secrets.token_hex(3)}"


# =============================================================================
# HOSTING CONFIG ENDPOINTS
# =============================================================================

@router.get("/{project_id}/hosting", response_model=HostingConfigResponse)
async def get_hosting_config(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get hosting configuration for a project."""
    project = get_project_or_404(project_id, user, db)

    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hosting not configured for this project"
        )

    config = project.hosting_config

    # Build response with nested data
    response = HostingConfigResponse(
        id=config.id,
        project_id=config.project_id,
        subdomain=config.subdomain,
        production_url=f"https://{config.subdomain}.{settings.forma_domain}",
        current_deployment_id=config.current_deployment_id,
        auto_deploy_enabled=config.auto_deploy_enabled,
        build_command=config.build_command,
        output_directory=config.output_directory,
        node_version=config.node_version,
        analytics_enabled=config.analytics_enabled,
        created_at=config.created_at,
        updated_at=config.updated_at,
        current_deployment=DeploymentResponse.model_validate(config.current_deployment) if config.current_deployment else None,
        custom_domains=[CustomDomainResponse.model_validate(d) for d in project.custom_domains]
    )

    return response


@router.post("/{project_id}/hosting/setup", response_model=HostingConfigResponse, status_code=status.HTTP_201_CREATED)
async def setup_hosting(
    project_id: UUID,
    data: HostingConfigCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Set up hosting for a project (first time)."""
    project = get_project_or_404(project_id, user, db)

    # Check if already configured
    if project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hosting already configured for this project"
        )

    # Check subdomain availability
    existing = db.query(ProjectHostingConfig).filter(
        ProjectHostingConfig.subdomain == data.subdomain
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Subdomain already taken"
        )

    # Create hosting config
    config = ProjectHostingConfig(
        project_id=project.id,
        subdomain=data.subdomain
    )
    db.add(config)
    db.commit()
    db.refresh(config)

    return HostingConfigResponse(
        id=config.id,
        project_id=config.project_id,
        subdomain=config.subdomain,
        production_url=f"https://{config.subdomain}.{settings.forma_domain}",
        current_deployment_id=None,
        auto_deploy_enabled=config.auto_deploy_enabled,
        build_command=config.build_command,
        output_directory=config.output_directory,
        node_version=config.node_version,
        analytics_enabled=config.analytics_enabled,
        created_at=config.created_at,
        updated_at=config.updated_at,
        current_deployment=None,
        custom_domains=[]
    )


@router.put("/{project_id}/hosting", response_model=HostingConfigResponse)
async def update_hosting_config(
    project_id: UUID,
    data: HostingConfigUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update hosting configuration."""
    project = get_project_or_404(project_id, user, db)

    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hosting not configured"
        )

    config = project.hosting_config

    # Update fields
    if data.auto_deploy_enabled is not None:
        config.auto_deploy_enabled = data.auto_deploy_enabled
    if data.build_command is not None:
        config.build_command = data.build_command
    if data.output_directory is not None:
        config.output_directory = data.output_directory
    if data.node_version is not None:
        config.node_version = data.node_version
    if data.analytics_enabled is not None:
        config.analytics_enabled = data.analytics_enabled

    db.commit()
    db.refresh(config)

    return HostingConfigResponse(
        id=config.id,
        project_id=config.project_id,
        subdomain=config.subdomain,
        production_url=f"https://{config.subdomain}.{settings.forma_domain}",
        current_deployment_id=config.current_deployment_id,
        auto_deploy_enabled=config.auto_deploy_enabled,
        build_command=config.build_command,
        output_directory=config.output_directory,
        node_version=config.node_version,
        analytics_enabled=config.analytics_enabled,
        created_at=config.created_at,
        updated_at=config.updated_at,
        current_deployment=DeploymentResponse.model_validate(config.current_deployment) if config.current_deployment else None,
        custom_domains=[CustomDomainResponse.model_validate(d) for d in project.custom_domains]
    )


@router.delete("/{project_id}/hosting", status_code=status.HTTP_204_NO_CONTENT)
async def disable_hosting(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Disable hosting for a project (removes config but keeps deployment history)."""
    project = get_project_or_404(project_id, user, db)

    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hosting not configured"
        )

    db.delete(project.hosting_config)
    db.commit()
    return None


# =============================================================================
# DEPLOYMENT ENDPOINTS
# =============================================================================

@router.post("/{project_id}/deploy", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
async def deploy_project(
    project_id: UUID,
    data: DeploymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Trigger a new deployment for a project."""
    project = get_project_or_404(project_id, user, db)

    # Check hosting is configured
    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hosting not configured. Call /hosting/setup first."
        )

    config = project.hosting_config

    # Get next version number
    max_version = db.query(func.max(Deployment.version)).filter(
        Deployment.project_id == project_id
    ).scalar() or 0

    # Create deployment record
    deployment = Deployment(
        project_id=project.id,
        user_id=user.id,
        version=max_version + 1,
        status=DeploymentStatus.PENDING,
        subdomain=config.subdomain,
        production_url=f"https://{config.subdomain}.{settings.forma_domain}",
        commit_message=data.commit_message,
        is_production=not data.is_preview,
        triggered_by="manual",
        # Snapshot current state
        pages_snapshot=[{
            'id': str(p.id),
            'name': p.name,
            'slug': p.slug,
            'canvas_components': p.canvas_components or []
        } for p in project.pages],
        design_system_snapshot=project.design_system
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)

    # Add initial log entry
    log = BuildLog(
        deployment_id=deployment.id,
        level=BuildLogLevel.INFO,
        message="Deployment queued",
        step="init"
    )
    db.add(log)
    db.commit()

    # TODO: Trigger background deployment task
    # from app.worker.tasks import deploy_project_task
    # deploy_project_task.delay(str(project.id), str(user.id), str(deployment.id))

    return DeploymentResponse.model_validate(deployment)


@router.get("/{project_id}/deployments", response_model=DeploymentListResponse)
async def list_deployments(
    project_id: UUID,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List deployment history for a project."""
    project = get_project_or_404(project_id, user, db)

    query = db.query(Deployment).filter(
        Deployment.project_id == project_id
    ).order_by(Deployment.created_at.desc())

    total = query.count()
    deployments = query.offset(offset).limit(limit).all()

    return DeploymentListResponse(
        deployments=[DeploymentResponse.model_validate(d) for d in deployments],
        total=total
    )


@router.get("/{project_id}/deployments/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    project_id: UUID,
    deployment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a specific deployment."""
    project = get_project_or_404(project_id, user, db)

    deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.project_id == project_id
    ).first()

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )

    return DeploymentResponse.model_validate(deployment)


@router.get("/{project_id}/deployments/{deployment_id}/logs", response_model=BuildLogResponse)
async def get_deployment_logs(
    project_id: UUID,
    deployment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get build logs for a deployment."""
    project = get_project_or_404(project_id, user, db)

    deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.project_id == project_id
    ).first()

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )

    logs = db.query(BuildLog).filter(
        BuildLog.deployment_id == deployment_id
    ).order_by(BuildLog.timestamp.asc()).all()

    return BuildLogResponse(
        deployment_id=deployment_id,
        logs=[BuildLogEntry.model_validate(log) for log in logs],
        total=len(logs)
    )


@router.post("/{project_id}/deployments/{deployment_id}/rollback", response_model=DeploymentResponse)
async def rollback_deployment(
    project_id: UUID,
    deployment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Rollback to a previous deployment version."""
    project = get_project_or_404(project_id, user, db)

    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hosting not configured"
        )

    # Get the deployment to rollback to
    target_deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.project_id == project_id,
        Deployment.status == DeploymentStatus.DEPLOYED
    ).first()

    if not target_deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found or not in deployed state"
        )

    config = project.hosting_config

    # Get next version number
    max_version = db.query(func.max(Deployment.version)).filter(
        Deployment.project_id == project_id
    ).scalar() or 0

    # Create new deployment that's a copy of the target
    new_deployment = Deployment(
        project_id=project.id,
        user_id=user.id,
        version=max_version + 1,
        status=DeploymentStatus.PENDING,
        subdomain=config.subdomain,
        production_url=target_deployment.production_url,
        commit_message=f"Rollback to v{target_deployment.version}",
        is_production=True,
        triggered_by="rollback",
        pages_snapshot=target_deployment.pages_snapshot,
        design_system_snapshot=target_deployment.design_system_snapshot
    )
    db.add(new_deployment)
    db.commit()
    db.refresh(new_deployment)

    # TODO: Trigger rollback deployment task

    return DeploymentResponse.model_validate(new_deployment)


# =============================================================================
# CUSTOM DOMAIN ENDPOINTS
# =============================================================================

@router.get("/{project_id}/domains", response_model=CustomDomainListResponse)
async def list_custom_domains(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List custom domains for a project."""
    project = get_project_or_404(project_id, user, db)

    domains = db.query(CustomDomain).filter(
        CustomDomain.project_id == project_id
    ).all()

    return CustomDomainListResponse(
        domains=[CustomDomainResponse.model_validate(d) for d in domains],
        total=len(domains)
    )


@router.post("/{project_id}/domains", response_model=CustomDomainResponse, status_code=status.HTTP_201_CREATED)
async def add_custom_domain(
    project_id: UUID,
    data: CustomDomainCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Add a custom domain to a project."""
    project = get_project_or_404(project_id, user, db)

    if not project.hosting_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hosting not configured"
        )

    # Check if domain already exists
    existing = db.query(CustomDomain).filter(
        CustomDomain.domain == data.domain
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Domain already registered"
        )

    # Generate DNS validation info
    # For CNAME: point domain to subdomain.forma.app
    subdomain = project.hosting_config.subdomain

    domain = CustomDomain(
        project_id=project.id,
        domain=data.domain,
        status=CustomDomainStatus.PENDING_VALIDATION,
        dns_record_type="CNAME",
        dns_record_name="@" if not data.domain.startswith("www.") else "www",
        dns_record_value=f"{subdomain}.{settings.forma_domain}",
        is_primary=len(project.custom_domains) == 0  # First domain is primary
    )
    db.add(domain)
    db.commit()
    db.refresh(domain)

    return CustomDomainResponse.model_validate(domain)


@router.get("/{project_id}/domains/{domain_id}", response_model=CustomDomainResponse)
async def get_custom_domain(
    project_id: UUID,
    domain_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a specific custom domain."""
    project = get_project_or_404(project_id, user, db)

    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.project_id == project_id
    ).first()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )

    return CustomDomainResponse.model_validate(domain)


@router.post("/{project_id}/domains/{domain_id}/verify", response_model=CustomDomainResponse)
async def verify_custom_domain(
    project_id: UUID,
    domain_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Verify DNS records for a custom domain."""
    project = get_project_or_404(project_id, user, db)

    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.project_id == project_id
    ).first()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )

    # TODO: Implement actual DNS verification
    # For now, just update status to validating and trigger background check
    domain.status = CustomDomainStatus.VALIDATING
    db.commit()
    db.refresh(domain)

    # TODO: Trigger background DNS verification task
    # from app.worker.tasks import verify_domain_task
    # verify_domain_task.delay(str(domain.id))

    return CustomDomainResponse.model_validate(domain)


@router.delete("/{project_id}/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_custom_domain(
    project_id: UUID,
    domain_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Remove a custom domain."""
    project = get_project_or_404(project_id, user, db)

    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.project_id == project_id
    ).first()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )

    db.delete(domain)
    db.commit()
    return None


@router.put("/{project_id}/domains/{domain_id}/primary", response_model=CustomDomainResponse)
async def set_primary_domain(
    project_id: UUID,
    domain_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Set a domain as the primary domain for the project."""
    project = get_project_or_404(project_id, user, db)

    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.project_id == project_id
    ).first()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )

    # Unset all other domains as primary
    db.query(CustomDomain).filter(
        CustomDomain.project_id == project_id,
        CustomDomain.id != domain_id
    ).update({'is_primary': False})

    domain.is_primary = True
    db.commit()
    db.refresh(domain)

    return CustomDomainResponse.model_validate(domain)


# =============================================================================
# SUBDOMAIN UTILITIES
# =============================================================================

# This endpoint doesn't require project_id, so we use a different prefix
subdomain_router = APIRouter(prefix="/api/hosting", tags=["hosting"])


@subdomain_router.post("/check-subdomain", response_model=SubdomainCheckResponse)
async def check_subdomain_availability(
    data: SubdomainCheck,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Check if a subdomain is available."""
    # Check reserved subdomains
    reserved = ['www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'blog', 'shop', 'store', 'help', 'support', 'docs']
    if data.subdomain in reserved:
        suggestion = generate_subdomain_suggestion(data.subdomain, db)
        return SubdomainCheckResponse(
            subdomain=data.subdomain,
            available=False,
            suggested=suggestion
        )

    # Check if taken
    existing = db.query(ProjectHostingConfig).filter(
        ProjectHostingConfig.subdomain == data.subdomain
    ).first()

    if existing:
        suggestion = generate_subdomain_suggestion(data.subdomain, db)
        return SubdomainCheckResponse(
            subdomain=data.subdomain,
            available=False,
            suggested=suggestion
        )

    return SubdomainCheckResponse(
        subdomain=data.subdomain,
        available=True
    )
