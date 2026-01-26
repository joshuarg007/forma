"""Media Library API - Centralized media management"""
import os
import uuid
import hashlib
import mimetypes
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.database import get_db
from app.db.models import Project, User, MediaFolder, MediaFile, MediaType
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/media", tags=["media"])


# =============================================================================
# CONFIG
# =============================================================================

UPLOAD_DIR = os.getenv("MEDIA_UPLOAD_DIR", "uploads/media")
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/wav", "audio/ogg"}
ALLOWED_DOC_TYPES = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}

# Image size variants
IMAGE_VARIANTS = {
    "thumb": {"width": 150, "height": 150},
    "small": {"width": 320, "height": 320},
    "medium": {"width": 640, "height": 640},
    "large": {"width": 1280, "height": 1280}
}


# =============================================================================
# SCHEMAS
# =============================================================================

class FolderCreate(BaseModel):
    """Create a folder."""
    name: str
    parent_id: Optional[str] = None


class FolderUpdate(BaseModel):
    """Update a folder."""
    name: Optional[str] = None


class FileUpdate(BaseModel):
    """Update a file."""
    filename: Optional[str] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    tags: Optional[List[str]] = None
    folder_id: Optional[str] = None


# =============================================================================
# HELPERS
# =============================================================================

def get_media_type(mime_type: str) -> MediaType:
    """Determine media type from MIME type."""
    if mime_type in ALLOWED_IMAGE_TYPES:
        return MediaType.IMAGE
    elif mime_type in ALLOWED_VIDEO_TYPES:
        return MediaType.VIDEO
    elif mime_type in ALLOWED_AUDIO_TYPES:
        return MediaType.AUDIO
    elif mime_type in ALLOWED_DOC_TYPES:
        return MediaType.DOCUMENT
    else:
        return MediaType.OTHER


def generate_unique_filename(original: str) -> str:
    """Generate a unique filename."""
    ext = os.path.splitext(original)[1].lower()
    unique_id = uuid.uuid4().hex[:12]
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def ensure_upload_dir(project_id: str, folder_path: str = "") -> str:
    """Ensure upload directory exists and return path."""
    path = os.path.join(UPLOAD_DIR, str(project_id), folder_path.strip('/'))
    os.makedirs(path, exist_ok=True)
    return path


def get_image_dimensions(file_data: bytes) -> tuple[int, int]:
    """Get image dimensions from file data."""
    try:
        from PIL import Image
        img = Image.open(BytesIO(file_data))
        return img.size
    except:
        return (0, 0)


def create_image_variants(
    file_data: bytes,
    project_id: str,
    base_filename: str,
    mime_type: str
) -> dict:
    """Create resized variants of an image."""
    variants = {}

    try:
        from PIL import Image

        img = Image.open(BytesIO(file_data))
        original_format = img.format or "JPEG"

        # Convert to RGB if necessary (for JPEG)
        if img.mode in ('RGBA', 'P') and original_format == 'JPEG':
            img = img.convert('RGB')

        for variant_name, size in IMAGE_VARIANTS.items():
            # Calculate new size maintaining aspect ratio
            img_copy = img.copy()
            img_copy.thumbnail((size["width"], size["height"]), Image.Resampling.LANCZOS)

            # Generate filename
            name_without_ext = os.path.splitext(base_filename)[0]
            ext = os.path.splitext(base_filename)[1]
            variant_filename = f"{name_without_ext}_{variant_name}{ext}"

            # Save variant
            upload_dir = ensure_upload_dir(project_id)
            variant_path = os.path.join(upload_dir, variant_filename)

            save_kwargs = {}
            if original_format == 'JPEG':
                save_kwargs = {"quality": 85, "optimize": True}
            elif original_format == 'PNG':
                save_kwargs = {"optimize": True}

            img_copy.save(variant_path, format=original_format, **save_kwargs)

            variants[variant_name] = {
                "filename": variant_filename,
                "url": f"/media/{project_id}/{variant_filename}",
                "width": img_copy.width,
                "height": img_copy.height
            }

    except ImportError:
        # PIL not available, skip variants
        pass
    except Exception as e:
        print(f"Error creating variants: {e}")

    return variants


# =============================================================================
# FOLDER ENDPOINTS
# =============================================================================

@router.get("/folders")
async def list_folders(
    project_id: UUID,
    parent_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List folders in the media library."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(MediaFolder).filter(MediaFolder.project_id == project_id)

    if parent_id:
        query = query.filter(MediaFolder.parent_id == UUID(parent_id))
    else:
        query = query.filter(MediaFolder.parent_id == None)

    folders = query.order_by(MediaFolder.name).all()

    return {
        "folders": [
            {
                "id": str(f.id),
                "name": f.name,
                "slug": f.slug,
                "path": f.path,
                "parent_id": str(f.parent_id) if f.parent_id else None,
                "file_count": len(f.files),
                "created_at": f.created_at.isoformat()
            }
            for f in folders
        ]
    }


@router.post("/folders")
async def create_folder(
    project_id: UUID,
    data: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new folder."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    slug = slugify(data.name)
    parent_path = ""

    if data.parent_id:
        parent = db.query(MediaFolder).filter(
            MediaFolder.id == UUID(data.parent_id),
            MediaFolder.project_id == project_id
        ).first()

        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")

        parent_path = parent.path

    path = f"{parent_path}/{slug}".lstrip('/')

    # Check for duplicate
    existing = db.query(MediaFolder).filter(
        MediaFolder.project_id == project_id,
        MediaFolder.path == path
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Folder already exists at this path")

    folder = MediaFolder(
        project_id=project_id,
        parent_id=UUID(data.parent_id) if data.parent_id else None,
        name=data.name,
        slug=slug,
        path=path
    )

    db.add(folder)
    db.commit()
    db.refresh(folder)

    # Create directory
    ensure_upload_dir(str(project_id), path)

    return {
        "id": str(folder.id),
        "name": folder.name,
        "path": folder.path
    }


@router.put("/folders/{folder_id}")
async def update_folder(
    project_id: UUID,
    folder_id: UUID,
    data: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a folder."""
    folder = db.query(MediaFolder).filter(
        MediaFolder.id == folder_id,
        MediaFolder.project_id == project_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if data.name:
        folder.name = data.name
        # Note: Not updating slug/path to avoid breaking references

    db.commit()

    return {"success": True, "message": "Folder updated"}


@router.delete("/folders/{folder_id}")
async def delete_folder(
    project_id: UUID,
    folder_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a folder (must be empty)."""
    folder = db.query(MediaFolder).filter(
        MediaFolder.id == folder_id,
        MediaFolder.project_id == project_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Check if empty
    if folder.files or folder.children:
        raise HTTPException(status_code=400, detail="Folder is not empty")

    db.delete(folder)
    db.commit()

    return {"success": True, "message": "Folder deleted"}


# =============================================================================
# FILE ENDPOINTS
# =============================================================================

@router.get("/files")
async def list_files(
    project_id: UUID,
    folder_id: Optional[str] = None,
    media_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List files in the media library."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(MediaFile).filter(MediaFile.project_id == project_id)

    if folder_id:
        if folder_id == "root":
            query = query.filter(MediaFile.folder_id == None)
        else:
            query = query.filter(MediaFile.folder_id == UUID(folder_id))

    if media_type:
        try:
            query = query.filter(MediaFile.media_type == MediaType(media_type))
        except ValueError:
            pass

    if search:
        query = query.filter(
            or_(
                MediaFile.filename.ilike(f"%{search}%"),
                MediaFile.original_filename.ilike(f"%{search}%"),
                MediaFile.alt_text.ilike(f"%{search}%")
            )
        )

    total = query.count()
    files = query.order_by(MediaFile.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "files": [
            {
                "id": str(f.id),
                "filename": f.filename,
                "original_filename": f.original_filename,
                "mime_type": f.mime_type,
                "media_type": f.media_type.value,
                "file_size": f.file_size,
                "url": f.url,
                "cdn_url": f.cdn_url,
                "width": f.width,
                "height": f.height,
                "variants": f.variants,
                "alt_text": f.alt_text,
                "tags": f.tags,
                "folder_id": str(f.folder_id) if f.folder_id else None,
                "created_at": f.created_at.isoformat()
            }
            for f in files
        ],
        "total": total
    }


@router.post("/files")
async def upload_file(
    project_id: UUID,
    file: UploadFile = File(...),
    folder_id: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file to the media library."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Read file
    file_data = await file.read()

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    # Determine MIME type
    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
    media_type = get_media_type(mime_type)

    # Generate filename
    unique_filename = generate_unique_filename(file.filename)

    # Determine folder path
    folder_path = ""
    folder_id_uuid = None
    if folder_id and folder_id != "root":
        folder = db.query(MediaFolder).filter(
            MediaFolder.id == UUID(folder_id),
            MediaFolder.project_id == project_id
        ).first()

        if folder:
            folder_path = folder.path
            folder_id_uuid = folder.id

    # Save file
    upload_dir = ensure_upload_dir(str(project_id), folder_path)
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as f:
        f.write(file_data)

    # Get image dimensions
    width, height = None, None
    variants = {}

    if media_type == MediaType.IMAGE:
        width, height = get_image_dimensions(file_data)

        # Create variants for non-SVG images
        if mime_type != "image/svg+xml":
            variants = create_image_variants(
                file_data, str(project_id), unique_filename, mime_type
            )

    # Build URL
    url_path = f"{folder_path}/{unique_filename}".lstrip('/')
    url = f"/media/{project_id}/{url_path}"

    # Create database record
    media_file = MediaFile(
        project_id=project_id,
        folder_id=folder_id_uuid,
        filename=unique_filename,
        original_filename=file.filename,
        mime_type=mime_type,
        media_type=media_type,
        file_size=len(file_data),
        storage_path=file_path,
        url=url,
        width=width,
        height=height,
        variants=variants,
        alt_text=alt_text
    )

    db.add(media_file)
    db.commit()
    db.refresh(media_file)

    return {
        "id": str(media_file.id),
        "filename": media_file.filename,
        "url": media_file.url,
        "mime_type": media_file.mime_type,
        "media_type": media_file.media_type.value,
        "width": media_file.width,
        "height": media_file.height,
        "variants": media_file.variants
    }


@router.get("/files/{file_id}")
async def get_file(
    project_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get file details."""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.project_id == project_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "id": str(media_file.id),
        "filename": media_file.filename,
        "original_filename": media_file.original_filename,
        "mime_type": media_file.mime_type,
        "media_type": media_file.media_type.value,
        "file_size": media_file.file_size,
        "url": media_file.url,
        "cdn_url": media_file.cdn_url,
        "width": media_file.width,
        "height": media_file.height,
        "variants": media_file.variants,
        "alt_text": media_file.alt_text,
        "caption": media_file.caption,
        "tags": media_file.tags,
        "usage_count": media_file.usage_count,
        "folder_id": str(media_file.folder_id) if media_file.folder_id else None,
        "created_at": media_file.created_at.isoformat(),
        "updated_at": media_file.updated_at.isoformat()
    }


@router.put("/files/{file_id}")
async def update_file(
    project_id: UUID,
    file_id: UUID,
    data: FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update file metadata."""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.project_id == project_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    if data.filename:
        media_file.filename = data.filename
    if data.alt_text is not None:
        media_file.alt_text = data.alt_text
    if data.caption is not None:
        media_file.caption = data.caption
    if data.tags is not None:
        media_file.tags = data.tags
    if data.folder_id is not None:
        if data.folder_id:
            media_file.folder_id = UUID(data.folder_id)
        else:
            media_file.folder_id = None

    db.commit()

    return {"success": True, "message": "File updated"}


@router.delete("/files/{file_id}")
async def delete_file(
    project_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a file."""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.project_id == project_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete physical file
    try:
        if os.path.exists(media_file.storage_path):
            os.remove(media_file.storage_path)

        # Delete variants
        for variant_name, variant_data in (media_file.variants or {}).items():
            variant_filename = variant_data.get("filename")
            if variant_filename:
                variant_path = os.path.join(os.path.dirname(media_file.storage_path), variant_filename)
                if os.path.exists(variant_path):
                    os.remove(variant_path)
    except Exception as e:
        print(f"Error deleting files: {e}")

    db.delete(media_file)
    db.commit()

    return {"success": True, "message": "File deleted"}


@router.post("/files/{file_id}/duplicate")
async def duplicate_file(
    project_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Duplicate a file."""
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.project_id == project_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    # Read original file
    if not os.path.exists(media_file.storage_path):
        raise HTTPException(status_code=404, detail="Source file not found")

    with open(media_file.storage_path, "rb") as f:
        file_data = f.read()

    # Generate new filename
    unique_filename = generate_unique_filename(media_file.original_filename)

    # Save copy
    new_path = os.path.join(os.path.dirname(media_file.storage_path), unique_filename)
    with open(new_path, "wb") as f:
        f.write(file_data)

    # Create variants if image
    variants = {}
    if media_file.media_type == MediaType.IMAGE and media_file.mime_type != "image/svg+xml":
        variants = create_image_variants(
            file_data, str(project_id), unique_filename, media_file.mime_type
        )

    # Build URL
    folder_path = ""
    if media_file.folder:
        folder_path = media_file.folder.path
    url_path = f"{folder_path}/{unique_filename}".lstrip('/')
    url = f"/media/{project_id}/{url_path}"

    # Create new record
    new_file = MediaFile(
        project_id=project_id,
        folder_id=media_file.folder_id,
        filename=unique_filename,
        original_filename=f"Copy of {media_file.original_filename}",
        mime_type=media_file.mime_type,
        media_type=media_file.media_type,
        file_size=media_file.file_size,
        storage_path=new_path,
        url=url,
        width=media_file.width,
        height=media_file.height,
        variants=variants,
        alt_text=media_file.alt_text,
        caption=media_file.caption,
        tags=media_file.tags
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {
        "id": str(new_file.id),
        "filename": new_file.filename,
        "url": new_file.url
    }


# =============================================================================
# STATS ENDPOINT
# =============================================================================

@router.get("/stats")
async def get_media_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get media library statistics."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Total counts
    total_files = db.query(func.count(MediaFile.id)).filter(
        MediaFile.project_id == project_id
    ).scalar()

    total_folders = db.query(func.count(MediaFolder.id)).filter(
        MediaFolder.project_id == project_id
    ).scalar()

    # Total size
    total_size = db.query(func.sum(MediaFile.file_size)).filter(
        MediaFile.project_id == project_id
    ).scalar() or 0

    # By type
    type_counts = db.query(
        MediaFile.media_type,
        func.count(MediaFile.id)
    ).filter(
        MediaFile.project_id == project_id
    ).group_by(MediaFile.media_type).all()

    return {
        "total_files": total_files,
        "total_folders": total_folders,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "by_type": {
            t.value: c for t, c in type_counts
        }
    }
