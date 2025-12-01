"""GitHub Integration API Routes"""
import secrets
import httpx
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, GitHubSync
from app.schemas.marketplace import (
    GitHubSyncCreate, GitHubSyncUpdate, GitHubSyncResponse, GitHubSyncTrigger
)
from app.core.security import get_current_user
from app.core.config import settings
from app.services.github_sync import (
    GitHubSyncService,
    sync_project_to_github,
    sync_github_to_project
)

router = APIRouter(prefix="/api/github", tags=["github"])

# Store OAuth states temporarily (in production, use Redis)
oauth_states: dict[str, str] = {}


@router.get("/oauth/authorize")
async def github_oauth_authorize(
    current_user: User = Depends(get_current_user)
):
    """Start GitHub OAuth flow - returns URL to redirect user to."""
    if not settings.github_client_id:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
        )

    # Generate state token
    state = secrets.token_urlsafe(32)
    oauth_states[state] = str(current_user.id)

    # Build GitHub OAuth URL
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": settings.github_redirect_uri,
        "scope": "repo read:user user:email",
        "state": state,
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    oauth_url = f"https://github.com/login/oauth/authorize?{query_string}"

    return {
        "oauth_url": oauth_url,
        "state": state
    }


@router.get("/oauth/callback")
async def github_oauth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback - exchange code for token."""
    # Verify state
    user_id = oauth_states.pop(state, None)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")

        token_data = response.json()
        if "error" in token_data:
            raise HTTPException(
                status_code=400,
                detail=token_data.get("error_description", token_data["error"])
            )

        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token in response")

        # Get GitHub user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json"
            }
        )

        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get GitHub user info")

        github_user = user_response.json()

    # Store token and GitHub info (in production, encrypt the token)
    user.github_access_token = access_token
    user.github_username = github_user.get("login")
    user.github_id = str(github_user.get("id"))
    if not user.avatar_url:
        user.avatar_url = github_user.get("avatar_url")

    db.commit()

    # Return success (frontend can close popup or redirect)
    return {
        "success": True,
        "github_username": user.github_username,
        "message": "GitHub account connected successfully"
    }


@router.delete("/oauth/disconnect")
async def github_oauth_disconnect(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disconnect GitHub account."""
    current_user.github_access_token = None
    current_user.github_username = None
    current_user.github_id = None
    db.commit()

    return {"success": True, "message": "GitHub account disconnected"}


@router.get("/status")
async def github_connection_status(
    current_user: User = Depends(get_current_user)
):
    """Check if GitHub is connected."""
    return {
        "connected": bool(current_user.github_access_token),
        "github_username": current_user.github_username
    }


@router.get("/repos")
async def list_user_repos(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List user's GitHub repositories."""
    if not current_user.github_access_token:
        raise HTTPException(
            status_code=400,
            detail="GitHub not connected. Please authorize GitHub access first."
        )

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos",
            params={
                "page": page,
                "per_page": per_page,
                "sort": "updated",
                "affiliation": "owner,collaborator"
            },
            headers={
                "Authorization": f"Bearer {current_user.github_access_token}",
                "Accept": "application/vnd.github+json"
            }
        )

        if response.status_code == 401:
            # Token expired or revoked
            raise HTTPException(
                status_code=401,
                detail="GitHub token expired. Please reconnect your GitHub account."
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch repositories"
            )

        repos = response.json()

    return {
        "repos": [
            {
                "id": repo["id"],
                "full_name": repo["full_name"],
                "name": repo["name"],
                "private": repo["private"],
                "default_branch": repo["default_branch"],
                "description": repo["description"],
                "html_url": repo["html_url"],
                "updated_at": repo["updated_at"]
            }
            for repo in repos
        ],
        "page": page,
        "per_page": per_page
    }


@router.get("/repos/{owner}/{repo}/branches")
async def list_repo_branches(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user)
):
    """List branches for a repository."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/branches",
            headers={
                "Authorization": f"Bearer {current_user.github_access_token}",
                "Accept": "application/vnd.github+json"
            }
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch branches"
            )

        branches = response.json()

    return {
        "branches": [{"name": b["name"]} for b in branches]
    }


@router.post("/sync", response_model=GitHubSyncResponse)
async def create_sync_config(
    data: GitHubSyncCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set up GitHub sync for a project."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")

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
        sync_direction=data.sync_direction,
        access_token_encrypted=current_user.github_access_token
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

    # Get token from user or sync config
    access_token = current_user.github_access_token or sync_config.access_token_encrypted
    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="GitHub not connected. Please authorize GitHub access first."
        )

    github_service = GitHubSyncService(access_token)

    if data.direction == "push":
        results = await sync_project_to_github(db, project, sync_config, github_service)
    else:
        results = await sync_github_to_project(db, project, sync_config, github_service)

    return {
        "message": f"Sync {data.direction} completed",
        "results": results
    }
