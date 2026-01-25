"""Authentication routes."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import CRUDBase, get_session
from .dependencies import get_current_user
from .jwt import TokenError, create_token_pair, verify_refresh_token
from .password import hash_password, verify_password


class RegisterRequest(BaseModel):
    """Registration request body."""

    email: EmailStr
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Refresh token request body."""

    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Password change request body."""

    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


def create_auth_router(app_state: Any) -> APIRouter:
    """
    Create authentication router.

    Args:
        app_state: FastAPI app state containing schema and models

    Returns:
        Configured auth router
    """
    router = APIRouter(prefix="/auth", tags=["Authentication"])

    @router.post("/register", response_model=TokenResponse, status_code=201)
    async def register(
        request: Request,
        data: RegisterRequest,
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, str]:
        """Register a new user."""
        # Get auth collection
        schema = request.app.state.schema
        auth_collection = schema.get_auth_collection()

        if not auth_collection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured in schema",
            )

        coll_name, collection = auth_collection
        model = request.app.state.models.get(coll_name)

        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model not found",
            )

        # Check if email exists
        query = select(model).where(model.email == data.email)
        result = await session.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create user
        user_data = {
            "email": data.email,
            "password_hash": hash_password(data.password),
        }

        # Add name if field exists
        if hasattr(model, "name") and data.name:
            user_data["name"] = data.name

        # Add default role if field exists
        if hasattr(model, "role"):
            settings = schema.settings
            default_role = "user"
            if settings and settings.auth:
                default_role = settings.auth.default_role
            user_data["role"] = default_role

        crud = CRUDBase(model)
        user = await crud.create(session, user_data)

        # Create tokens
        role = getattr(user, "role", None)
        return create_token_pair(user.id, user.email, role)

    @router.post("/login", response_model=TokenResponse)
    async def login(
        request: Request,
        data: LoginRequest,
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, str]:
        """Login with email and password."""
        schema = request.app.state.schema
        auth_collection = schema.get_auth_collection()

        if not auth_collection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured",
            )

        coll_name, _ = auth_collection
        model = request.app.state.models.get(coll_name)

        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model not found",
            )

        # Find user
        query = select(model).where(model.email == data.email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Check password
        if not hasattr(user, "password_hash"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model missing password_hash field",
            )

        if not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Create tokens
        role = getattr(user, "role", None)
        return create_token_pair(user.id, user.email, role)

    @router.post("/refresh", response_model=TokenResponse)
    async def refresh(
        request: Request,
        data: RefreshRequest,
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, str]:
        """Refresh access token."""
        try:
            payload = verify_refresh_token(data.refresh_token)
        except TokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )

        user_id = int(payload.get("sub", 0))
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Get user
        schema = request.app.state.schema
        auth_collection = schema.get_auth_collection()

        if not auth_collection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured",
            )

        coll_name, _ = auth_collection
        model = request.app.state.models.get(coll_name)

        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model not found",
            )

        crud = CRUDBase(model)
        user = await crud.get(session, user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Create new tokens
        role = getattr(user, "role", None)
        return create_token_pair(user.id, user.email, role)

    @router.get("/me")
    async def me(
        user: dict[str, Any] = Depends(get_current_user),
    ) -> dict[str, Any]:
        """Get current user info."""
        user_model = user.get("_model")
        if not user_model:
            return {
                "id": user["id"],
                "email": user["email"],
                "role": user.get("role"),
            }

        # Serialize user model
        result = {}
        for column in user_model.__table__.columns:
            if column.name == "password_hash":
                continue  # Never expose password hash
            value = getattr(user_model, column.name)
            if hasattr(value, "isoformat"):
                value = value.isoformat()
            result[column.name] = value

        return result

    @router.put("/me")
    async def update_me(
        request: Request,
        data: dict[str, Any],
        user: dict[str, Any] = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, Any]:
        """Update current user info."""
        schema = request.app.state.schema
        auth_collection = schema.get_auth_collection()

        if not auth_collection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured",
            )

        coll_name, _ = auth_collection
        model = request.app.state.models.get(coll_name)

        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model not found",
            )

        # Remove sensitive fields
        safe_data = {
            k: v
            for k, v in data.items()
            if k not in ("id", "password_hash", "role", "email")
        }

        crud = CRUDBase(model)
        updated = await crud.update(session, user["id"], safe_data)

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Serialize
        result = {}
        for column in updated.__table__.columns:
            if column.name == "password_hash":
                continue
            value = getattr(updated, column.name)
            if hasattr(value, "isoformat"):
                value = value.isoformat()
            result[column.name] = value

        return result

    @router.post("/password")
    async def change_password(
        request: Request,
        data: PasswordChangeRequest,
        user: dict[str, Any] = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, str]:
        """Change password."""
        user_model = user.get("_model")

        if not user_model or not hasattr(user_model, "password_hash"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cannot change password",
            )

        # Verify current password
        if not verify_password(data.current_password, user_model.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Update password
        schema = request.app.state.schema
        auth_collection = schema.get_auth_collection()

        if not auth_collection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured",
            )

        coll_name, _ = auth_collection
        model = request.app.state.models.get(coll_name)

        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth model not found",
            )

        crud = CRUDBase(model)
        await crud.update(
            session,
            user["id"],
            {"password_hash": hash_password(data.new_password)},
        )

        return {"message": "Password changed successfully"}

    @router.post("/logout")
    async def logout() -> dict[str, str]:
        """
        Logout (client should discard tokens).

        Note: For stateless JWT, server-side logout requires token blacklisting
        which is not implemented in the basic version.
        """
        return {"message": "Logged out successfully"}

    return router
