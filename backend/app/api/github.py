"""GitHub Integration API Routes"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, GitHubSync
from app.schemas.marketplace import (
    GitHubSyncCreate, GitHubSyncUpdate, GitHubSyncResponse, GitHubSyncTrigger
)
from app.core.security import get_current_user
from app.services.github_sync import (
    GitHubSyncService,
    sync_project_to_github,
    sync_github_to_project
)

router = APIRouter(prefix="/api/github", tags=["github"])


@router.get("/repos")
async def list_user_repos(
    current_user: User = Depends(get_current_user)
):
    """List user's GitHub repositories for connection."""
    # TODO: Get token from user's GitHub OAuth connection
    # For now, return placeholder
    return {
        "message": "Connect your GitHub account first",
        "oauth_url": "/api/github/oauth/authorize"
    }


@router.post("/sync", response_model=GitHubSyncResponse)
async def create_sync_config(
    data: GitHubSyncCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set up GitHub sync for a project."""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if sync already exists
    existing = db.query(GitHubSync).filter(
        GitHubSync.project_id == data.project_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Sync already configured for this project")

    sync_config = GitHubSync(
        project_id=data.project_id,
        repo_full_name=data.repo_full_name,
        branch=data.branch,
        path=data.path,
        sync_direction=data.sync_direction
    )

    db.add(sync_config)
    db.commit()
    db.refresh(sync_config)

    return GitHubSyncResponse(
        id=sync_config.id,
        project_id=sync_config.project_id,
        repo_full_name=sync_config.repo_full_name,
        branch=sync_config.branch,
        path=sync_config.path,
        auto_sync=sync_config.auto_sync,
        sync_direction=sync_config.sync_direction,
        last_synced_at=sync_config.last_synced_at,
        last_sync_status=sync_config.last_sync_status,
        created_at=sync_config.created_at
    )


@router.get("/sync/{project_id}", response_model=GitHubSyncResponse)
async def get_sync_config(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sync configuration for a project."""
    sync_config = db.query(GitHubSync).join(Project).filter(
        GitHubSync.project_id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not sync_config:
        raise HTTPException(status_code=404, detail="Sync not configured")

    return GitHubSyncResponse(
        id=sync_config.id,
        project_id=sync_config.project_id,
        repo_full_name=sync_config.repo_full_name,
        branch=sync_config.branch,
        path=sync_config.path,
        auto_sync=sync_config.auto_sync,
        sync_direction=sync_config.sync_direction,
        last_synced_at=sync_config.last_synced_at,
        last_sync_status=sync_config.last_sync_status,
        created_at=sync_config.created_at
    )


@router.put("/sync/{project_id}", response_model=GitHubSyncResponse)
async def update_sync_config(
    project_id: UUID,
    data: GitHubSyncUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update sync configuration."""
    sync_config = db.query(GitHubSync).join(Project).filter(
        GitHubSync.project_id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not sync_config:
        raise HTTPException(status_code=404, detail="Sync not configured")

    if data.branch is not None:
        sync_config.branch = data.branch
    if data.path is not None:
        sync_config.path = data.path
    if data.auto_sync is not None:
        sync_config.auto_sync = data.auto_sync
    if data.sync_direction is not None:
        sync_config.sync_direction = data.sync_direction

    db.commit()
    db.refresh(sync_config)

    return GitHubSyncResponse(
        id=sync_config.id,
        project_id=sync_config.project_id,
        repo_full_name=sync_config.repo_full_name,
        branch=sync_config.branch,
        path=sync_config.path,
        auto_sync=sync_config.auto_sync,
        sync_direction=sync_config.sync_direction,
        last_synced_at=sync_config.last_synced_at,
        last_sync_status=sync_config.last_sync_status,
        created_at=sync_config.created_at
    )


@router.delete("/sync/{project_id}")
async def delete_sync_config(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove GitHub sync from a project."""
    sync_config = db.query(GitHubSync).join(Project).filter(
        GitHubSync.project_id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not sync_config:
        raise HTTPException(status_code=404, detail="Sync not configured")

    db.delete(sync_config)
    db.commit()

    return {"message": "Sync configuration removed"}


@router.post("/sync/{project_id}/trigger")
async def trigger_sync(
    project_id: UUID,
    data: GitHubSyncTrigger,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually trigger a sync."""
    sync_config = db.query(GitHubSync).join(Project).filter(
        GitHubSync.project_id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not sync_config:
        raise HTTPException(status_code=404, detail="Sync not configured")

    project = db.query(Project).filter(Project.id == project_id).first()

    # TODO: Get actual OAuth token for user
    # For now, check if token is stored
    if not sync_config.access_token_encrypted:
        raise HTTPException(
            status_code=400,
            detail="GitHub not connected. Please authorize GitHub access first."
        )

    # Decrypt token (simplified - use proper encryption in production)
    access_token = sync_config.access_token_encrypted

    github_service = GitHubSyncService(access_token)

    if data.direction == "push":
        results = await sync_project_to_github(db, project, sync_config, github_service)
    else:
        results = await sync_github_to_project(db, project, sync_config, github_service)

    return {
        "message": f"Sync {data.direction} completed",
        "results": results
    }


# OAuth endpoints (simplified - in production use proper OAuth flow)
@router.get("/oauth/authorize")
async def github_oauth_authorize(
    current_user: User = Depends(get_current_user)
):
    """Start GitHub OAuth flow."""
    # In production, redirect to GitHub OAuth
    # For now, return instructions
    return {
        "message": "GitHub OAuth flow",
        "instructions": "Set your GitHub personal access token in the sync configuration",
        "required_scopes": ["repo", "read:user"]
    }


@router.post("/oauth/callback")
async def github_oauth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback."""
    # In production, exchange code for token
    return {"message": "OAuth callback - implement token exchange"}
