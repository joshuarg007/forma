"""File Upload Service"""
import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, BinaryIO

import aiofiles
from PIL import Image

from app.core.config import settings


class UploadService:
    """Handle file uploads with local storage (can be extended to S3)."""

    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.max_size = settings.max_upload_size
        self._ensure_directories()

    def _ensure_directories(self):
        """Create upload directories if they don't exist."""
        dirs = ["images", "previews", "exports", "avatars"]
        for d in dirs:
            (self.upload_dir / d).mkdir(parents=True, exist_ok=True)

    def _generate_filename(self, original_filename: str, prefix: str = "") -> str:
        """Generate a unique filename."""
        ext = Path(original_filename).suffix.lower()
        unique_id = uuid.uuid4().hex[:12]
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        return f"{prefix}{timestamp}_{unique_id}{ext}"

    async def save_file(
        self,
        file_content: bytes,
        original_filename: str,
        category: str = "images",
        user_id: Optional[str] = None
    ) -> dict:
        """Save uploaded file and return metadata."""
        # Validate size
        if len(file_content) > self.max_size:
            raise ValueError(f"File too large. Maximum size is {self.max_size // 1024 // 1024}MB")

        # Generate filename
        prefix = f"u{user_id[:8]}_" if user_id else ""
        filename = self._generate_filename(original_filename, prefix)
        file_path = self.upload_dir / category / filename

        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)

        # Get file hash for deduplication
        file_hash = hashlib.md5(file_content).hexdigest()

        return {
            "filename": filename,
            "path": str(file_path),
            "url": f"/uploads/{category}/{filename}",
            "size": len(file_content),
            "hash": file_hash,
            "category": category
        }

    async def save_image(
        self,
        file_content: bytes,
        original_filename: str,
        category: str = "images",
        user_id: Optional[str] = None,
        max_width: int = 1920,
        max_height: int = 1080,
        create_thumbnail: bool = True
    ) -> dict:
        """Save image with optional resizing and thumbnail generation."""
        import io

        # Validate it's an image
        try:
            img = Image.open(io.BytesIO(file_content))
            img.verify()
            img = Image.open(io.BytesIO(file_content))  # Reopen after verify
        except Exception:
            raise ValueError("Invalid image file")

        # Validate format
        allowed_formats = {"JPEG", "PNG", "GIF", "WEBP"}
        if img.format not in allowed_formats:
            raise ValueError(f"Unsupported image format. Allowed: {', '.join(allowed_formats)}")

        # Resize if needed
        original_size = img.size
        if img.width > max_width or img.height > max_height:
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        # Save main image
        prefix = f"u{user_id[:8]}_" if user_id else ""
        ext = ".webp" if img.format != "GIF" else ".gif"  # Convert to webp except gifs
        filename = self._generate_filename(f"image{ext}", prefix)
        file_path = self.upload_dir / category / filename

        # Convert to RGB if necessary (for JPEG/WEBP)
        if img.mode in ('RGBA', 'P') and ext == '.webp':
            # Preserve alpha for webp
            pass
        elif img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        # Save with optimization
        save_kwargs = {"quality": 85, "optimize": True}
        if ext == ".webp":
            img.save(file_path, "WEBP", **save_kwargs)
        elif ext == ".gif":
            img.save(file_path, "GIF")
        else:
            img.save(file_path, "JPEG", **save_kwargs)

        result = {
            "filename": filename,
            "path": str(file_path),
            "url": f"/uploads/{category}/{filename}",
            "size": os.path.getsize(file_path),
            "width": img.width,
            "height": img.height,
            "original_size": original_size,
            "format": ext[1:].upper(),
            "category": category
        }

        # Create thumbnail
        if create_thumbnail:
            thumb_result = await self._create_thumbnail(img, filename, category)
            result["thumbnail"] = thumb_result

        return result

    async def _create_thumbnail(
        self,
        img: Image.Image,
        original_filename: str,
        category: str,
        size: tuple = (300, 300)
    ) -> dict:
        """Create thumbnail from image."""
        thumb = img.copy()
        thumb.thumbnail(size, Image.Resampling.LANCZOS)

        thumb_filename = f"thumb_{original_filename}"
        thumb_path = self.upload_dir / category / thumb_filename

        if thumb.mode not in ('RGB', 'RGBA'):
            thumb = thumb.convert('RGB')

        thumb.save(thumb_path, "WEBP", quality=80, optimize=True)

        return {
            "filename": thumb_filename,
            "url": f"/uploads/{category}/{thumb_filename}",
            "width": thumb.width,
            "height": thumb.height
        }

    async def delete_file(self, file_path: str) -> bool:
        """Delete a file."""
        try:
            path = Path(file_path)
            if path.exists() and str(path).startswith(str(self.upload_dir)):
                os.remove(path)
                return True
            return False
        except Exception:
            return False

    def get_file_path(self, category: str, filename: str) -> Optional[Path]:
        """Get full path for a file."""
        file_path = self.upload_dir / category / filename
        if file_path.exists():
            return file_path
        return None


# Singleton instance
upload_service = UploadService()
