"""JWT token handling."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from ..config import settings


class TokenError(Exception):
    """Raised when token validation fails."""

    pass


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({
        "exp": expire,
        "type": "access",
    })

    return jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT refresh token.

    Args:
        data: Data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )

    to_encode.update({
        "exp": expire,
        "type": "refresh",
    })

    return jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: The JWT token string

    Returns:
        Decoded token payload

    Raises:
        TokenError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError as e:
        raise TokenError(f"Invalid token: {e}")


def verify_access_token(token: str) -> dict[str, Any]:
    """
    Verify an access token.

    Args:
        token: The JWT token string

    Returns:
        Decoded token payload

    Raises:
        TokenError: If token is invalid, expired, or not an access token
    """
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise TokenError("Not an access token")

    return payload


def verify_refresh_token(token: str) -> dict[str, Any]:
    """
    Verify a refresh token.

    Args:
        token: The JWT token string

    Returns:
        Decoded token payload

    Raises:
        TokenError: If token is invalid, expired, or not a refresh token
    """
    payload = decode_token(token)

    if payload.get("type") != "refresh":
        raise TokenError("Not a refresh token")

    return payload


def create_token_pair(user_id: int, email: str, role: str | None = None) -> dict[str, str]:
    """
    Create both access and refresh tokens for a user.

    Args:
        user_id: User's ID
        email: User's email
        role: Optional user role

    Returns:
        Dictionary with 'access_token' and 'refresh_token'
    """
    data = {
        "sub": str(user_id),
        "email": email,
    }
    if role:
        data["role"] = role

    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "token_type": "bearer",
    }
