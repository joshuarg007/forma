"""Admin UI module for Formabase Runtime."""

from .router import create_admin_router, create_multitenant_admin_router

__all__ = ["create_admin_router", "create_multitenant_admin_router"]
