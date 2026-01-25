"""Storage backends for file uploads."""

from .base import StorageBackend, StoredFile
from .local import LocalStorage
from .s3 import S3Storage

__all__ = [
    "StorageBackend",
    "StoredFile",
    "LocalStorage",
    "S3Storage",
]


# Storage singleton
_storage_instance: StorageBackend | None = None


def get_storage() -> StorageBackend:
    """Get the configured storage backend."""
    global _storage_instance

    if _storage_instance is None:
        from ..config import settings

        provider = getattr(settings, "storage_provider", "local")

        if provider == "s3":
            _storage_instance = S3Storage(
                bucket=getattr(settings, "s3_bucket", ""),
                region=getattr(settings, "s3_region", "us-east-1"),
                access_key=getattr(settings, "s3_access_key", None),
                secret_key=getattr(settings, "s3_secret_key", None),
                endpoint_url=getattr(settings, "s3_endpoint_url", None),
                public_url=getattr(settings, "s3_public_url", None),
            )
        else:
            _storage_instance = LocalStorage(
                base_path=getattr(settings, "upload_path", "./uploads"),
                base_url=getattr(settings, "upload_url", "/uploads"),
            )

    return _storage_instance


def reset_storage():
    """Reset the storage singleton (for testing)."""
    global _storage_instance
    _storage_instance = None
