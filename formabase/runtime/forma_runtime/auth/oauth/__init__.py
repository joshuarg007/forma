"""OAuth authentication module for Forma Runtime.

This module provides OAuth 2.0 authentication for:
- Google
- GitHub
- LinkedIn
- Twitter/X (with PKCE S256)

Usage:
    from forma_runtime.auth.oauth import OAuthConfig, create_oauth_router

    # Load config from environment variables
    oauth_config = OAuthConfig.from_env()

    # Or configure manually
    oauth_config = OAuthConfig(
        google=OAuthProviderConfig(
            client_id="...",
            client_secret="...",
            redirect_uri="https://example.com/auth/oauth/google/callback",
            scopes=["openid", "email", "profile"],
        ),
        frontend_url="https://example.com",
    )

    # Create router and add to app
    oauth_router = create_oauth_router(app.state, oauth_config)
    app.include_router(oauth_router)

Environment Variables:
    OAUTH_FRONTEND_URL: Frontend URL for redirects after OAuth

    GOOGLE_CLIENT_ID: Google OAuth client ID
    GOOGLE_CLIENT_SECRET: Google OAuth client secret
    GOOGLE_REDIRECT_URI: Google OAuth callback URL

    GITHUB_CLIENT_ID: GitHub OAuth client ID
    GITHUB_CLIENT_SECRET: GitHub OAuth client secret
    GITHUB_REDIRECT_URI: GitHub OAuth callback URL

    LINKEDIN_CLIENT_ID: LinkedIn OAuth client ID
    LINKEDIN_CLIENT_SECRET: LinkedIn OAuth client secret
    LINKEDIN_REDIRECT_URI: LinkedIn OAuth callback URL

    TWITTER_CLIENT_ID: Twitter/X OAuth 2.0 client ID
    TWITTER_CLIENT_SECRET: Twitter/X OAuth 2.0 client secret
    TWITTER_REDIRECT_URI: Twitter/X OAuth callback URL

Required User Model Fields:
    email: str - User's email address (required)

Optional User Model Fields:
    name: str - User's display name
    avatar_url: str - Profile picture URL
    oauth_provider: str - Primary OAuth provider name
    oauth_provider_id: str - Primary OAuth provider user ID
    google_id: str - Google user ID (for multi-provider support)
    github_id: str - GitHub user ID
    linkedin_id: str - LinkedIn user ID
    twitter_id: str - Twitter user ID
    email_verified: bool - Whether email is verified
    role: str - User role for authorization
"""

from .config import OAuthConfig, OAuthProviderConfig
from .providers import (
    PROVIDERS,
    GitHubProvider,
    GoogleProvider,
    LinkedInProvider,
    OAuthProvider,
    OAuthUserInfo,
    TwitterProvider,
    get_provider,
)
from .routes import create_oauth_router, cleanup_expired_states

__all__ = [
    # Config
    "OAuthConfig",
    "OAuthProviderConfig",
    # Providers
    "OAuthProvider",
    "OAuthUserInfo",
    "GoogleProvider",
    "GitHubProvider",
    "LinkedInProvider",
    "TwitterProvider",
    "PROVIDERS",
    "get_provider",
    # Routes
    "create_oauth_router",
    "cleanup_expired_states",
]
