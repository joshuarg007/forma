"""Code Snippets Library API."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    User, Project, CodeSnippet, SnippetFolder, SnippetShare,
    SnippetLanguage, SnippetVisibility
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/snippets", tags=["snippets"])


# =============================================================================
# SCHEMAS
# =============================================================================

class FolderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    position: Optional[int] = None


class FolderResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    color: Optional[str]
    icon: Optional[str]
    parent_id: Optional[UUID]
    position: int
    snippet_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class SnippetCreate(BaseModel):
    title: str
    description: Optional[str] = None
    language: SnippetLanguage = SnippetLanguage.TYPESCRIPT
    code: str
    tags: List[str] = []
    visibility: SnippetVisibility = SnippetVisibility.PRIVATE
    folder_id: Optional[UUID] = None
    project_id: Optional[UUID] = None


class SnippetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[SnippetLanguage] = None
    code: Optional[str] = None
    tags: Optional[List[str]] = None
    visibility: Optional[SnippetVisibility] = None
    folder_id: Optional[UUID] = None
    favorite: Optional[bool] = None


class SnippetResponse(BaseModel):
    id: UUID
    user_id: UUID
    folder_id: Optional[UUID]
    title: str
    description: Optional[str]
    language: str
    code: str
    code_preview: Optional[str]
    tags: list
    visibility: str
    project_id: Optional[UUID]
    use_count: int
    last_used_at: Optional[datetime]
    favorite: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SnippetShareCreate(BaseModel):
    shared_with_email: str
    can_edit: bool = False


class SnippetShareResponse(BaseModel):
    id: UUID
    snippet_id: UUID
    shared_with_id: UUID
    shared_with_email: Optional[str] = None
    shared_by_id: UUID
    can_edit: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# HELPERS
# =============================================================================

def generate_preview(code: str, max_length: int = 500) -> str:
    """Generate a code preview."""
    lines = code.strip().split('\n')[:5]
    preview = '\n'.join(lines)
    if len(preview) > max_length:
        preview = preview[:max_length] + "..."
    return preview


def can_access_snippet(snippet: CodeSnippet, user: User, db: Session) -> bool:
    """Check if user can access a snippet."""
    # Owner always has access
    if snippet.user_id == user.id:
        return True

    # Public snippets are accessible to all
    if snippet.visibility == SnippetVisibility.PUBLIC:
        return True

    # Check if shared with user
    share = db.query(SnippetShare).filter(
        SnippetShare.snippet_id == snippet.id,
        SnippetShare.shared_with_id == user.id
    ).first()

    if share:
        return True

    # Check project visibility
    if snippet.visibility == SnippetVisibility.PROJECT and snippet.project_id:
        # Check if user is project member
        project = db.query(Project).filter(Project.id == snippet.project_id).first()
        if project and project.user_id == user.id:
            return True
        # TODO: Check project membership

    return False


def can_edit_snippet(snippet: CodeSnippet, user: User, db: Session) -> bool:
    """Check if user can edit a snippet."""
    # Owner can always edit
    if snippet.user_id == user.id:
        return True

    # Check if shared with edit permission
    share = db.query(SnippetShare).filter(
        SnippetShare.snippet_id == snippet.id,
        SnippetShare.shared_with_id == user.id,
        SnippetShare.can_edit == True
    ).first()

    return share is not None


# =============================================================================
# FOLDER ENDPOINTS
# =============================================================================

@router.get("/folders", response_model=List[FolderResponse])
async def list_folders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List user's snippet folders."""
    folders = db.query(SnippetFolder).filter(
        SnippetFolder.user_id == user.id
    ).order_by(SnippetFolder.position).all()

    result = []
    for folder in folders:
        count = db.query(CodeSnippet).filter(
            CodeSnippet.folder_id == folder.id
        ).count()

        data = FolderResponse.model_validate(folder)
        data.snippet_count = count
        result.append(data)

    return result


@router.post("/folders", response_model=FolderResponse)
async def create_folder(
    request: FolderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a snippet folder."""
    folder = SnippetFolder(
        user_id=user.id,
        name=request.name,
        description=request.description,
        color=request.color,
        icon=request.icon,
        parent_id=request.parent_id,
    )

    db.add(folder)
    db.commit()
    db.refresh(folder)

    return FolderResponse.model_validate(folder)


@router.put("/folders/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: UUID,
    request: FolderUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a snippet folder."""
    folder = db.query(SnippetFolder).filter(
        SnippetFolder.id == folder_id,
        SnippetFolder.user_id == user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(folder, field, value)

    db.commit()
    db.refresh(folder)

    return FolderResponse.model_validate(folder)


@router.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: UUID,
    move_snippets_to: Optional[UUID] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a snippet folder."""
    folder = db.query(SnippetFolder).filter(
        SnippetFolder.id == folder_id,
        SnippetFolder.user_id == user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Move snippets if destination provided, otherwise set to null
    db.query(CodeSnippet).filter(
        CodeSnippet.folder_id == folder_id
    ).update({CodeSnippet.folder_id: move_snippets_to}, synchronize_session=False)

    # Move child folders to parent
    db.query(SnippetFolder).filter(
        SnippetFolder.parent_id == folder_id
    ).update({SnippetFolder.parent_id: folder.parent_id}, synchronize_session=False)

    db.delete(folder)
    db.commit()

    return {"success": True}


# =============================================================================
# SNIPPET ENDPOINTS
# =============================================================================

@router.get("", response_model=List[SnippetResponse])
async def list_snippets(
    folder_id: Optional[UUID] = None,
    language: Optional[SnippetLanguage] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    favorites_only: bool = False,
    include_shared: bool = True,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List user's snippets."""
    # Start with user's own snippets
    query = db.query(CodeSnippet).filter(CodeSnippet.user_id == user.id)

    if folder_id:
        query = query.filter(CodeSnippet.folder_id == folder_id)
    if language:
        query = query.filter(CodeSnippet.language == language)
    if favorites_only:
        query = query.filter(CodeSnippet.favorite == True)

    if tag:
        # Filter by tag (JSON array contains)
        query = query.filter(CodeSnippet.tags.contains([tag]))

    if search:
        query = query.filter(
            or_(
                CodeSnippet.title.ilike(f"%{search}%"),
                CodeSnippet.description.ilike(f"%{search}%"),
                CodeSnippet.code.ilike(f"%{search}%")
            )
        )

    snippets = query.order_by(desc(CodeSnippet.updated_at)).offset(offset).limit(limit).all()

    # Include shared snippets
    if include_shared and not folder_id:
        shared_ids = db.query(SnippetShare.snippet_id).filter(
            SnippetShare.shared_with_id == user.id
        ).all()
        shared_ids = [s[0] for s in shared_ids]

        if shared_ids:
            shared_query = db.query(CodeSnippet).filter(CodeSnippet.id.in_(shared_ids))
            if language:
                shared_query = shared_query.filter(CodeSnippet.language == language)
            if search:
                shared_query = shared_query.filter(
                    or_(
                        CodeSnippet.title.ilike(f"%{search}%"),
                        CodeSnippet.code.ilike(f"%{search}%")
                    )
                )

            shared_snippets = shared_query.all()
            snippets.extend(shared_snippets)

    return [SnippetResponse.model_validate(s) for s in snippets]


@router.post("", response_model=SnippetResponse)
async def create_snippet(
    request: SnippetCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a code snippet."""
    snippet = CodeSnippet(
        user_id=user.id,
        folder_id=request.folder_id,
        title=request.title,
        description=request.description,
        language=request.language,
        code=request.code,
        code_preview=generate_preview(request.code),
        tags=request.tags,
        visibility=request.visibility,
        project_id=request.project_id,
    )

    db.add(snippet)
    db.commit()
    db.refresh(snippet)

    return SnippetResponse.model_validate(snippet)


@router.get("/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific snippet."""
    snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    if not can_access_snippet(snippet, user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    return SnippetResponse.model_validate(snippet)


@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: UUID,
    request: SnippetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a snippet."""
    snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    if not can_edit_snippet(snippet, user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(snippet, field, value)

    # Update preview if code changed
    if request.code:
        snippet.code_preview = generate_preview(request.code)

    db.commit()
    db.refresh(snippet)

    return SnippetResponse.model_validate(snippet)


@router.delete("/{snippet_id}")
async def delete_snippet(
    snippet_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a snippet."""
    snippet = db.query(CodeSnippet).filter(
        CodeSnippet.id == snippet_id,
        CodeSnippet.user_id == user.id
    ).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    db.delete(snippet)
    db.commit()

    return {"success": True}


@router.post("/{snippet_id}/use")
async def record_snippet_use(
    snippet_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Record snippet usage."""
    snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    if not can_access_snippet(snippet, user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    snippet.use_count += 1
    snippet.last_used_at = datetime.utcnow()
    db.commit()

    return {"success": True, "use_count": snippet.use_count}


@router.post("/{snippet_id}/duplicate", response_model=SnippetResponse)
async def duplicate_snippet(
    snippet_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Duplicate a snippet to user's library."""
    original = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()

    if not original:
        raise HTTPException(status_code=404, detail="Snippet not found")

    if not can_access_snippet(original, user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    snippet = CodeSnippet(
        user_id=user.id,
        title=f"{original.title} (Copy)",
        description=original.description,
        language=original.language,
        code=original.code,
        code_preview=original.code_preview,
        tags=original.tags,
        visibility=SnippetVisibility.PRIVATE,
    )

    db.add(snippet)
    db.commit()
    db.refresh(snippet)

    return SnippetResponse.model_validate(snippet)


# =============================================================================
# SHARING ENDPOINTS
# =============================================================================

@router.post("/{snippet_id}/share", response_model=SnippetShareResponse)
async def share_snippet(
    snippet_id: UUID,
    request: SnippetShareCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Share a snippet with another user."""
    snippet = db.query(CodeSnippet).filter(
        CodeSnippet.id == snippet_id,
        CodeSnippet.user_id == user.id
    ).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    # Find user by email
    target_user = db.query(User).filter(User.email == request.shared_with_email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    # Check if already shared
    existing = db.query(SnippetShare).filter(
        SnippetShare.snippet_id == snippet_id,
        SnippetShare.shared_with_id == target_user.id
    ).first()

    if existing:
        existing.can_edit = request.can_edit
        db.commit()
        db.refresh(existing)
        return SnippetShareResponse.model_validate(existing)

    share = SnippetShare(
        snippet_id=snippet_id,
        shared_with_id=target_user.id,
        shared_by_id=user.id,
        can_edit=request.can_edit,
    )

    db.add(share)
    db.commit()
    db.refresh(share)

    response = SnippetShareResponse.model_validate(share)
    response.shared_with_email = target_user.email
    return response


@router.get("/{snippet_id}/shares", response_model=List[SnippetShareResponse])
async def list_snippet_shares(
    snippet_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List shares for a snippet."""
    snippet = db.query(CodeSnippet).filter(
        CodeSnippet.id == snippet_id,
        CodeSnippet.user_id == user.id
    ).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    shares = db.query(SnippetShare).filter(
        SnippetShare.snippet_id == snippet_id
    ).all()

    result = []
    for share in shares:
        data = SnippetShareResponse.model_validate(share)
        data.shared_with_email = share.shared_with.email if share.shared_with else None
        result.append(data)

    return result


@router.delete("/{snippet_id}/share/{share_id}")
async def unshare_snippet(
    snippet_id: UUID,
    share_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Remove a share."""
    snippet = db.query(CodeSnippet).filter(
        CodeSnippet.id == snippet_id,
        CodeSnippet.user_id == user.id
    ).first()

    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    share = db.query(SnippetShare).filter(
        SnippetShare.id == share_id,
        SnippetShare.snippet_id == snippet_id
    ).first()

    if not share:
        raise HTTPException(status_code=404, detail="Share not found")

    db.delete(share)
    db.commit()

    return {"success": True}


# =============================================================================
# STATS & DISCOVERY
# =============================================================================

@router.get("/stats/me")
async def get_snippet_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get snippet statistics for current user."""
    total = db.query(CodeSnippet).filter(CodeSnippet.user_id == user.id).count()
    favorites = db.query(CodeSnippet).filter(
        CodeSnippet.user_id == user.id,
        CodeSnippet.favorite == True
    ).count()

    # Count by language
    by_language = {}
    for lang in SnippetLanguage:
        count = db.query(CodeSnippet).filter(
            CodeSnippet.user_id == user.id,
            CodeSnippet.language == lang
        ).count()
        if count > 0:
            by_language[lang.value] = count

    # Most used
    most_used = db.query(CodeSnippet).filter(
        CodeSnippet.user_id == user.id,
        CodeSnippet.use_count > 0
    ).order_by(desc(CodeSnippet.use_count)).limit(5).all()

    # Shared with me
    shared_count = db.query(SnippetShare).filter(
        SnippetShare.shared_with_id == user.id
    ).count()

    return {
        "total": total,
        "favorites": favorites,
        "by_language": by_language,
        "shared_with_me": shared_count,
        "most_used": [
            {"id": str(s.id), "title": s.title, "use_count": s.use_count}
            for s in most_used
        ]
    }


@router.get("/public")
async def list_public_snippets(
    language: Optional[SnippetLanguage] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, le=50),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List public snippets."""
    query = db.query(CodeSnippet).filter(
        CodeSnippet.visibility == SnippetVisibility.PUBLIC
    )

    if language:
        query = query.filter(CodeSnippet.language == language)
    if tag:
        query = query.filter(CodeSnippet.tags.contains([tag]))
    if search:
        query = query.filter(
            or_(
                CodeSnippet.title.ilike(f"%{search}%"),
                CodeSnippet.description.ilike(f"%{search}%")
            )
        )

    snippets = query.order_by(desc(CodeSnippet.use_count)).offset(offset).limit(limit).all()

    return [SnippetResponse.model_validate(s) for s in snippets]
