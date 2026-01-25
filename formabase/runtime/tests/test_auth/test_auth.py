"""Tests for authentication."""

from datetime import timedelta

import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI

from forma_runtime.auth import (
    create_auth_router,
    create_access_token,
    create_refresh_token,
    verify_password,
    hash_password,
)


class TestPasswordHashing:
    """Tests for password hashing utilities."""

    def test_hash_password(self):
        """Test password hashing."""
        password = "secret123"
        hashed = hash_password(password)

        assert hashed != password
        assert len(hashed) > 20

    def test_verify_password_correct(self):
        """Test verifying correct password."""
        password = "secret123"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password."""
        password = "secret123"
        hashed = hash_password(password)

        assert verify_password("wrong", hashed) is False

    def test_different_hashes_same_password(self):
        """Test that same password produces different hashes (salt)."""
        password = "secret123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)


class TestTokens:
    """Tests for JWT tokens."""

    def test_create_access_token(self):
        """Test creating a JWT access token."""
        token = create_access_token(
            data={"sub": "1", "email": "test@example.com"},
            expires_delta=timedelta(minutes=30)
        )

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50

    def test_create_access_and_refresh_tokens(self):
        """Test that access and refresh tokens are different."""
        access = create_access_token({"sub": "1"})
        refresh = create_refresh_token({"sub": "1"})

        assert access != refresh


class TestAuthEndpoints:
    """Tests for auth API endpoints."""

    @pytest.fixture
    def auth_app(self, parsed_schema, model_factory, async_engine):
        """Create app with auth routes."""
        from forma_runtime.api import RouterFactory
        from forma_runtime.db import get_session
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

        app = FastAPI()
        models = model_factory.generate_models()

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

        # Generate API routes
        router_factory = RouterFactory(parsed_schema, models)
        api_router = router_factory.generate_routers()
        app.include_router(api_router, prefix="/api")
        app.state.router_factory = router_factory

        # Override the get_session dependency
        app.dependency_overrides[get_session] = get_test_session

        # Add auth routes
        auth_router = create_auth_router(app.state)
        app.include_router(auth_router, prefix="/api")

        return app

    @pytest.fixture
    async def auth_client(self, auth_app, async_engine, model_factory):
        """Create test client with auth routes."""
        async with async_engine.begin() as conn:
            await conn.run_sync(model_factory.base.metadata.create_all)

        transport = ASGITransport(app=auth_app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client

    @pytest.mark.asyncio
    async def test_register_user(self, auth_client):
        """Test user registration."""
        response = await auth_client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "password": "password123",
            "name": "New User"
        })

        assert response.status_code == 201
        data = response.json()
        # Registration returns tokens, not user data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, auth_client):
        """Test registration fails with duplicate email."""
        # Register first user
        await auth_client.post("/api/auth/register", json={
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "First"
        })

        # Try to register with same email
        response = await auth_client.post("/api/auth/register", json={
            "email": "duplicate@example.com",
            "password": "password456",
            "name": "Second"
        })

        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_login_success(self, auth_client):
        """Test successful login."""
        # Register user
        await auth_client.post("/api/auth/register", json={
            "email": "login@example.com",
            "password": "password123",
            "name": "Login Test"
        })

        # Login
        response = await auth_client.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "password123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, auth_client):
        """Test login with wrong password."""
        # Register user
        await auth_client.post("/api/auth/register", json={
            "email": "wrongpass@example.com",
            "password": "correct",
            "name": "Test"
        })

        # Try to login with wrong password
        response = await auth_client.post("/api/auth/login", json={
            "email": "wrongpass@example.com",
            "password": "incorrect"
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, auth_client):
        """Test login for nonexistent user."""
        response = await auth_client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password"
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_endpoint(self, auth_client):
        """Test getting current user."""
        # Register and login
        await auth_client.post("/api/auth/register", json={
            "email": "me@example.com",
            "password": "password123",
            "name": "Me Test"
        })

        login_response = await auth_client.post("/api/auth/login", json={
            "email": "me@example.com",
            "password": "password123"
        })
        token = login_response.json()["access_token"]

        # Get current user
        response = await auth_client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me@example.com"

    @pytest.mark.asyncio
    async def test_me_without_token(self, auth_client):
        """Test getting current user without token."""
        response = await auth_client.get("/api/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_token(self, auth_client):
        """Test refreshing access token."""
        # Register and login
        await auth_client.post("/api/auth/register", json={
            "email": "refresh@example.com",
            "password": "password123",
            "name": "Refresh Test"
        })

        login_response = await auth_client.post("/api/auth/login", json={
            "email": "refresh@example.com",
            "password": "password123"
        })
        refresh_token = login_response.json()["refresh_token"]

        # Refresh
        response = await auth_client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
