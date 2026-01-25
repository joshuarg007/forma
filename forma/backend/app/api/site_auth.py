"""Site Auth API - Authentication for deployed sites"""
import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project, SiteUser, SiteSession


router = APIRouter(prefix="/api/site-auth", tags=["site-auth"])

# Token settings
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 30


# =============================================================================
# SCHEMAS
# =============================================================================

class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    """User profile response."""
    id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    created_at: str


class UpdateProfileRequest(BaseModel):
    """Update user profile."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    custom_data: Optional[dict] = None


class ChangePasswordRequest(BaseModel):
    """Change password request."""
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request."""
    token: str
    new_password: str


# =============================================================================
# HELPERS
# =============================================================================

def hash_password(password: str) -> str:
    """Hash a password."""
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def create_session(
    db: Session,
    user: SiteUser,
    request: Request
) -> SiteSession:
    """Create a new session for a user."""
    now = datetime.utcnow()

    session = SiteSession(
        user_id=user.id,
        token=generate_token(),
        refresh_token=generate_token(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        refresh_expires_at=now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    db.add(session)

    # Update user stats
    user.last_login_at = now
    user.login_count = (user.login_count or 0) + 1

    db.commit()
    db.refresh(session)

    return session


def get_session_from_token(
    db: Session,
    token: str
) -> Optional[SiteSession]:
    """Get valid session from access token."""
    session = db.query(SiteSession).filter(
        SiteSession.token == token,
        SiteSession.is_revoked == False,
        SiteSession.expires_at > datetime.utcnow()
    ).first()

    if session:
        session.last_used_at = datetime.utcnow()
        db.commit()

    return session


def user_to_dict(user: SiteUser) -> dict:
    """Convert user to dictionary."""
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat()
    }


# =============================================================================
# AUTH ENDPOINTS
# =============================================================================

@router.post("/{project_id}/register", response_model=TokenResponse)
async def register(
    project_id: UUID,
    data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new user for a deployed site."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    # Check if email already exists for this project
    existing = db.query(SiteUser).filter(
        SiteUser.project_id == project_id,
        SiteUser.email == data.email.lower()
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    # Create user
    user = SiteUser(
        project_id=project_id,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        name=data.name
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create session
    session = create_session(db, user, request)

    return TokenResponse(
        access_token=session.token,
        refresh_token=session.refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=user_to_dict(user)
    )


@router.post("/{project_id}/login", response_model=TokenResponse)
async def login(
    project_id: UUID,
    data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Login to a deployed site."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    # Find user
    user = db.query(SiteUser).filter(
        SiteUser.project_id == project_id,
        SiteUser.email == data.email.lower()
    ).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is disabled")

    # Create session
    session = create_session(db, user, request)

    return TokenResponse(
        access_token=session.token,
        refresh_token=session.refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=user_to_dict(user)
    )


@router.post("/{project_id}/logout")
async def logout(
    project_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Logout from a deployed site."""
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"success": True}  # Already logged out

    token = auth_header.split(" ")[1]

    # Revoke session
    session = db.query(SiteSession).filter(SiteSession.token == token).first()
    if session:
        session.is_revoked = True
        session.revoked_at = datetime.utcnow()
        db.commit()

    return {"success": True}


@router.post("/{project_id}/refresh", response_model=TokenResponse)
async def refresh_token(
    project_id: UUID,
    refresh_token: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Refresh access token."""
    # Find session by refresh token
    session = db.query(SiteSession).filter(
        SiteSession.refresh_token == refresh_token,
        SiteSession.is_revoked == False,
        SiteSession.refresh_expires_at > datetime.utcnow()
    ).first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = session.user
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is disabled")

    # Revoke old session
    session.is_revoked = True
    session.revoked_at = datetime.utcnow()

    # Create new session
    new_session = create_session(db, user, request)

    return TokenResponse(
        access_token=new_session.token,
        refresh_token=new_session.refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=user_to_dict(user)
    )


@router.get("/{project_id}/me", response_model=UserResponse)
async def get_current_user(
    project_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user profile."""
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    session = get_session_from_token(db, token)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = session.user
    if str(user.project_id) != str(project_id):
        raise HTTPException(status_code=401, detail="Invalid token for this site")

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat()
    )


@router.put("/{project_id}/me")
async def update_profile(
    project_id: UUID,
    data: UpdateProfileRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    session = get_session_from_token(db, token)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = session.user
    if str(user.project_id) != str(project_id):
        raise HTTPException(status_code=401, detail="Invalid token for this site")

    # Update fields
    if data.name is not None:
        user.name = data.name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    if data.phone is not None:
        user.phone = data.phone
    if data.custom_data is not None:
        user.custom_data = {**(user.custom_data or {}), **data.custom_data}

    db.commit()

    return {"success": True, "user": user_to_dict(user)}


@router.post("/{project_id}/change-password")
async def change_password(
    project_id: UUID,
    data: ChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Change user password."""
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    session = get_session_from_token(db, token)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = session.user

    # Verify current password
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Validate new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    # Update password
    user.password_hash = hash_password(data.new_password)

    # Revoke all other sessions
    db.query(SiteSession).filter(
        SiteSession.user_id == user.id,
        SiteSession.id != session.id
    ).update({"is_revoked": True, "revoked_at": datetime.utcnow()})

    db.commit()

    return {"success": True}


@router.post("/{project_id}/forgot-password")
async def forgot_password(
    project_id: UUID,
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Request password reset."""
    # Find user
    user = db.query(SiteUser).filter(
        SiteUser.project_id == project_id,
        SiteUser.email == data.email.lower()
    ).first()

    # Always return success to prevent email enumeration
    if user:
        # Generate reset token
        user.reset_token = generate_token()
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()

        # TODO: Send email with reset link
        # The reset link would be: {site_url}/reset-password?token={user.reset_token}

    return {"success": True, "message": "If that email exists, a reset link has been sent"}


@router.post("/{project_id}/reset-password")
async def reset_password(
    project_id: UUID,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password with token."""
    # Find user by reset token
    user = db.query(SiteUser).filter(
        SiteUser.project_id == project_id,
        SiteUser.reset_token == data.token,
        SiteUser.reset_token_expires > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Validate new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    # Update password
    user.password_hash = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None

    # Revoke all sessions
    db.query(SiteSession).filter(
        SiteSession.user_id == user.id
    ).update({"is_revoked": True, "revoked_at": datetime.utcnow()})

    db.commit()

    return {"success": True, "message": "Password reset successful"}


# =============================================================================
# ADMIN ENDPOINTS (For project owners)
# =============================================================================

@router.get("/{project_id}/users")
async def list_site_users(
    project_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    # Note: In production, add authentication for project owner
):
    """List all users for a deployed site (admin only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    total = db.query(SiteUser).filter(SiteUser.project_id == project_id).count()

    users = db.query(SiteUser).filter(
        SiteUser.project_id == project_id
    ).order_by(SiteUser.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "login_count": u.login_count,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ],
        "total": total
    }
