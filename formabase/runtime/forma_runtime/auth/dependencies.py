"""Authentication dependencies for FastAPI."""

from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from .jwt import TokenError, verify_access_token

# HTTP Bearer scheme
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any] | None:
    """
    Get current user from token if present.

    Returns None if no token or invalid token.
    """
    if not credentials:
        return None

    try:
        payload = verify_access_token(credentials.credentials)
    except TokenError:
        return None

    # Get user from database
    user_id = int(payload.get("sub", 0))
    if not user_id:
        return None

    # Get the auth collection model
    schema = request.app.state.schema
    auth_collection = schema.get_auth_collection()
    if not auth_collection:
        return None

    coll_name, _ = auth_collection
    model = request.app.state.models.get(coll_name)
    if not model:
        return None

    from ..db import CRUDBase

    crud = CRUDBase(model)
    user = await crud.get(session, user_id)

    if not user:
        return None

    return {
        "id": user.id,
        "email": getattr(user, "email", None),
        "role": getattr(user, "role", None),
        "_model": user,
    }


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """
    Get current user from token.

    Raises 401 if not authenticated.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = verify_access_token(credentials.credentials)
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user_id = int(payload.get("sub", 0))
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get the auth collection model
    schema = request.app.state.schema
    auth_collection = schema.get_auth_collection()
    if not auth_collection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth not configured",
        )

    coll_name, _ = auth_collection
    model = request.app.state.models.get(coll_name)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth model not found",
        )

    from ..db import CRUDBase

    crud = CRUDBase(model)
    user = await crud.get(session, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "id": user.id,
        "email": getattr(user, "email", None),
        "role": getattr(user, "role", None),
        "_model": user,
    }


def require_roles(*roles: str):
    """
    Dependency factory that requires specific roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("admin"))])
        async def admin_only(): ...
    """

    async def role_checker(user: dict[str, Any] = Depends(get_current_user)):
        user_role = user.get("role")
        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return role_checker
