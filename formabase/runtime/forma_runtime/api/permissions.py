"""Permission enforcement for Formabase API routes."""

from typing import Any, Callable, Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.dependencies import get_current_user_optional
from ..schema import CollectionPermissions


class PermissionChecker:
    """Check permissions for collection operations."""

    def __init__(
        self,
        collection_name: str,
        permissions: Optional[CollectionPermissions],
        operation: str,  # 'create', 'read', 'update', 'delete'
    ):
        self.collection_name = collection_name
        self.permissions = permissions
        self.operation = operation

    async def __call__(
        self,
        user: Optional[dict] = Depends(get_current_user_optional),
    ) -> Optional[dict]:
        """
        Check if the current user has permission for the operation.

        Returns:
            The current user (or None for public access)

        Raises:
            HTTPException 401 if authentication is required but not provided
            HTTPException 403 if the user doesn't have permission
        """
        # No permissions defined = public access
        if not self.permissions:
            return user

        # Get the permission rule for this operation
        rule = getattr(self.permissions, self.operation, None)
        if rule is None:
            # No rule for this operation = public access
            return user

        # Handle different permission formats
        if isinstance(rule, list):
            # List of roles
            return self._check_role_list(user, rule)
        elif isinstance(rule, dict):
            # Complex permission rule
            return self._check_permission_rule(user, rule)
        else:
            # Default: require authentication
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            return user

    def _check_role_list(
        self, user: Optional[dict], allowed_roles: list[str]
    ) -> Optional[dict]:
        """Check if user has one of the allowed roles."""
        # Check for public access
        if "public" in allowed_roles:
            return user

        # Require authentication
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        # Check for authenticated access (any logged in user)
        if "authenticated" in allowed_roles:
            return user

        # Check specific roles
        user_role = user.get("role", "user")
        if user_role in allowed_roles or "admin" == user_role:
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied for {self.operation} on {self.collection_name}",
        )

    def _check_permission_rule(
        self, user: Optional[dict], rule: dict
    ) -> Optional[dict]:
        """Check complex permission rule."""
        # Check public access
        if rule.get("public") is True:
            return user

        # Require authentication for other rules
        if not user:
            if rule.get("public") is False:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            return user

        # Check authenticated access
        if rule.get("authenticated") is True:
            return user

        # Check admin access
        if rule.get("admin") is True:
            user_role = user.get("role", "user")
            if user_role == "admin":
                return user
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        # Check role-specific access
        user_role = user.get("role", "user")
        role_rule = rule.get(user_role)
        if role_rule is True:
            return user
        elif isinstance(role_rule, dict) and "where" in role_rule:
            # Row-level security - store the where clause for later filtering
            # This is a simplification; full implementation would filter queries
            user["_permission_where"] = role_rule["where"]
            return user

        # Admin always has access
        if user_role == "admin":
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied for {self.operation} on {self.collection_name}",
        )


def create_permission_dependency(
    collection_name: str,
    permissions: Optional[CollectionPermissions],
    operation: str,
) -> Callable:
    """Create a FastAPI dependency for permission checking.

    Args:
        collection_name: Name of the collection
        permissions: Permission definitions from schema
        operation: Operation type ('create', 'read', 'update', 'delete')

    Returns:
        A FastAPI Depends-compatible callable
    """
    checker = PermissionChecker(collection_name, permissions, operation)
    return checker


def requires_owner(user: dict, item: Any, owner_field: str = "user_id") -> None:
    """Check if the current user owns the item.

    Args:
        user: Current user dict
        item: Database item
        owner_field: Name of the field containing the owner ID

    Raises:
        HTTPException 403 if the user doesn't own the item
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    # Admin can access anything
    if user.get("role") == "admin":
        return

    item_owner = getattr(item, owner_field, None)
    user_id = user.get("id")

    if item_owner != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource",
        )
