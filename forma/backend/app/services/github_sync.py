"""GitHub Sync Service - Two-way sync between FORMA and GitHub repos"""
import base64
import httpx
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Component, Project, GitHubSync


class GitHubSyncService:
    """Service for syncing components with GitHub repositories."""

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    async def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated request to GitHub API."""
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method,
                f"{self.base_url}{endpoint}",
                headers=self.headers,
                **kwargs
            )
            response.raise_for_status()
            return response.json() if response.content else {}

    async def get_user(self) -> Dict[str, Any]:
        """Get authenticated user info."""
        return await self._request("GET", "/user")

    async def list_repos(self) -> List[Dict[str, Any]]:
        """List user's repositories."""
        return await self._request("GET", "/user/repos?per_page=100&sort=updated")

    async def get_repo(self, repo_full_name: str) -> Dict[str, Any]:
        """Get repository details."""
        return await self._request("GET", f"/repos/{repo_full_name}")

    async def get_file_content(
        self,
        repo_full_name: str,
        path: str,
        branch: str = "main"
    ) -> Optional[Dict[str, Any]]:
        """Get file content from repo."""
        try:
            return await self._request(
                "GET",
                f"/repos/{repo_full_name}/contents/{path}?ref={branch}"
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise

    async def create_or_update_file(
        self,
        repo_full_name: str,
        path: str,
        content: str,
        message: str,
        branch: str = "main",
        sha: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create or update a file in the repo."""
        data = {
            "message": message,
            "content": base64.b64encode(content.encode()).decode(),
            "branch": branch
        }
        if sha:
            data["sha"] = sha

        return await self._request(
            "PUT",
            f"/repos/{repo_full_name}/contents/{path}",
            json=data
        )

    async def delete_file(
        self,
        repo_full_name: str,
        path: str,
        message: str,
        sha: str,
        branch: str = "main"
    ) -> Dict[str, Any]:
        """Delete a file from the repo."""
        return await self._request(
            "DELETE",
            f"/repos/{repo_full_name}/contents/{path}",
            json={
                "message": message,
                "sha": sha,
                "branch": branch
            }
        )

    async def list_directory(
        self,
        repo_full_name: str,
        path: str,
        branch: str = "main"
    ) -> List[Dict[str, Any]]:
        """List files in a directory."""
        try:
            result = await self._request(
                "GET",
                f"/repos/{repo_full_name}/contents/{path}?ref={branch}"
            )
            return result if isinstance(result, list) else []
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return []
            raise


def component_to_file_content(component: Component) -> str:
    """Convert a FORMA component to a React file."""
    # Add FORMA metadata as comment
    metadata = f'''/**
 * @forma-component
 * @id {component.id}
 * @intent {component.intent or ""}
 * @updated {component.updated_at.isoformat() if component.updated_at else ""}
 */
'''
    return metadata + (component.code or "")


def parse_forma_metadata(content: str) -> Dict[str, str]:
    """Parse FORMA metadata from file content."""
    metadata = {}
    lines = content.split("\n")

    in_comment = False
    for line in lines:
        if "/**" in line:
            in_comment = True
        elif "*/" in line:
            break
        elif in_comment and "@forma-" in line or "@id" in line or "@intent" in line or "@updated" in line:
            if "@forma-component" in line:
                metadata["is_forma"] = "true"
            elif "@id" in line:
                metadata["id"] = line.split("@id")[1].strip()
            elif "@intent" in line:
                metadata["intent"] = line.split("@intent")[1].strip()
            elif "@updated" in line:
                metadata["updated"] = line.split("@updated")[1].strip()

    return metadata


async def sync_project_to_github(
    db: Session,
    project: Project,
    sync_config: GitHubSync,
    github_service: GitHubSyncService
) -> Dict[str, Any]:
    """Push all project components to GitHub."""
    results = {
        "pushed": [],
        "skipped": [],
        "errors": []
    }

    components = db.query(Component).filter(
        Component.project_id == project.id
    ).all()

    for component in components:
        try:
            file_path = f"{sync_config.path}/{component.name}.tsx"
            content = component_to_file_content(component)

            # Check if file exists
            existing = await github_service.get_file_content(
                sync_config.repo_full_name,
                file_path,
                sync_config.branch
            )

            sha = existing.get("sha") if existing else None

            await github_service.create_or_update_file(
                sync_config.repo_full_name,
                file_path,
                content,
                f"[FORMA] Update {component.name}",
                sync_config.branch,
                sha
            )

            results["pushed"].append(component.name)

        except Exception as e:
            results["errors"].append({
                "component": component.name,
                "error": str(e)
            })

    # Update sync status
    sync_config.last_synced_at = datetime.utcnow()
    sync_config.last_sync_status = "success" if not results["errors"] else "partial"
    db.commit()

    return results


async def sync_github_to_project(
    db: Session,
    project: Project,
    sync_config: GitHubSync,
    github_service: GitHubSyncService
) -> Dict[str, Any]:
    """Pull components from GitHub into FORMA."""
    results = {
        "pulled": [],
        "created": [],
        "skipped": [],
        "errors": []
    }

    try:
        # List files in component directory
        files = await github_service.list_directory(
            sync_config.repo_full_name,
            sync_config.path,
            sync_config.branch
        )

        for file_info in files:
            if not file_info["name"].endswith((".tsx", ".jsx")):
                continue

            try:
                # Get file content
                file_data = await github_service.get_file_content(
                    sync_config.repo_full_name,
                    file_info["path"],
                    sync_config.branch
                )

                if not file_data:
                    continue

                content = base64.b64decode(file_data["content"]).decode()
                metadata = parse_forma_metadata(content)

                # Extract component name from filename
                comp_name = file_info["name"].replace(".tsx", "").replace(".jsx", "")

                # Check if it's a FORMA-managed component
                if metadata.get("is_forma") and metadata.get("id"):
                    # Update existing component
                    component = db.query(Component).filter(
                        Component.id == metadata["id"]
                    ).first()

                    if component:
                        # Remove metadata comment from code
                        code_start = content.find("*/")
                        if code_start != -1:
                            component.code = content[code_start + 2:].strip()
                        else:
                            component.code = content

                        results["pulled"].append(comp_name)
                else:
                    # Create new component from non-FORMA file
                    existing = db.query(Component).filter(
                        Component.project_id == project.id,
                        Component.name == comp_name
                    ).first()

                    if not existing:
                        new_component = Component(
                            project_id=project.id,
                            name=comp_name,
                            code=content,
                            intent=f"Imported from {sync_config.repo_full_name}"
                        )
                        db.add(new_component)
                        results["created"].append(comp_name)
                    else:
                        results["skipped"].append(comp_name)

            except Exception as e:
                results["errors"].append({
                    "file": file_info["name"],
                    "error": str(e)
                })

        db.commit()

        # Update sync status
        sync_config.last_synced_at = datetime.utcnow()
        sync_config.last_sync_status = "success" if not results["errors"] else "partial"
        db.commit()

    except Exception as e:
        sync_config.last_sync_status = "failed"
        db.commit()
        raise

    return results
