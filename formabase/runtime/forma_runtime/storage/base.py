"""Base storage interface for file uploads."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, BinaryIO
from dataclasses import dataclass


@dataclass
class StoredFile:
    """Metadata about a stored file."""
    key: str  # Unique storage key/path
    url: str  # Public URL to access the file
    filename: str  # Original filename
    content_type: str  # MIME type
    size: int  # Size in bytes


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = "",
    ) -> StoredFile:
        """
        Upload a file to storage.

        Args:
            file: File-like object to upload
            filename: Original filename
            content_type: MIME type of the file
            folder: Optional folder/prefix for organization

        Returns:
            StoredFile with metadata about the uploaded file
        """
        pass

    @abstractmethod
    async def download(self, key: str) -> bytes:
        """
        Download a file from storage.

        Args:
            key: Storage key of the file

        Returns:
            File contents as bytes
        """
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Delete a file from storage.

        Args:
            key: Storage key of the file

        Returns:
            True if deleted, False if not found
        """
        pass

    @abstractmethod
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Get a URL for accessing a file.

        Args:
            key: Storage key of the file
            expires_in: URL expiration time in seconds (for signed URLs)

        Returns:
            URL to access the file
        """
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if a file exists.

        Args:
            key: Storage key of the file

        Returns:
            True if file exists
        """
        pass
