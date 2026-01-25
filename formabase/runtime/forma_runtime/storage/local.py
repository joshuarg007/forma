"""Local filesystem storage backend."""

import os
import hashlib
import aiofiles
import aiofiles.os
from pathlib import Path
from typing import BinaryIO
from datetime import datetime

from .base import StorageBackend, StoredFile


class LocalStorage(StorageBackend):
    """Store files on the local filesystem."""

    def __init__(
        self,
        base_path: str = "./uploads",
        base_url: str = "/uploads",
    ):
        """
        Initialize local storage.

        Args:
            base_path: Directory to store files
            base_url: URL prefix for serving files
        """
        self.base_path = Path(base_path).resolve()
        self.base_url = base_url.rstrip("/")

        # Ensure directory exists
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _generate_key(self, filename: str, folder: str = "") -> str:
        """Generate a unique storage key for a file."""
        # Create a unique key using timestamp and hash
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_hash = hashlib.md5(
            f"{filename}{timestamp}{os.urandom(8).hex()}".encode()
        ).hexdigest()[:8]

        # Sanitize filename
        safe_filename = "".join(
            c for c in filename if c.isalnum() or c in ".-_"
        ).rstrip()

        if folder:
            return f"{folder}/{timestamp}_{random_hash}_{safe_filename}"
        return f"{timestamp}_{random_hash}_{safe_filename}"

    def _get_path(self, key: str) -> Path:
        """Get the full filesystem path for a key."""
        return self.base_path / key

    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = "",
    ) -> StoredFile:
        """Upload a file to local storage."""
        key = self._generate_key(filename, folder)
        path = self._get_path(key)

        # Ensure parent directory exists
        path.parent.mkdir(parents=True, exist_ok=True)

        # Read file content
        content = file.read()
        size = len(content)

        # Write file
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)

        return StoredFile(
            key=key,
            url=f"{self.base_url}/{key}",
            filename=filename,
            content_type=content_type,
            size=size,
        )

    async def download(self, key: str) -> bytes:
        """Download a file from local storage."""
        path = self._get_path(key)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {key}")

        async with aiofiles.open(path, "rb") as f:
            return await f.read()

    async def delete(self, key: str) -> bool:
        """Delete a file from local storage."""
        path = self._get_path(key)

        if not path.exists():
            return False

        await aiofiles.os.remove(path)

        # Try to remove empty parent directories
        try:
            parent = path.parent
            while parent != self.base_path:
                if not any(parent.iterdir()):
                    parent.rmdir()
                    parent = parent.parent
                else:
                    break
        except (OSError, PermissionError):
            pass

        return True

    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get URL for a file (no expiration for local storage)."""
        # For local storage, just return the static URL
        return f"{self.base_url}/{key}"

    async def exists(self, key: str) -> bool:
        """Check if a file exists in local storage."""
        path = self._get_path(key)
        return path.exists()

    async def list_files(self, folder: str = "") -> list[StoredFile]:
        """List all files in a folder."""
        search_path = self.base_path / folder if folder else self.base_path
        files = []

        if not search_path.exists():
            return files

        for path in search_path.rglob("*"):
            if path.is_file():
                key = str(path.relative_to(self.base_path))
                stat = path.stat()

                files.append(StoredFile(
                    key=key,
                    url=f"{self.base_url}/{key}",
                    filename=path.name,
                    content_type=self._guess_content_type(path.name),
                    size=stat.st_size,
                ))

        return files

    def _guess_content_type(self, filename: str) -> str:
        """Guess content type from filename extension."""
        import mimetypes
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or "application/octet-stream"
