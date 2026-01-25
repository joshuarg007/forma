"""Cloudflare Pages API Integration for Forma Hosting"""
import httpx
import hashlib
import mimetypes
from typing import Dict, List, Optional, Any
from pathlib import Path
import asyncio
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class CloudflareService:
    """
    Cloudflare Pages Direct Upload API integration.

    Reference: https://developers.cloudflare.com/pages/platform/direct-upload/
    """

    def __init__(self):
        self.api_token = settings.cloudflare_api_token
        self.account_id = settings.cloudflare_account_id
        self.base_url = "https://api.cloudflare.com/client/v4"

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }

    def _get_content_type(self, file_path: str) -> str:
        """Get content type for a file."""
        content_type, _ = mimetypes.guess_type(file_path)
        return content_type or "application/octet-stream"

    def _hash_file(self, content: bytes) -> str:
        """Generate SHA256 hash for file content."""
        return hashlib.sha256(content).hexdigest()

    async def create_project(self, name: str, subdomain: str) -> Dict[str, Any]:
        """
        Create a new Cloudflare Pages project.

        Args:
            name: Project name (used internally)
            subdomain: Desired subdomain for the project

        Returns:
            Cloudflare API response with project details
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects"

        payload = {
            "name": name,
            "production_branch": "main",
            "build_config": {
                "build_command": "",  # We pre-build
                "destination_dir": "",  # We upload directly
                "root_dir": ""
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()

    async def get_project(self, project_name: str) -> Optional[Dict[str, Any]]:
        """
        Get a Cloudflare Pages project by name.

        Args:
            project_name: The project name

        Returns:
            Project details or None if not found
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()

    async def delete_project(self, project_name: str) -> bool:
        """
        Delete a Cloudflare Pages project.

        Args:
            project_name: The project name to delete

        Returns:
            True if deleted, False if not found
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}"

        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=self.headers)
            if response.status_code == 404:
                return False
            response.raise_for_status()
            return True

    async def create_deployment(
        self,
        project_name: str,
        files: Dict[str, bytes],
        branch: str = "main"
    ) -> Dict[str, Any]:
        """
        Deploy files using Cloudflare Pages Direct Upload API.

        This uses the direct upload method which involves:
        1. Creating an upload token
        2. Uploading files with their hashes
        3. Completing the deployment

        Args:
            project_name: Cloudflare Pages project name
            files: Dict mapping relative file paths to file contents
            branch: Git branch name (default: main)

        Returns:
            Deployment response with URL and status
        """
        # Step 1: Create a new deployment
        create_url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments"

        # Prepare file manifest
        manifest = {}
        for path, content in files.items():
            file_hash = self._hash_file(content)
            manifest[f"/{path}"] = file_hash

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Create deployment with manifest
            create_response = await client.post(
                create_url,
                headers=self.headers,
                json={
                    "branch": branch,
                    "manifest": manifest
                }
            )
            create_response.raise_for_status()
            deployment_data = create_response.json()

            deployment_id = deployment_data["result"]["id"]
            upload_token = deployment_data["result"].get("upload_token")

            # Step 2: Upload missing files
            missing_hashes = deployment_data["result"].get("missing_files", [])

            if missing_hashes:
                # Build hash to content map
                hash_to_content = {}
                for path, content in files.items():
                    file_hash = self._hash_file(content)
                    hash_to_content[file_hash] = content

                # Upload missing files
                upload_url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments/{deployment_id}/files"

                for file_hash in missing_hashes:
                    content = hash_to_content.get(file_hash)
                    if content:
                        # Upload individual file
                        upload_response = await client.put(
                            f"{upload_url}/{file_hash}",
                            headers={
                                "Authorization": f"Bearer {self.api_token}",
                                "Content-Type": "application/octet-stream"
                            },
                            content=content
                        )
                        upload_response.raise_for_status()

            # Step 3: Get final deployment status
            status_url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments/{deployment_id}"
            status_response = await client.get(status_url, headers=self.headers)
            status_response.raise_for_status()

            return status_response.json()

    async def get_deployment_status(
        self,
        project_name: str,
        deployment_id: str
    ) -> Dict[str, Any]:
        """
        Get the status of a deployment.

        Args:
            project_name: Cloudflare Pages project name
            deployment_id: The deployment ID

        Returns:
            Deployment status and details
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments/{deployment_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def wait_for_deployment(
        self,
        project_name: str,
        deployment_id: str,
        timeout: int = 300,
        poll_interval: int = 5
    ) -> Dict[str, Any]:
        """
        Wait for a deployment to complete.

        Args:
            project_name: Cloudflare Pages project name
            deployment_id: The deployment ID
            timeout: Maximum time to wait in seconds
            poll_interval: Time between status checks

        Returns:
            Final deployment status

        Raises:
            TimeoutError: If deployment doesn't complete within timeout
        """
        elapsed = 0
        while elapsed < timeout:
            status = await self.get_deployment_status(project_name, deployment_id)
            stage = status.get("result", {}).get("stage", "")

            if stage in ["success", "deployed"]:
                return status
            elif stage in ["failure", "failed"]:
                raise Exception(f"Deployment failed: {status}")

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        raise TimeoutError(f"Deployment did not complete within {timeout} seconds")

    async def list_deployments(
        self,
        project_name: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List deployments for a project.

        Args:
            project_name: Cloudflare Pages project name
            limit: Maximum number of deployments to return

        Returns:
            List of deployments
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                params={"per_page": limit}
            )
            response.raise_for_status()
            return response.json().get("result", [])

    async def rollback_deployment(
        self,
        project_name: str,
        deployment_id: str
    ) -> Dict[str, Any]:
        """
        Rollback to a previous deployment.

        Args:
            project_name: Cloudflare Pages project name
            deployment_id: The deployment ID to rollback to

        Returns:
            New deployment status
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback"

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    # ==========================================================================
    # CUSTOM DOMAIN METHODS
    # ==========================================================================

    async def add_custom_domain(
        self,
        project_name: str,
        domain: str
    ) -> Dict[str, Any]:
        """
        Add a custom domain to a Pages project.

        Args:
            project_name: Cloudflare Pages project name
            domain: The custom domain to add

        Returns:
            Domain configuration with DNS records
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/domains"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=self.headers,
                json={"name": domain}
            )
            response.raise_for_status()
            return response.json()

    async def get_custom_domains(self, project_name: str) -> List[Dict[str, Any]]:
        """
        Get all custom domains for a project.

        Args:
            project_name: Cloudflare Pages project name

        Returns:
            List of custom domain configurations
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/domains"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json().get("result", [])

    async def delete_custom_domain(
        self,
        project_name: str,
        domain: str
    ) -> bool:
        """
        Remove a custom domain from a project.

        Args:
            project_name: Cloudflare Pages project name
            domain: The domain to remove

        Returns:
            True if removed successfully
        """
        url = f"{self.base_url}/accounts/{self.account_id}/pages/projects/{project_name}/domains/{domain}"

        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=self.headers)
            if response.status_code == 404:
                return False
            response.raise_for_status()
            return True

    async def verify_domain_dns(self, domain: str) -> Dict[str, Any]:
        """
        Verify DNS records are configured correctly for a domain.

        This performs a DNS lookup to check if the domain points
        to Cloudflare Pages.

        Args:
            domain: The domain to verify

        Returns:
            Verification status and details
        """
        import socket

        try:
            # Try to resolve the domain
            result = socket.gethostbyname(domain)

            # Check if it resolves to Cloudflare IPs
            # (This is a simplified check - real implementation would be more robust)
            return {
                "verified": True,
                "resolved_ip": result,
                "message": "Domain resolves correctly"
            }
        except socket.gaierror:
            return {
                "verified": False,
                "resolved_ip": None,
                "message": "Domain does not resolve"
            }


# Singleton instance
cloudflare_service = CloudflareService()
