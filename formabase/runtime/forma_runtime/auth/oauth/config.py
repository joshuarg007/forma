"""OAuth configuration."""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class OAuthProviderConfig:
    """Configuration for an OAuth provider."""

    client_id: str
    client_secret: str
    redirect_uri: str
    scopes: list[str]
    enabled: bool = True


@dataclass
class OAuthConfig:
    """OAuth configuration for all providers."""

    google: Optional[OAuthProviderConfig] = None
    github: Optional[OAuthProviderConfig] = None
    linkedin: Optional[OAuthProviderConfig] = None
    twitter: Optional[OAuthProviderConfig] = None

    # Frontend URL for redirects after OAuth
    frontend_url: str = "http://localhost:3000"

    # Route prefix for OAuth endpoints
    route_prefix: str = "/auth/oauth"

    @classmethod
    def from_env(cls, frontend_url: str = None) -> "OAuthConfig":
        """
        Load OAuth configuration from environment variables.

        Environment variables:
            OAUTH_FRONTEND_URL: Frontend URL for redirects

            GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
            GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI
            LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI
            TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_REDIRECT_URI
        """
        config = cls()

        config.frontend_url = frontend_url or os.getenv(
            "OAUTH_FRONTEND_URL",
            os.getenv("FRONTEND_URL", "http://localhost:3000")
        )

        # Google
        if os.getenv("GOOGLE_CLIENT_ID"):
            config.google = OAuthProviderConfig(
                client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
                redirect_uri=os.getenv("GOOGLE_REDIRECT_URI", ""),
                scopes=["openid", "email", "profile"],
            )

        # GitHub
        if os.getenv("GITHUB_CLIENT_ID"):
            config.github = OAuthProviderConfig(
                client_id=os.getenv("GITHUB_CLIENT_ID", ""),
                client_secret=os.getenv("GITHUB_CLIENT_SECRET", ""),
                redirect_uri=os.getenv("GITHUB_REDIRECT_URI", ""),
                scopes=["read:user", "user:email"],
            )

        # LinkedIn
        if os.getenv("LINKEDIN_CLIENT_ID"):
            config.linkedin = OAuthProviderConfig(
                client_id=os.getenv("LINKEDIN_CLIENT_ID", ""),
                client_secret=os.getenv("LINKEDIN_CLIENT_SECRET", ""),
                redirect_uri=os.getenv("LINKEDIN_REDIRECT_URI", ""),
                scopes=["openid", "profile", "email"],
            )

        # Twitter/X
        if os.getenv("TWITTER_CLIENT_ID"):
            config.twitter = OAuthProviderConfig(
                client_id=os.getenv("TWITTER_CLIENT_ID", ""),
                client_secret=os.getenv("TWITTER_CLIENT_SECRET", ""),
                redirect_uri=os.getenv("TWITTER_REDIRECT_URI", ""),
                scopes=["tweet.read", "users.read", "offline.access"],
            )

        return config

    def get_enabled_providers(self) -> list[str]:
        """Get list of enabled provider names."""
        providers = []
        if self.google and self.google.enabled:
            providers.append("google")
        if self.github and self.github.enabled:
            providers.append("github")
        if self.linkedin and self.linkedin.enabled:
            providers.append("linkedin")
        if self.twitter and self.twitter.enabled:
            providers.append("twitter")
        return providers

    def get_provider(self, name: str) -> Optional[OAuthProviderConfig]:
        """Get provider config by name."""
        return getattr(self, name, None)
