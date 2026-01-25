"""Tests for multi-tenant functionality."""

import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI

from forma_runtime.registry import SchemaRegistry


class TestSchemaRegistry:
    """Tests for SchemaRegistry."""

    @pytest.fixture
    def registry(self, async_engine):
        """Create a schema registry."""
        return SchemaRegistry(async_engine)

    @pytest.fixture
    def blog_schema_dict(self):
        """Blog schema as dict."""
        return {
            "version": "1.0",
            "name": "test-blog",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "password_hash": {"type": "text", "required": True},
                        "name": {"type": "text"}
                    }
                },
                "post": {
                    "timestamps": True,
                    "fields": {
                        "title": {"type": "text", "required": True},
                        "content": {"type": "richtext"}
                    }
                }
            }
        }

    @pytest.fixture
    def ecommerce_schema_dict(self):
        """E-commerce schema as dict."""
        return {
            "version": "1.0",
            "name": "test-shop",
            "collections": {
                "product": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "price": {"type": "integer", "required": True}
                    }
                },
                "order": {
                    "timestamps": True,
                    "fields": {
                        "total": {"type": "integer", "required": True}
                    }
                }
            }
        }

    @pytest.mark.asyncio
    async def test_register_project(self, registry, blog_schema_dict):
        """Test registering a project."""
        result = await registry.register(
            project_id="blog-1",
            schema_dict=blog_schema_dict
        )

        assert result.project_id == "blog-1"
        assert "user" in result.collections
        assert "post" in result.collections

    @pytest.mark.asyncio
    async def test_list_projects(self, registry, blog_schema_dict, ecommerce_schema_dict):
        """Test listing registered projects."""
        await registry.register("blog-1", blog_schema_dict)
        await registry.register("shop-1", ecommerce_schema_dict)

        projects = registry.list_projects()

        assert "blog-1" in projects
        assert "shop-1" in projects

    @pytest.mark.asyncio
    async def test_get_schema(self, registry, blog_schema_dict):
        """Test getting schema for a project."""
        await registry.register("blog-1", blog_schema_dict)

        schema = registry.get_schema("blog-1")

        assert schema is not None
        assert schema.name == "test-blog"

    @pytest.mark.asyncio
    async def test_get_models(self, registry, blog_schema_dict):
        """Test getting models for a project."""
        await registry.register("blog-1", blog_schema_dict)

        models = registry.get_models("blog-1")

        assert models is not None
        assert "user" in models
        assert "post" in models

    @pytest.mark.asyncio
    async def test_unregister_project(self, registry, blog_schema_dict):
        """Test unregistering a project."""
        await registry.register("blog-1", blog_schema_dict)
        assert "blog-1" in registry.list_projects()

        success = await registry.unregister("blog-1")

        assert success is True
        assert "blog-1" not in registry.list_projects()

    @pytest.mark.asyncio
    async def test_table_prefixing(self, registry, blog_schema_dict):
        """Test that tables are prefixed with project short ID."""
        result = await registry.register("my-blog-project", blog_schema_dict)

        models = registry.get_models("my-blog-project")
        User = models["user"]

        # Table name should be prefixed
        assert User.__tablename__.startswith("p_")
        assert "user" in User.__tablename__

    @pytest.mark.asyncio
    async def test_project_isolation(self, registry, blog_schema_dict, ecommerce_schema_dict):
        """Test that projects have isolated tables."""
        await registry.register("blog-1", blog_schema_dict)
        await registry.register("shop-1", ecommerce_schema_dict)

        blog_models = registry.get_models("blog-1")
        shop_models = registry.get_models("shop-1")

        # Tables should have different prefixes
        assert blog_models["user"].__tablename__ != shop_models.get("user", {})
        assert blog_models["post"].__tablename__ != shop_models.get("product", {})


class TestMultiTenantAPI:
    """Tests for multi-tenant API endpoints."""

    @pytest.fixture
    def multi_tenant_app(self, async_engine):
        """Create a multi-tenant FastAPI app with internal endpoints."""
        from fastapi import FastAPI, HTTPException, Header
        from pydantic import BaseModel
        from typing import Any

        INTERNAL_KEY = "test-internal-key"

        app = FastAPI()
        app.state.registry = SchemaRegistry(async_engine)

        # Define the internal endpoints inline (same as main.py does when MULTI_TENANT=true)
        class RegisterRequest(BaseModel):
            project_id: str
            schema: dict[str, Any]
            skip_ai_validation: bool = True  # Skip AI in tests

        class RegisterResponse(BaseModel):
            success: bool
            api_base: str | None = None
            collections: list[str] = []
            message: str | None = None

        @app.post("/internal/register", response_model=RegisterResponse)
        async def register_project(
            data: RegisterRequest,
            x_internal_key: str = Header(None, alias="X-Internal-Key"),
        ):
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")

            try:
                registration = await app.state.registry.register(
                    project_id=data.project_id,
                    schema_dict=data.schema,
                )
                return RegisterResponse(
                    success=True,
                    api_base=f"/api/p/{data.project_id}",
                    collections=registration.collections,
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @app.delete("/internal/unregister/{project_id}")
        async def unregister_project(
            project_id: str,
            x_internal_key: str = Header(None, alias="X-Internal-Key"),
        ):
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")
            success = await app.state.registry.unregister(project_id)
            return {"success": success}

        @app.get("/internal/projects")
        async def list_projects(
            x_internal_key: str = Header(None, alias="X-Internal-Key"),
        ):
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")
            return {"projects": app.state.registry.list_projects()}

        return app

    @pytest.fixture
    async def mt_client(self, multi_tenant_app):
        """Create test client for multi-tenant app."""
        transport = ASGITransport(app=multi_tenant_app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client

    @pytest.mark.asyncio
    async def test_register_endpoint(self, mt_client):
        """Test the /internal/register endpoint."""
        schema = {
            "version": "1.0",
            "name": "test-app",
            "collections": {
                "item": {
                    "fields": {
                        "name": {"type": "text", "required": True}
                    }
                }
            }
        }

        response = await mt_client.post(
            "/internal/register",
            json={"project_id": "test-project", "schema": schema},
            headers={"X-Internal-Key": "test-internal-key"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "api_base" in data
        assert "/api/p/test-project" in data["api_base"]

    @pytest.mark.asyncio
    async def test_register_without_key(self, mt_client):
        """Test that register fails without internal key."""
        response = await mt_client.post(
            "/internal/register",
            json={"project_id": "test", "schema": {}}
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_register_wrong_key(self, mt_client):
        """Test that register fails with wrong internal key."""
        response = await mt_client.post(
            "/internal/register",
            json={"project_id": "test", "schema": {}},
            headers={"X-Internal-Key": "wrong-key"}
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_list_projects_endpoint(self, mt_client):
        """Test the /internal/projects endpoint."""
        response = await mt_client.get(
            "/internal/projects",
            headers={"X-Internal-Key": "test-internal-key"}
        )

        assert response.status_code == 200
        assert "projects" in response.json()

    @pytest.mark.asyncio
    async def test_unregister_endpoint(self, mt_client):
        """Test the /internal/unregister endpoint."""
        # First register a project
        schema = {
            "version": "1.0",
            "name": "to-delete",
            "collections": {
                "item": {"fields": {"name": {"type": "text"}}}
            }
        }

        await mt_client.post(
            "/internal/register",
            json={"project_id": "to-delete", "schema": schema},
            headers={"X-Internal-Key": "test-internal-key"}
        )

        # Then unregister
        response = await mt_client.delete(
            "/internal/unregister/to-delete",
            headers={"X-Internal-Key": "test-internal-key"}
        )

        assert response.status_code == 200
        assert response.json()["success"] is True
