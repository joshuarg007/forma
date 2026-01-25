"""OAuth routes for authentication."""

import secrets
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import CRUDBase, get_session
from ..jwt import create_token_pair
from ..password import hash_password
from .config import OAuthConfig
from .providers import OAuthUserInfo, TwitterProvider, get_provider


# In-memory state storage (use Redis in production)
oauth_states: dict[str, dict] = {}

# Pending OAuth data for account linking
pending_oauth: dict[str, dict] = {}


class LinkAccountRequest(BaseModel):
    """Request to link OAuth to existing account."""

    token: str
    email: EmailStr
    password: str


class CreateFromOAuthRequest(BaseModel):
    """Request to create account from OAuth."""

    token: str


def generate_state() -> str:
    """Generate secure state token."""
    return secrets.token_urlsafe(32)


def store_pending_oauth(user_info: OAuthUserInfo, tokens: dict) -> str:
    """Store pending OAuth data and return retrieval token."""
    token = secrets.token_urlsafe(32)
    pending_oauth[token] = {
        "provider": user_info.provider,
        "provider_user_id": user_info.provider_user_id,
        "email": user_info.email,
        "name": user_info.name,
        "avatar_url": user_info.avatar_url,
        "access_token": user_info.access_token,
        "refresh_token": tokens.get("refresh_token"),
        "expires_in": tokens.get("expires_in"),
        "created_at": datetime.utcnow(),
    }
    return token


def create_oauth_router(app_state: Any, config: OAuthConfig) -> APIRouter:
    """
    Create OAuth router with configured providers.

    Args:
        app_state: FastAPI app state containing schema and models
        config: OAuth configuration

    Returns:
        Configured OAuth router
    """
    router = APIRouter(prefix=config.route_prefix, tags=["OAuth"])

    # ============ PROVIDER STATUS ============

    @router.get("/providers")
    async def list_providers() -> dict[str, Any]:
        """List enabled OAuth providers."""
        return {
            "providers": config.get_enabled_providers(),
        }

    # ============ GOOGLE ============

    if config.google:

        @router.get("/google/login")
        async def google_login() -> dict[str, str]:
            """Get Google OAuth login URL."""
            provider = get_provider("google", config.google)
            state = generate_state()
            oauth_states[state] = {
                "provider": "google",
                "created_at": datetime.utcnow(),
            }
            return {"url": provider.get_authorize_url(state)}

        @router.get("/google/callback")
        async def google_callback(
            request: Request,
            response: Response,
            code: Optional[str] = None,
            state: Optional[str] = None,
            error: Optional[str] = None,
            session: AsyncSession = Depends(get_session),
        ):
            """Handle Google OAuth callback."""
            return await handle_oauth_callback(
                request, response, session, config,
                provider_name="google",
                code=code, state=state, error=error,
            )

    # ============ GITHUB ============

    if config.github:

        @router.get("/github/login")
        async def github_login() -> dict[str, str]:
            """Get GitHub OAuth login URL."""
            provider = get_provider("github", config.github)
            state = generate_state()
            oauth_states[state] = {
                "provider": "github",
                "created_at": datetime.utcnow(),
            }
            return {"url": provider.get_authorize_url(state)}

        @router.get("/github/callback")
        async def github_callback(
            request: Request,
            response: Response,
            code: Optional[str] = None,
            state: Optional[str] = None,
            error: Optional[str] = None,
            session: AsyncSession = Depends(get_session),
        ):
            """Handle GitHub OAuth callback."""
            return await handle_oauth_callback(
                request, response, session, config,
                provider_name="github",
                code=code, state=state, error=error,
            )

    # ============ LINKEDIN ============

    if config.linkedin:

        @router.get("/linkedin/login")
        async def linkedin_login() -> dict[str, str]:
            """Get LinkedIn OAuth login URL."""
            provider = get_provider("linkedin", config.linkedin)
            state = generate_state()
            oauth_states[state] = {
                "provider": "linkedin",
                "created_at": datetime.utcnow(),
            }
            return {"url": provider.get_authorize_url(state)}

        @router.get("/linkedin/callback")
        async def linkedin_callback(
            request: Request,
            response: Response,
            code: Optional[str] = None,
            state: Optional[str] = None,
            error: Optional[str] = None,
            session: AsyncSession = Depends(get_session),
        ):
            """Handle LinkedIn OAuth callback."""
            return await handle_oauth_callback(
                request, response, session, config,
                provider_name="linkedin",
                code=code, state=state, error=error,
            )

    # ============ TWITTER/X ============

    if config.twitter:

        @router.get("/twitter/login")
        async def twitter_login() -> dict[str, str]:
            """Get Twitter/X OAuth login URL with PKCE."""
            provider = get_provider("twitter", config.twitter)
            state = generate_state()
            code_verifier, code_challenge = TwitterProvider.generate_pkce_pair()

            oauth_states[state] = {
                "provider": "twitter",
                "created_at": datetime.utcnow(),
                "code_verifier": code_verifier,
            }

            url = provider.get_authorize_url(state, code_challenge=code_challenge)
            return {"url": url}

        @router.get("/twitter/callback")
        async def twitter_callback(
            request: Request,
            response: Response,
            code: Optional[str] = None,
            state: Optional[str] = None,
            error: Optional[str] = None,
            session: AsyncSession = Depends(get_session),
        ):
            """Handle Twitter/X OAuth callback."""
            return await handle_oauth_callback(
                request, response, session, config,
                provider_name="twitter",
                code=code, state=state, error=error,
            )

    # ============ ACCOUNT LINKING ============

    @router.get("/pending/{token}")
    async def get_pending_oauth(token: str) -> dict[str, Any]:
        """Get pending OAuth info for account linking UI."""
        if token not in pending_oauth:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth not found or expired",
            )

        data = pending_oauth[token]

        # Check expiration (10 minutes)
        if (datetime.utcnow() - data["created_at"]).total_seconds() > 600:
            del pending_oauth[token]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth expired",
            )

        return {
            "provider": data["provider"],
            "email": data["email"],
            "name": data["name"],
            "avatar_url": data["avatar_url"],
        }

    @router.post("/link")
    async def link_oauth_to_account(
        request: Request,
        data: LinkAccountRequest,
        response: Response,
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, Any]:
        """Link pending OAuth to existing account with password verification."""
        if data.token not in pending_oauth:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth not found or expired",
            )

        oauth_data = pending_oauth[data.token]

        # Check expiration
        if (datetime.utcnow() - oauth_data["created_at"]).total_seconds() > 600:
            del pending_oauth[data.token]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth expired",
            )

        # Get auth model
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

        # Find and verify user
        from ..password import verify_password

        query = select(model).where(model.email == data.email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not hasattr(user, "password_hash") or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account uses OAuth only",
            )

        if not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Link OAuth provider
        provider = oauth_data["provider"]
        if hasattr(model, "oauth_provider") and not user.oauth_provider:
            user.oauth_provider = provider
        if hasattr(model, "oauth_provider_id"):
            setattr(user, f"oauth_provider_id", oauth_data["provider_user_id"])
        if hasattr(model, f"{provider}_id"):
            setattr(user, f"{provider}_id", oauth_data["provider_user_id"])
        if hasattr(model, "avatar_url") and not user.avatar_url and oauth_data.get("avatar_url"):
            user.avatar_url = oauth_data["avatar_url"]

        await session.commit()

        # Clean up
        del pending_oauth[data.token]

        # Create tokens
        role = getattr(user, "role", None)
        tokens = create_token_pair(user.id, user.email, role)

        return {
            "ok": True,
            "message": f"{provider.title()} account linked successfully",
            **tokens,
        }

    @router.post("/create")
    async def create_from_oauth(
        request: Request,
        data: CreateFromOAuthRequest,
        response: Response,
        session: AsyncSession = Depends(get_session),
    ) -> dict[str, Any]:
        """Create new account from pending OAuth data."""
        if data.token not in pending_oauth:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth not found or expired",
            )

        oauth_data = pending_oauth[data.token]

        # Check expiration
        if (datetime.utcnow() - oauth_data["created_at"]).total_seconds() > 600:
            del pending_oauth[data.token]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending OAuth expired",
            )

        # Get auth model
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

        provider = oauth_data["provider"]
        email = oauth_data.get("email")

        # Generate placeholder email if not provided (Twitter)
        if not email:
            email = f"{oauth_data['provider_user_id']}@{provider}.oauth"

        # Check if email exists
        query = select(model).where(model.email == email)
        result = await session.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists",
            )

        # Create user
        user_data = {
            "email": email,
        }

        if hasattr(model, "name") and oauth_data.get("name"):
            user_data["name"] = oauth_data["name"]
        if hasattr(model, "avatar_url") and oauth_data.get("avatar_url"):
            user_data["avatar_url"] = oauth_data["avatar_url"]
        if hasattr(model, "oauth_provider"):
            user_data["oauth_provider"] = provider
        if hasattr(model, "oauth_provider_id"):
            user_data["oauth_provider_id"] = oauth_data["provider_user_id"]
        if hasattr(model, f"{provider}_id"):
            user_data[f"{provider}_id"] = oauth_data["provider_user_id"]
        if hasattr(model, "email_verified"):
            user_data["email_verified"] = bool(oauth_data.get("email"))

        # Default role
        if hasattr(model, "role"):
            settings = schema.settings
            default_role = "user"
            if settings and settings.auth:
                default_role = settings.auth.default_role
            user_data["role"] = default_role

        crud = CRUDBase(model)
        user = await crud.create(session, user_data)

        # Clean up
        del pending_oauth[data.token]

        # Create tokens
        role = getattr(user, "role", None)
        tokens = create_token_pair(user.id, user.email, role)

        return {
            "ok": True,
            "message": "Account created successfully",
            **tokens,
        }

    return router


async def handle_oauth_callback(
    request: Request,
    response: Response,
    session: AsyncSession,
    config: OAuthConfig,
    provider_name: str,
    code: Optional[str],
    state: Optional[str],
    error: Optional[str],
) -> Response:
    """
    Generic OAuth callback handler.

    Handles the callback from any OAuth provider, exchanges the code for tokens,
    and either logs in an existing user or redirects to account linking.
    """
    frontend_url = config.frontend_url

    # Handle errors/cancellation
    if error:
        return RedirectResponse(f"{frontend_url}/login?error=oauth_cancelled")

    if not code or not state:
        return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")

    # Verify state
    state_data = oauth_states.get(state)
    if not state_data or state_data.get("provider") != provider_name:
        return RedirectResponse(f"{frontend_url}/login?error=invalid_state")

    # Get provider config and instance
    provider_config = config.get_provider(provider_name)
    if not provider_config:
        return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")

    provider = get_provider(provider_name, provider_config)

    try:
        # Exchange code for tokens
        extra_params = {}
        if provider_name == "twitter":
            extra_params["code_verifier"] = state_data.get("code_verifier")

        tokens = await provider.exchange_code(code, **extra_params)
        access_token = tokens.get("access_token")

        if not access_token:
            return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")

        # Get user info
        user_info = await provider.get_user_info(access_token)

        # Update token info
        if tokens.get("refresh_token"):
            user_info.refresh_token = tokens["refresh_token"]
        if tokens.get("expires_in"):
            user_info.token_expires_at = datetime.utcnow() + timedelta(
                seconds=tokens["expires_in"]
            )

    except Exception as e:
        print(f"OAuth error for {provider_name}: {e}")
        return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")
    finally:
        # Clean up state
        oauth_states.pop(state, None)

    # Get auth model
    schema = request.app.state.schema
    auth_collection = schema.get_auth_collection()

    if not auth_collection:
        return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")

    coll_name, _ = auth_collection
    model = request.app.state.models.get(coll_name)

    if not model:
        return RedirectResponse(f"{frontend_url}/login?error=oauth_failed")

    # Try to find existing user
    user = None

    # 1. Check by email (if provided)
    if user_info.email:
        query = select(model).where(model.email == user_info.email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

    # 2. Check by OAuth provider ID
    if not user:
        # Try provider-specific field (e.g., google_id, github_id)
        provider_id_field = f"{provider_name}_id"
        if hasattr(model, provider_id_field):
            query = select(model).where(
                getattr(model, provider_id_field) == user_info.provider_user_id
            )
            result = await session.execute(query)
            user = result.scalar_one_or_none()

        # Try generic oauth_provider fields
        if not user and hasattr(model, "oauth_provider") and hasattr(model, "oauth_provider_id"):
            query = select(model).where(
                model.oauth_provider == provider_name,
                model.oauth_provider_id == user_info.provider_user_id,
            )
            result = await session.execute(query)
            user = result.scalar_one_or_none()

    if user:
        # Existing user - update OAuth info and login
        if hasattr(model, "avatar_url") and not user.avatar_url and user_info.avatar_url:
            user.avatar_url = user_info.avatar_url
        if hasattr(model, f"{provider_name}_id"):
            setattr(user, f"{provider_name}_id", user_info.provider_user_id)

        await session.commit()

        # Create tokens
        role = getattr(user, "role", None)
        token_data = create_token_pair(user.id, user.email, role)

        # Redirect with tokens (frontend should handle)
        return RedirectResponse(
            f"{frontend_url}/auth/callback?"
            f"access_token={token_data['access_token']}&"
            f"refresh_token={token_data['refresh_token']}"
        )

    else:
        # New user - redirect to link/create page
        pending_token = store_pending_oauth(user_info, tokens)
        return RedirectResponse(f"{frontend_url}/link-account?token={pending_token}")


def cleanup_expired_states():
    """Remove expired state tokens and pending OAuth data."""
    now = datetime.utcnow()

    # Clean oauth_states (10 min expiry)
    expired = [
        s for s, d in oauth_states.items()
        if (now - d["created_at"]).total_seconds() > 600
    ]
    for s in expired:
        del oauth_states[s]

    # Clean pending_oauth (10 min expiry)
    expired = [
        t for t, d in pending_oauth.items()
        if (now - d["created_at"]).total_seconds() > 600
    ]
    for t in expired:
        del pending_oauth[t]
