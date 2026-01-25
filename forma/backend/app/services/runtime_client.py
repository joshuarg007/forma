"""Runtime Client Service

HTTP client for communicating with the Forma Runtime shared instance.
"""
import os
import httpx
from typing import Dict, Any

# Runtime configuration from environment
RUNTIME_URL = os.getenv("RUNTIME_URL", "http://localhost:8080")
RUNTIME_INTERNAL_KEY = os.getenv("RUNTIME_INTERNAL_KEY", "dev-internal-key")


class RuntimeClient:
    """Client for Forma Runtime API."""

    def __init__(self, base_url: str = RUNTIME_URL, internal_key: str = RUNTIME_INTERNAL_KEY):
        self.base_url = base_url.rstrip("/")
        self.internal_key = internal_key

    async def register_project(
        self,
        project_id: str,
        schema: Dict[str, Any],
        existing_schema: Dict[str, Any] | None = None,
        skip_ai_validation: bool = False,
    ) -> Dict[str, Any]:
        """
        Register a project schema with the shared runtime.

        This creates the database tables and API routes for the project.
        Includes AI-powered validation that can block deployment if critical issues found.

        Args:
            project_id: Unique project identifier
            schema: Schema definition from DataModeler
            existing_schema: Previous schema for breaking change detection
            skip_ai_validation: Skip AI review (faster but less thorough)

        Returns:
            Dict with api_url, validation results, and other deployment info
        """
        async with httpx.AsyncClient(timeout=60.0) as client:  # Longer timeout for AI validation
            response = await client.post(
                f"{self.base_url}/internal/register",
                json={
                    "project_id": project_id,
                    "schema": schema,
                    "existing_schema": existing_schema,
                    "skip_ai_validation": skip_ai_validation,
                },
                headers={
                    "X-Internal-Key": self.internal_key,
                    "Content-Type": "application/json"
                }
            )

            result = response.json()

            # Check if deployment was blocked by validation
            if response.status_code == 200 and not result.get("success", True):
                # Validation blocked deployment - return the validation info
                return {
                    "success": False,
                    "api_url": None,
                    "message": result.get("message", "Deployment blocked"),
                    "validation": result.get("validation"),
                }

            if response.status_code != 200:
                error_detail = response.text
                raise RuntimeError(f"Runtime registration failed: {error_detail}")

            # Build the full API URL
            api_base = result.get("api_base", f"/api/p/{project_id}")
            api_url = f"{self.base_url}{api_base}"

            return {
                "success": True,
                "api_url": api_url,
                "api_base": api_base,
                "collections": result.get("collections", []),
                "validation": result.get("validation"),
                "message": result.get("message"),
            }

    async def unregister_project(self, project_id: str) -> bool:
        """
        Unregister a project from the runtime.

        This removes the API routes but keeps the data.

        Args:
            project_id: Unique project identifier

        Returns:
            True if successful
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{self.base_url}/internal/unregister/{project_id}",
                headers={
                    "X-Internal-Key": self.internal_key
                }
            )

            return response.status_code == 200

    async def health_check(self) -> bool:
        """Check if runtime is healthy."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False


# Singleton instance
runtime_client = RuntimeClient()
