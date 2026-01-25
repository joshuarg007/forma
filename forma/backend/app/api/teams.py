"""Team management API endpoints."""
import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    User, Project, ProjectMember, ProjectInvite,
    ProjectRole, InviteStatus
)
from app.core.security import get_current_user_required as get_current_user

router = APIRouter(prefix="/api/projects/{project_id}/team", tags=["teams"])


# Pydantic schemas
class MemberOut(BaseModel):
    id: str
    user_id: str
    email: str
    name: Optional[str]
    role: str
    can_edit_components: Optional[bool]
    can_delete_components: Optional[bool]
    can_export: Optional[bool]
    can_invite_members: Optional[bool]
    can_manage_settings: Optional[bool]
    joined_at: Optional[datetime]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class InviteCreate(BaseModel):
    email: EmailStr
    role: str = "editor"
    message: Optional[str] = None


class InviteOut(BaseModel):
    id: str
    email: str
    role: str
    status: str
    invited_by_name: Optional[str]
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class UpdateMemberRole(BaseModel):
    role: str
    can_edit_components: Optional[bool] = None
    can_delete_components: Optional[bool] = None
    can_export: Optional[bool] = None
    can_invite_members: Optional[bool] = None
    can_manage_settings: Optional[bool] = None


# Permission helpers
ROLE_PERMISSIONS = {
    ProjectRole.OWNER: {
        "can_edit_components": True,
        "can_delete_components": True,
        "can_export": True,
        "can_invite_members": True,
        "can_manage_settings": True,
    },
    ProjectRole.ADMIN: {
        "can_edit_components": True,
        "can_delete_components": True,
        "can_export": True,
        "can_invite_members": True,
        "can_manage_settings": True,
    },
    ProjectRole.EDITOR: {
        "can_edit_components": True,
        "can_delete_components": True,
        "can_export": True,
        "can_invite_members": False,
        "can_manage_settings": False,
    },
    ProjectRole.VIEWER: {
        "can_edit_components": False,
        "can_delete_components": False,
        "can_export": True,
        "can_invite_members": False,
        "can_manage_settings": False,
    },
}


def get_user_permission(member: ProjectMember, permission: str) -> bool:
    """Get effective permission for a member (custom override or role default)."""
    custom = getattr(member, permission, None)
    if custom is not None:
        return custom
    return ROLE_PERMISSIONS.get(member.role, {}).get(permission, False)


def check_project_access(
    project_id: UUID,
    user: User,
    db: Session,
    required_permission: Optional[str] = None
) -> tuple[Project, Optional[ProjectMember]]:
    """Check if user has access to project and optionally a specific permission."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Owner always has full access
    if project.user_id == user.id:
        return project, None

    # Check membership
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    if required_permission and not get_user_permission(member, required_permission):
        raise HTTPException(status_code=403, detail=f"Permission denied: {required_permission}")

    return project, member


# Endpoints
@router.get("/members", response_model=List[MemberOut])
async def get_project_members(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a project."""
    project, _ = check_project_access(project_id, current_user, db)

    members_out = []

    # Add owner
    owner = project.user
    members_out.append(MemberOut(
        id="owner",
        user_id=str(owner.id),
        email=owner.email,
        name=owner.name,
        role="owner",
        can_edit_components=True,
        can_delete_components=True,
        can_export=True,
        can_invite_members=True,
        can_manage_settings=True,
        joined_at=project.created_at,
        avatar_url=owner.avatar_url
    ))

    # Add members
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    for member in members:
        user = member.user
        members_out.append(MemberOut(
            id=str(member.id),
            user_id=str(user.id),
            email=user.email,
            name=user.name,
            role=member.role.value,
            can_edit_components=get_user_permission(member, "can_edit_components"),
            can_delete_components=get_user_permission(member, "can_delete_components"),
            can_export=get_user_permission(member, "can_export"),
            can_invite_members=get_user_permission(member, "can_invite_members"),
            can_manage_settings=get_user_permission(member, "can_manage_settings"),
            joined_at=member.joined_at,
            avatar_url=user.avatar_url
        ))

    return members_out


@router.post("/invite", response_model=InviteOut)
async def invite_member(
    project_id: UUID,
    invite_data: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invite a new member to the project."""
    project, member = check_project_access(
        project_id, current_user, db, "can_invite_members"
    )

    # Check if user is already a member
    existing_user = db.query(User).filter(User.email == invite_data.email).first()
    if existing_user:
        existing_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == existing_user.id
        ).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member")

        # Also check if they're the owner
        if project.user_id == existing_user.id:
            raise HTTPException(status_code=400, detail="User is the project owner")

    # Check for existing pending invite
    existing_invite = db.query(ProjectInvite).filter(
        ProjectInvite.project_id == project_id,
        ProjectInvite.email == invite_data.email,
        ProjectInvite.status == InviteStatus.PENDING
    ).first()
    if existing_invite:
        raise HTTPException(status_code=400, detail="Invite already pending for this email")

    # Parse role
    try:
        role = ProjectRole(invite_data.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Can't invite owners
    if role == ProjectRole.OWNER:
        raise HTTPException(status_code=400, detail="Cannot invite as owner")

    # Create invite
    invite = ProjectInvite(
        project_id=project_id,
        email=invite_data.email,
        role=role,
        invite_token=secrets.token_urlsafe(32),
        invited_by_id=current_user.id,
        message=invite_data.message,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    # Send invitation email
    from app.services.email import email_service
    await email_service.send_invite_email(
        to_email=invite_data.email,
        inviter_name=current_user.name or current_user.email,
        project_name=project.name,
        invite_token=invite.invite_token,
        role=invite.role.value,
        message=invite_data.message
    )

    return InviteOut(
        id=str(invite.id),
        email=invite.email,
        role=invite.role.value,
        status=invite.status.value,
        invited_by_name=current_user.name,
        created_at=invite.created_at,
        expires_at=invite.expires_at
    )


@router.get("/invites", response_model=List[InviteOut])
async def get_pending_invites(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending invites for a project."""
    project, _ = check_project_access(project_id, current_user, db)

    invites = db.query(ProjectInvite).filter(
        ProjectInvite.project_id == project_id,
        ProjectInvite.status == InviteStatus.PENDING
    ).all()

    return [
        InviteOut(
            id=str(inv.id),
            email=inv.email,
            role=inv.role.value,
            status=inv.status.value,
            invited_by_name=inv.invited_by.name if inv.invited_by else None,
            created_at=inv.created_at,
            expires_at=inv.expires_at
        )
        for inv in invites
    ]


@router.delete("/invites/{invite_id}")
async def cancel_invite(
    project_id: UUID,
    invite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a pending invite."""
    project, _ = check_project_access(
        project_id, current_user, db, "can_invite_members"
    )

    invite = db.query(ProjectInvite).filter(
        ProjectInvite.id == invite_id,
        ProjectInvite.project_id == project_id
    ).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    db.delete(invite)
    db.commit()

    return {"success": True}


@router.put("/members/{member_id}", response_model=MemberOut)
async def update_member_role(
    project_id: UUID,
    member_id: UUID,
    update_data: UpdateMemberRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a member's role or permissions."""
    project, _ = check_project_access(
        project_id, current_user, db, "can_manage_settings"
    )

    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Parse role
    try:
        role = ProjectRole(update_data.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Can't make someone owner
    if role == ProjectRole.OWNER:
        raise HTTPException(status_code=400, detail="Cannot assign owner role")

    member.role = role
    if update_data.can_edit_components is not None:
        member.can_edit_components = update_data.can_edit_components
    if update_data.can_delete_components is not None:
        member.can_delete_components = update_data.can_delete_components
    if update_data.can_export is not None:
        member.can_export = update_data.can_export
    if update_data.can_invite_members is not None:
        member.can_invite_members = update_data.can_invite_members
    if update_data.can_manage_settings is not None:
        member.can_manage_settings = update_data.can_manage_settings

    db.commit()
    db.refresh(member)

    user = member.user
    return MemberOut(
        id=str(member.id),
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=member.role.value,
        can_edit_components=get_user_permission(member, "can_edit_components"),
        can_delete_components=get_user_permission(member, "can_delete_components"),
        can_export=get_user_permission(member, "can_export"),
        can_invite_members=get_user_permission(member, "can_invite_members"),
        can_manage_settings=get_user_permission(member, "can_manage_settings"),
        joined_at=member.joined_at,
        avatar_url=user.avatar_url
    )


@router.delete("/members/{member_id}")
async def remove_member(
    project_id: UUID,
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a member from the project."""
    project, _ = check_project_access(
        project_id, current_user, db, "can_manage_settings"
    )

    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()

    return {"success": True}


@router.post("/leave")
async def leave_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave a project (non-owners only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Owner can't leave
    if project.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot leave project")

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Not a member of this project")

    db.delete(member)
    db.commit()

    return {"success": True}


# Accept invite endpoint (global, not project-specific)
accept_router = APIRouter(prefix="/api/invites", tags=["teams"])


@accept_router.post("/accept/{token}")
async def accept_invite(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a project invite."""
    invite = db.query(ProjectInvite).filter(
        ProjectInvite.invite_token == token,
        ProjectInvite.status == InviteStatus.PENDING
    ).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or already used")

    # Check if expired
    if invite.expires_at < datetime.utcnow():
        invite.status = InviteStatus.EXPIRED
        db.commit()
        raise HTTPException(status_code=400, detail="Invite has expired")

    # Check if email matches (or allow any authenticated user)
    # For now, we'll be flexible and allow any authenticated user to accept
    # In production, you might want to verify email matches

    # Check if already a member
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == invite.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this project")

    # Create membership
    member = ProjectMember(
        project_id=invite.project_id,
        user_id=current_user.id,
        role=invite.role,
        invited_by_id=invite.invited_by_id,
        invited_at=invite.created_at,
        joined_at=datetime.utcnow()
    )
    db.add(member)

    # Update invite
    invite.status = InviteStatus.ACCEPTED
    invite.accepted_at = datetime.utcnow()

    db.commit()

    return {
        "success": True,
        "project_id": str(invite.project_id),
        "role": invite.role.value
    }


@accept_router.post("/decline/{token}")
async def decline_invite(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Decline a project invite."""
    invite = db.query(ProjectInvite).filter(
        ProjectInvite.invite_token == token,
        ProjectInvite.status == InviteStatus.PENDING
    ).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or already used")

    invite.status = InviteStatus.DECLINED
    db.commit()

    return {"success": True}
