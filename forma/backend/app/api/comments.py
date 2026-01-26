"""Comments and Collaboration API."""
import re
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, Page, Component, User, ProjectMember,
    Comment, CommentMention, CommentReaction,
    CommentTargetType, CommentStatus, ReactionType
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}", tags=["comments"])


# =============================================================================
# SCHEMAS
# =============================================================================

class CommentCreate(BaseModel):
    target_type: CommentTargetType
    target_id: UUID
    content: str
    canvas_element_id: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    parent_id: Optional[UUID] = None


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: UUID
    target_type: str
    target_id: UUID
    canvas_element_id: Optional[str]
    position_x: Optional[float]
    position_y: Optional[float]
    parent_id: Optional[UUID]
    author_id: UUID
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    content: str
    content_html: Optional[str]
    status: str
    resolved_by_id: Optional[UUID]
    resolved_by_name: Optional[str] = None
    resolved_at: Optional[datetime]
    is_edited: bool
    reply_count: int = 0
    reactions: dict = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentThread(BaseModel):
    comment: CommentResponse
    replies: List[CommentResponse]


class ReactionRequest(BaseModel):
    reaction_type: ReactionType


class MentionNotification(BaseModel):
    id: UUID
    comment_id: UUID
    comment_content: str
    author_name: str
    target_type: str
    target_id: UUID
    read: bool
    created_at: datetime


# =============================================================================
# HELPERS
# =============================================================================

def get_project_access(project_id: UUID, user: User, db: Session) -> Project:
    """Get project with access check."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Owner has access
    if project.user_id == user.id:
        return project

    # Check team membership
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()

    if membership:
        return project

    raise HTTPException(status_code=403, detail="Access denied")


def parse_mentions(content: str) -> List[str]:
    """Extract @mentions from content."""
    pattern = r'@(\w+(?:\.\w+)?)'
    return re.findall(pattern, content)


def render_content_html(content: str, mentions_map: dict) -> str:
    """Render content with clickable mentions."""
    def replace_mention(match):
        username = match.group(1)
        if username in mentions_map:
            user_id = mentions_map[username]
            return f'<span class="mention" data-user-id="{user_id}">@{username}</span>'
        return match.group(0)

    pattern = r'@(\w+(?:\.\w+)?)'
    return re.sub(pattern, replace_mention, content)


def enrich_comment(comment: Comment, db: Session) -> CommentResponse:
    """Enrich comment with author info and reactions."""
    # Count replies
    reply_count = db.query(Comment).filter(Comment.parent_id == comment.id).count()

    # Aggregate reactions
    reactions = {}
    for reaction in comment.reactions:
        rt = reaction.reaction_type.value
        if rt not in reactions:
            reactions[rt] = {"count": 0, "users": []}
        reactions[rt]["count"] += 1
        reactions[rt]["users"].append(str(reaction.user_id))

    return CommentResponse(
        id=comment.id,
        target_type=comment.target_type.value,
        target_id=comment.target_id,
        canvas_element_id=comment.canvas_element_id,
        position_x=comment.position_x,
        position_y=comment.position_y,
        parent_id=comment.parent_id,
        author_id=comment.author_id,
        author_name=comment.author.name or comment.author.email if comment.author else None,
        author_avatar=comment.author.avatar_url if comment.author else None,
        content=comment.content,
        content_html=comment.content_html,
        status=comment.status.value,
        resolved_by_id=comment.resolved_by_id,
        resolved_by_name=comment.resolved_by.name if comment.resolved_by else None,
        resolved_at=comment.resolved_at,
        is_edited=comment.is_edited,
        reply_count=reply_count,
        reactions=reactions,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


# =============================================================================
# COMMENT ENDPOINTS
# =============================================================================

@router.post("/comments", response_model=CommentResponse)
async def create_comment(
    project_id: UUID,
    request: CommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a new comment."""
    project = get_project_access(project_id, user, db)

    # Validate target exists
    if request.target_type == CommentTargetType.PAGE:
        target = db.query(Page).filter(
            Page.id == request.target_id,
            Page.project_id == project.id
        ).first()
        if not target:
            raise HTTPException(status_code=404, detail="Page not found")

    elif request.target_type == CommentTargetType.COMPONENT:
        target = db.query(Component).filter(
            Component.id == request.target_id,
            Component.project_id == project.id
        ).first()
        if not target:
            raise HTTPException(status_code=404, detail="Component not found")

    elif request.target_type == CommentTargetType.PROJECT:
        if request.target_id != project.id:
            raise HTTPException(status_code=400, detail="Invalid project target")

    # Validate parent comment
    if request.parent_id:
        parent = db.query(Comment).filter(
            Comment.id == request.parent_id,
            Comment.project_id == project.id
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    # Parse @mentions
    mentioned_usernames = parse_mentions(request.content)

    # Find mentioned users (by username or email prefix)
    mentions_map = {}
    for username in mentioned_usernames:
        # Check project members
        mentioned_user = db.query(User).filter(
            or_(
                User.username == username,
                User.email.like(f"{username}@%")
            )
        ).first()
        if mentioned_user:
            mentions_map[username] = str(mentioned_user.id)

    # Render HTML with mentions
    content_html = render_content_html(request.content, mentions_map)

    # Create comment
    comment = Comment(
        project_id=project.id,
        target_type=request.target_type,
        target_id=request.target_id,
        canvas_element_id=request.canvas_element_id,
        position_x=request.position_x,
        position_y=request.position_y,
        parent_id=request.parent_id,
        author_id=user.id,
        content=request.content,
        content_html=content_html,
    )

    db.add(comment)
    db.flush()

    # Create mention records
    for username, user_id_str in mentions_map.items():
        mention = CommentMention(
            comment_id=comment.id,
            user_id=UUID(user_id_str),
        )
        db.add(mention)

    db.commit()
    db.refresh(comment)

    return enrich_comment(comment, db)


@router.get("/comments", response_model=List[CommentResponse])
async def list_comments(
    project_id: UUID,
    target_type: Optional[CommentTargetType] = None,
    target_id: Optional[UUID] = None,
    status: Optional[CommentStatus] = None,
    include_replies: bool = False,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List comments for a project or specific target."""
    project = get_project_access(project_id, user, db)

    query = db.query(Comment).filter(Comment.project_id == project.id)

    if target_type:
        query = query.filter(Comment.target_type == target_type)
    if target_id:
        query = query.filter(Comment.target_id == target_id)
    if status:
        query = query.filter(Comment.status == status)
    if not include_replies:
        query = query.filter(Comment.parent_id.is_(None))

    comments = query.order_by(desc(Comment.created_at)).offset(offset).limit(limit).all()

    return [enrich_comment(c, db) for c in comments]


@router.get("/comments/{comment_id}", response_model=CommentResponse)
async def get_comment(
    project_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific comment."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return enrich_comment(comment, db)


@router.get("/comments/{comment_id}/thread", response_model=CommentThread)
async def get_comment_thread(
    project_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a comment with all its replies."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    replies = db.query(Comment).filter(
        Comment.parent_id == comment_id
    ).order_by(Comment.created_at).all()

    return CommentThread(
        comment=enrich_comment(comment, db),
        replies=[enrich_comment(r, db) for r in replies]
    )


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    project_id: UUID,
    comment_id: UUID,
    request: CommentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a comment (author only)."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != user.id:
        raise HTTPException(status_code=403, detail="Can only edit your own comments")

    # Parse new mentions
    mentioned_usernames = parse_mentions(request.content)
    mentions_map = {}
    for username in mentioned_usernames:
        mentioned_user = db.query(User).filter(
            or_(
                User.username == username,
                User.email.like(f"{username}@%")
            )
        ).first()
        if mentioned_user:
            mentions_map[username] = str(mentioned_user.id)

    # Update comment
    comment.content = request.content
    comment.content_html = render_content_html(request.content, mentions_map)
    comment.is_edited = True
    comment.edited_at = datetime.utcnow()

    # Update mentions (remove old, add new)
    db.query(CommentMention).filter(CommentMention.comment_id == comment.id).delete()

    for username, user_id_str in mentions_map.items():
        mention = CommentMention(
            comment_id=comment.id,
            user_id=UUID(user_id_str),
        )
        db.add(mention)

    db.commit()
    db.refresh(comment)

    return enrich_comment(comment, db)


@router.delete("/comments/{comment_id}")
async def delete_comment(
    project_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a comment (author or project owner only)."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Only author or project owner can delete
    if comment.author_id != user.id and project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(comment)
    db.commit()

    return {"success": True, "message": "Comment deleted"}


@router.post("/comments/{comment_id}/resolve")
async def resolve_comment(
    project_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark a comment thread as resolved."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id,
        Comment.parent_id.is_(None)  # Only root comments can be resolved
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.status = CommentStatus.RESOLVED
    comment.resolved_by_id = user.id
    comment.resolved_at = datetime.utcnow()

    db.commit()

    return {"success": True, "message": "Comment resolved"}


@router.post("/comments/{comment_id}/reopen")
async def reopen_comment(
    project_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Reopen a resolved comment thread."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.status = CommentStatus.OPEN
    comment.resolved_by_id = None
    comment.resolved_at = None

    db.commit()

    return {"success": True, "message": "Comment reopened"}


# =============================================================================
# REACTIONS
# =============================================================================

@router.post("/comments/{comment_id}/reactions")
async def add_reaction(
    project_id: UUID,
    comment_id: UUID,
    request: ReactionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Add a reaction to a comment."""
    project = get_project_access(project_id, user, db)

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project.id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if user already reacted with this type
    existing = db.query(CommentReaction).filter(
        CommentReaction.comment_id == comment_id,
        CommentReaction.user_id == user.id,
        CommentReaction.reaction_type == request.reaction_type
    ).first()

    if existing:
        # Toggle off - remove reaction
        db.delete(existing)
        db.commit()
        return {"success": True, "action": "removed"}

    # Add new reaction
    reaction = CommentReaction(
        comment_id=comment_id,
        user_id=user.id,
        reaction_type=request.reaction_type,
    )
    db.add(reaction)
    db.commit()

    return {"success": True, "action": "added"}


# =============================================================================
# MENTIONS & NOTIFICATIONS
# =============================================================================

@router.get("/mentions", response_model=List[MentionNotification])
async def get_my_mentions(
    project_id: UUID,
    unread_only: bool = False,
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get mentions for the current user in this project."""
    project = get_project_access(project_id, user, db)

    query = db.query(CommentMention).join(Comment).filter(
        Comment.project_id == project.id,
        CommentMention.user_id == user.id
    )

    if unread_only:
        query = query.filter(CommentMention.read == False)

    mentions = query.order_by(desc(CommentMention.created_at)).limit(limit).all()

    return [
        MentionNotification(
            id=m.id,
            comment_id=m.comment_id,
            comment_content=m.comment.content[:200],
            author_name=m.comment.author.name or m.comment.author.email,
            target_type=m.comment.target_type.value,
            target_id=m.comment.target_id,
            read=m.read,
            created_at=m.created_at,
        )
        for m in mentions
    ]


@router.post("/mentions/{mention_id}/read")
async def mark_mention_read(
    project_id: UUID,
    mention_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark a mention as read."""
    project = get_project_access(project_id, user, db)

    mention = db.query(CommentMention).filter(
        CommentMention.id == mention_id,
        CommentMention.user_id == user.id
    ).first()

    if not mention:
        raise HTTPException(status_code=404, detail="Mention not found")

    mention.read = True
    mention.read_at = datetime.utcnow()
    db.commit()

    return {"success": True}


@router.post("/mentions/read-all")
async def mark_all_mentions_read(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Mark all mentions as read."""
    project = get_project_access(project_id, user, db)

    db.query(CommentMention).join(Comment).filter(
        Comment.project_id == project.id,
        CommentMention.user_id == user.id,
        CommentMention.read == False
    ).update({
        CommentMention.read: True,
        CommentMention.read_at: datetime.utcnow()
    }, synchronize_session=False)

    db.commit()

    return {"success": True}


# =============================================================================
# STATS
# =============================================================================

@router.get("/comments/stats")
async def get_comment_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get comment statistics for the project."""
    project = get_project_access(project_id, user, db)

    total_comments = db.query(Comment).filter(
        Comment.project_id == project.id
    ).count()

    open_threads = db.query(Comment).filter(
        Comment.project_id == project.id,
        Comment.parent_id.is_(None),
        Comment.status == CommentStatus.OPEN
    ).count()

    resolved_threads = db.query(Comment).filter(
        Comment.project_id == project.id,
        Comment.parent_id.is_(None),
        Comment.status == CommentStatus.RESOLVED
    ).count()

    unread_mentions = db.query(CommentMention).join(Comment).filter(
        Comment.project_id == project.id,
        CommentMention.user_id == user.id,
        CommentMention.read == False
    ).count()

    # Recent activity
    recent_comments = db.query(Comment).filter(
        Comment.project_id == project.id
    ).order_by(desc(Comment.created_at)).limit(5).all()

    return {
        "total_comments": total_comments,
        "open_threads": open_threads,
        "resolved_threads": resolved_threads,
        "unread_mentions": unread_mentions,
        "recent_activity": [
            {
                "id": str(c.id),
                "author": c.author.name or c.author.email,
                "content_preview": c.content[:100],
                "target_type": c.target_type.value,
                "created_at": c.created_at.isoformat()
            }
            for c in recent_comments
        ]
    }
