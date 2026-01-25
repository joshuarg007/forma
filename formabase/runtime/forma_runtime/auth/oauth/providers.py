"""OAuth provider implementations."""

import base64
import hashlib
import secrets
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Optional
from urllib.parse import urlencode

import httpx

from .config import OAuthProviderConfig


@dataclass
class OAuthUserInfo:
    """Normalized user info from OAuth provider."""

    provider: str
    provider_user_id: str
    email: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    raw_data: Optional[dict] = None


class OAuthProvider(ABC):
    """Base class for OAuth providers."""

    name: str = ""
    authorize_url: str = ""
    token_url: str = ""
    userinfo_url: str = ""

    def __init__(self, config: OAuthProviderConfig):
        self.config = config

    @abstractmethod
    def get_authorize_url(self, state: str, **kwargs) -> str:
        """Build the authorization URL."""
        pass

    @abstractmethod
    async def exchange_code(self, code: str, **kwargs) -> dict:
        """Exchange authorization code for tokens."""
        pass

    @abstractmethod
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        """Get user info from provider."""
        pass


class GoogleProvider(OAuthProvider):
    """Google OAuth 2.0 provider."""

    name = "google"
    authorize_url = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url = "https://oauth2.googleapis.com/token"
    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"

    def get_authorize_url(self, state: str, **kwargs) -> str:
        params = {
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.config.scopes),
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_code(self, code: str, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                data={
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.config.redirect_uri,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            data = response.json()

        return OAuthUserInfo(
            provider=self.name,
            provider_user_id=data.get("id"),
            email=data.get("email"),
            name=data.get("name"),
            avatar_url=data.get("picture"),
            access_token=access_token,
            raw_data=data,
        )


class GitHubProvider(OAuthProvider):
    """GitHub OAuth provider."""

    name = "github"
    authorize_url = "https://github.com/login/oauth/authorize"
    token_url = "https://github.com/login/oauth/access_token"
    userinfo_url = "https://api.github.com/user"
    emails_url = "https://api.github.com/user/emails"

    def get_authorize_url(self, state: str, **kwargs) -> str:
        params = {
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "scope": " ".join(self.config.scopes),
            "state": state,
        }
        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_code(self, code: str, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                headers={"Accept": "application/json"},
                data={
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                    "code": code,
                    "redirect_uri": self.config.redirect_uri,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        async with httpx.AsyncClient() as client:
            # Get user info
            response = await client.get(
                self.userinfo_url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            response.raise_for_status()
            data = response.json()

            # Get email if not in user data
            email = data.get("email")
            if not email:
                email_response = await client.get(
                    self.emails_url,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github.v3+json",
                    },
                )
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary = next(
                        (e for e in emails if e.get("primary") and e.get("verified")),
                        None,
                    )
                    if primary:
                        email = primary["email"]

        return OAuthUserInfo(
            provider=self.name,
            provider_user_id=str(data.get("id")),
            email=email,
            name=data.get("name") or data.get("login"),
            avatar_url=data.get("avatar_url"),
            access_token=access_token,
            raw_data=data,
        )


class LinkedInProvider(OAuthProvider):
    """LinkedIn OAuth 2.0 provider with OpenID Connect."""

    name = "linkedin"
    authorize_url = "https://www.linkedin.com/oauth/v2/authorization"
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    userinfo_url = "https://api.linkedin.com/v2/userinfo"

    def get_authorize_url(self, state: str, **kwargs) -> str:
        params = {
            "response_type": "code",
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "state": state,
            "scope": " ".join(self.config.scopes),
        }
        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_code(self, code: str, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                    "redirect_uri": self.config.redirect_uri,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            data = response.json()

        return OAuthUserInfo(
            provider=self.name,
            provider_user_id=data.get("sub"),
            email=data.get("email"),
            name=data.get("name"),
            avatar_url=data.get("picture"),
            access_token=access_token,
            raw_data=data,
        )


class TwitterProvider(OAuthProvider):
    """Twitter/X OAuth 2.0 provider with PKCE (S256)."""

    name = "twitter"
    authorize_url = "https://twitter.com/i/oauth2/authorize"
    token_url = "https://api.twitter.com/2/oauth2/token"
    userinfo_url = "https://api.twitter.com/2/users/me"

    @staticmethod
    def generate_pkce_pair() -> tuple[str, str]:
        """Generate PKCE code_verifier and code_challenge (S256)."""
        code_verifier = secrets.token_urlsafe(32)  # 43 chars
        digest = hashlib.sha256(code_verifier.encode()).digest()
        code_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
        return code_verifier, code_challenge

    def get_authorize_url(self, state: str, code_challenge: str = None, **kwargs) -> str:
        """
        Build authorization URL.

        Args:
            state: State token for CSRF protection
            code_challenge: PKCE code challenge (S256 hashed)
        """
        if not code_challenge:
            raise ValueError("code_challenge required for Twitter PKCE")

        params = {
            "response_type": "code",
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "scope": " ".join(self.config.scopes),
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_code(self, code: str, code_verifier: str = None, **kwargs) -> dict:
        """
        Exchange code for tokens.

        Args:
            code: Authorization code
            code_verifier: PKCE code verifier (original, unhashed)
        """
        if not code_verifier:
            raise ValueError("code_verifier required for Twitter PKCE")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                data={
                    "code": code,
                    "grant_type": "authorization_code",
                    "client_id": self.config.client_id,
                    "redirect_uri": self.config.redirect_uri,
                    "code_verifier": code_verifier,
                },
                auth=(self.config.client_id, self.config.client_secret),
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
                params={"user.fields": "profile_image_url"},
            )
            response.raise_for_status()
            data = response.json().get("data", {})

        # Twitter doesn't provide email without elevated access
        return OAuthUserInfo(
            provider=self.name,
            provider_user_id=data.get("id"),
            email=None,
            name=data.get("name") or data.get("username"),
            avatar_url=data.get("profile_image_url"),
            access_token=access_token,
            raw_data=data,
        )


# Provider registry
PROVIDERS: dict[str, type[OAuthProvider]] = {
    "google": GoogleProvider,
    "github": GitHubProvider,
    "linkedin": LinkedInProvider,
    "twitter": TwitterProvider,
}


def get_provider(name: str, config: OAuthProviderConfig) -> OAuthProvider:
    """Get provider instance by name."""
    provider_class = PROVIDERS.get(name)
    if not provider_class:
        raise ValueError(f"Unknown OAuth provider: {name}")
    return provider_class(config)
