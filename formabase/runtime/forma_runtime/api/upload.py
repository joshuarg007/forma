"""File upload API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query
from pydantic import BaseModel

from ..auth.dependencies import get_current_user, get_current_user_optional
from ..storage import get_storage, StoredFile


router = APIRouter()


class UploadResponse(BaseModel):
    """Response model for file uploads."""
    key: str
    url: str
    filename: str
    content_type: str
    size: int


class DeleteResponse(BaseModel):
    """Response model for file deletion."""
    deleted: bool
    key: str


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query("", description="Optional folder for organization"),
    current_user: dict = Depends(get_current_user),
) -> UploadResponse:
    """
    Upload a file to storage.

    Requires authentication. Files are stored with a unique key and
    can be organized into folders.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    storage = get_storage()

    # Include user ID in folder path for organization
    user_id = current_user.get("id", "anonymous")
    full_folder = f"user_{user_id}/{folder}".strip("/")

    try:
        stored = await storage.upload(
            file=file.file,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            folder=full_folder,
        )

        return UploadResponse(
            key=stored.key,
            url=stored.url,
            filename=stored.filename,
            content_type=stored.content_type,
            size=stored.size,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/public", response_model=UploadResponse)
async def upload_public_file(
    file: UploadFile = File(...),
    folder: str = Query("public", description="Folder for organization"),
    current_user: Optional[dict] = Depends(get_current_user_optional),
) -> UploadResponse:
    """
    Upload a file to public storage.

    Can be used without authentication for public uploads.
    Files are stored in a public folder.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    storage = get_storage()

    try:
        stored = await storage.upload(
            file=file.file,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            folder=folder,
        )

        return UploadResponse(
            key=stored.key,
            url=stored.url,
            filename=stored.filename,
            content_type=stored.content_type,
            size=stored.size,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{key:path}")
async def get_file_url(
    key: str,
    expires_in: int = Query(3600, ge=60, le=86400, description="URL expiration in seconds"),
    current_user: Optional[dict] = Depends(get_current_user_optional),
) -> dict:
    """
    Get a URL for accessing a file.

    For S3 storage, returns a presigned URL.
    For local storage, returns the static URL.
    """
    storage = get_storage()

    if not await storage.exists(key):
        raise HTTPException(status_code=404, detail="File not found")

    url = await storage.get_url(key, expires_in=expires_in)

    return {"url": url, "key": key, "expires_in": expires_in}


@router.delete("/{key:path}", response_model=DeleteResponse)
async def delete_file(
    key: str,
    current_user: dict = Depends(get_current_user),
) -> DeleteResponse:
    """
    Delete a file from storage.

    Requires authentication. Users can only delete their own files
    (files in their user folder) unless they are admin.
    """
    storage = get_storage()

    # Check ownership (unless admin)
    user_id = current_user.get("id")
    user_role = current_user.get("role", "user")

    if user_role != "admin":
        # Check if file is in user's folder
        expected_prefix = f"user_{user_id}/"
        if not key.startswith(expected_prefix) and not key.startswith("public/"):
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own files",
            )

    if not await storage.exists(key):
        raise HTTPException(status_code=404, detail="File not found")

    deleted = await storage.delete(key)

    return DeleteResponse(deleted=deleted, key=key)


@router.get("")
async def list_files(
    folder: str = Query("", description="Folder to list"),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    List files in a folder.

    Requires authentication. Users can only list their own files
    unless they are admin.
    """
    storage = get_storage()

    user_id = current_user.get("id")
    user_role = current_user.get("role", "user")

    # Restrict to user's folder unless admin
    if user_role != "admin" and not folder.startswith("public"):
        folder = f"user_{user_id}/{folder}".strip("/")

    # Check if storage supports listing
    if hasattr(storage, "list_files"):
        files = await storage.list_files(folder)
        return {
            "files": [
                {
                    "key": f.key,
                    "url": f.url,
                    "filename": f.filename,
                    "content_type": f.content_type,
                    "size": f.size,
                }
                for f in files
            ],
            "folder": folder,
        }

    return {"files": [], "folder": folder, "error": "Listing not supported"}
