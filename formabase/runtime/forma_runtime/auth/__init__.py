"""Authentication module for Forma Runtime."""

from .dependencies import get_current_user, get_current_user_optional, require_roles
from .jwt import (
    TokenError,
    create_access_token,
    create_refresh_token,
    create_token_pair,
    decode_token,
    verify_access_token,
    verify_refresh_token,
)
from .password import hash_password, verify_password
from .routes import create_auth_router

# OAuth module
from .oauth import (
    OAuthConfig,
    OAuthProviderConfig,
    create_oauth_router,
    cleanup_expired_states,
)

__all__ = [
    # Core auth
    "TokenError",
    "create_access_token",
    "create_auth_router",
    "create_refresh_token",
    "create_token_pair",
    "decode_token",
    "get_current_user",
    "get_current_user_optional",
    "hash_password",
    "require_roles",
    "verify_access_token",
    "verify_password",
    "verify_refresh_token",
    # OAuth
    "OAuthConfig",
    "OAuthProviderConfig",
    "create_oauth_router",
    "cleanup_expired_states",
]
