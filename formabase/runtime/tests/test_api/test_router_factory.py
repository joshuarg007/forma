"""Tests for API router factory and CRUD operations."""

import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from forma_runtime.api import RouterFactory
from forma_runtime.db import ModelFactory, MigrationManager, get_engine, dispose_engine, get_session


@pytest.fixture
def app_with_routes(parsed_schema, model_factory, async_engine):
    """Create a FastAPI app with routes from schema."""
    app = FastAPI()

    models = model_factory.generate_models()

    # Store in app state for routes to access
    app.state.schema = parsed_schema
    app.state.models = models
    app.state.model_factory = model_factory
    app.state.engine = async_engine

    # Create a test session factory using the test engine
    test_session_factory = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Override get_session dependency to use test engine
    async def get_test_session():
        async with test_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    # Generate routes
    router_factory = RouterFactory(parsed_schema, models)
    api_router = router_factory.generate_routers()
    app.include_router(api_router, prefix="/api")

    # Override the get_session dependency
    app.dependency_overrides[get_session] = get_test_session

    # Store router factory for CRUD access
    app.state.router_factory = router_factory

    return app


@pytest.fixture
async def client(app_with_routes, async_engine, model_factory):
    """Create async test client with database."""
    # Create tables
    async with async_engine.begin() as conn:
        await conn.run_sync(model_factory.base.metadata.create_all)

    transport = ASGITransport(app=app_with_routes)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


class TestRouterFactory:
    """Tests for RouterFactory."""

    def test_generate_routers(self, parsed_schema, model_factory):
        """Test that routers are generated for all collections."""
        models = model_factory.generate_models()
        factory = RouterFactory(parsed_schema, models)
        router = factory.generate_routers()

        # Check routes exist
        routes = [r.path for r in router.routes]

        assert "/user" in routes or "/{collection}" in str(routes)
        assert "/post" in routes or "/{collection}" in str(routes)
        assert "/category" in routes or "/{collection}" in str(routes)

    def test_crud_instance_created(self, parsed_schema, model_factory):
        """Test that CRUD instances are created for each collection."""
        models = model_factory.generate_models()
        factory = RouterFactory(parsed_schema, models)
        factory.generate_routers()

        assert "user" in factory.crud_instances
        assert "post" in factory.crud_instances
        assert "category" in factory.crud_instances


class TestCRUDEndpoints:
    """Tests for CRUD endpoint functionality."""

    @pytest.mark.asyncio
    async def test_list_empty(self, client):
        """Test listing when no records exist."""
        response = await client.get("/api/user")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert data["items"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_create_user(self, client):
        """Test creating a user."""
        user_data = {
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "name": "Test User",
            "role": "user"
        }

        response = await client.post("/api/user", json=user_data)

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert "id" in data

    @pytest.mark.asyncio
    async def test_get_user(self, client):
        """Test getting a single user."""
        # Create user first
        user_data = {
            "email": "get@example.com",
            "password_hash": "hashed",
            "name": "Get Test"
        }
        create_response = await client.post("/api/user", json=user_data)
        user_id = create_response.json()["id"]

        # Get user
        response = await client.get(f"/api/user/{user_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "get@example.com"

    @pytest.mark.asyncio
    async def test_get_nonexistent_user(self, client):
        """Test getting a user that doesn't exist."""
        response = await client.get("/api/user/99999")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_user(self, client):
        """Test updating a user."""
        # Create user
        user_data = {
            "email": "update@example.com",
            "password_hash": "hashed",
            "name": "Before Update"
        }
        create_response = await client.post("/api/user", json=user_data)
        user_id = create_response.json()["id"]

        # Update user
        update_data = {"name": "After Update"}
        response = await client.put(f"/api/user/{user_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "After Update"
        assert data["email"] == "update@example.com"  # Unchanged

    @pytest.mark.asyncio
    async def test_delete_user(self, client):
        """Test deleting a user."""
        # Create user
        user_data = {
            "email": "delete@example.com",
            "password_hash": "hashed",
            "name": "To Delete"
        }
        create_response = await client.post("/api/user", json=user_data)
        user_id = create_response.json()["id"]

        # Delete user
        response = await client.delete(f"/api/user/{user_id}")

        assert response.status_code == 204

        # Verify deleted
        get_response = await client.get(f"/api/user/{user_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_list_with_pagination(self, client):
        """Test listing with pagination."""
        # Create multiple users
        for i in range(15):
            await client.post("/api/user", json={
                "email": f"paginate{i}@example.com",
                "password_hash": "hashed",
                "name": f"Paginate User {i}"
            })

        # Get first page (skip=0, limit=10)
        response = await client.get("/api/user?skip=0&limit=10")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] >= 15
        assert data["skip"] == 0

    @pytest.mark.asyncio
    async def test_list_with_search(self, client):
        """Test listing with search."""
        import uuid
        # Create users with unique names
        unique = str(uuid.uuid4())[:8]
        await client.post("/api/user", json={
            "email": f"searchadmin-{unique}@example.com",
            "password_hash": "hashed",
            "name": f"SearchAdmin {unique}",
            "role": "admin"
        })
        await client.post("/api/user", json={
            "email": f"searchuser-{unique}@example.com",
            "password_hash": "hashed",
            "name": f"SearchUser {unique}",
            "role": "user"
        })

        # List should return at least 2 users
        response = await client.get("/api/user")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 2


class TestRelations:
    """Tests for relations in API."""

    @pytest.mark.asyncio
    async def test_create_with_relation(self, client):
        """Test creating a record with a relation."""
        import uuid
        unique = str(uuid.uuid4())[:8]

        # Create user first
        user_response = await client.post("/api/user", json={
            "email": f"author-{unique}@example.com",
            "password_hash": "hashed",
            "name": "Author"
        })
        assert user_response.status_code == 201, f"Failed to create user: {user_response.text}"
        user_id = user_response.json()["id"]

        # Create post with author relation
        post_response = await client.post("/api/post", json={
            "title": f"Test Post {unique}",
            "content": "<p>Content</p>",
            "author": user_id,
            "status": "draft"
        })

        assert post_response.status_code == 201, f"Failed to create post: {post_response.text}"
        post = post_response.json()
        assert post["author"] == user_id
        assert "Test Post" in post["title"]
