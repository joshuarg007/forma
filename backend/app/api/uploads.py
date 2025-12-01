"""File Upload API Routes"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.core.config import settings
from app.services.uploads import upload_service

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    category: str = Query("images", regex="^(images|previews|avatars)$"),
    current_user: User = Depends(get_current_user)
):
    """Upload an image file."""
    # Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Read file content
    content = await file.read()

    # Validate size
    if len(content) > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_upload_size // 1024 // 1024}MB"
        )

    try:
        result = await upload_service.save_image(
            file_content=content,
            original_filename=file.filename or "image.png",
            category=category,
            user_id=str(current_user.id)
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload user avatar."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, WEBP"
        )

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit for avatars
        raise HTTPException(status_code=400, detail="Avatar must be under 5MB")

    try:
        result = await upload_service.save_image(
            file_content=content,
            original_filename=file.filename or "avatar.png",
            category="avatars",
            user_id=str(current_user.id),
            max_width=500,
            max_height=500,
            create_thumbnail=False
        )

        # Update user avatar
        current_user.avatar_url = result["url"]
        db.commit()

        return {
            "success": True,
            "avatar_url": result["url"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/preview/{component_id}")
async def upload_component_preview(
    component_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload preview image for a component."""
    from app.db.models import Component, Project

    # Verify component ownership
    component = db.query(Component).join(Project).filter(
        Component.id == component_id,
        Project.user_id == current_user.id
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = await file.read()

    try:
        result = await upload_service.save_image(
            file_content=content,
            original_filename=file.filename or "preview.png",
            category="previews",
            user_id=str(current_user.id),
            max_width=1200,
            max_height=800
        )

        # Update component preview
        component.preview_url = result["url"]
        db.commit()

        return {
            "success": True,
            "preview_url": result["url"],
            "thumbnail_url": result.get("thumbnail", {}).get("url")
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{category}/{filename}")
async def delete_upload(
    category: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an uploaded file (only owner can delete)."""
    # Check if file belongs to user (filename contains user id prefix)
    user_prefix = f"u{str(current_user.id)[:8]}_"
    if not filename.startswith(user_prefix):
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    file_path = upload_service.get_file_path(category, filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    success = await upload_service.delete_file(str(file_path))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete file")

    return {"success": True}


# Serve uploaded files (in production, use nginx or CDN)
@router.get("/{category}/{filename}")
async def serve_upload(category: str, filename: str):
    """Serve uploaded file."""
    file_path = upload_service.get_file_path(category, filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
