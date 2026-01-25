"""S3-compatible storage backend (AWS S3, R2, MinIO, etc.)."""

import hashlib
from datetime import datetime
from typing import BinaryIO, Optional

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from .base import StorageBackend, StoredFile


class S3Storage(StorageBackend):
    """Store files in S3-compatible object storage."""

    def __init__(
        self,
        bucket: str,
        region: str = "us-east-1",
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        endpoint_url: Optional[str] = None,  # For R2, MinIO, etc.
        public_url: Optional[str] = None,  # Custom CDN/public URL
    ):
        """
        Initialize S3 storage.

        Args:
            bucket: S3 bucket name
            region: AWS region
            access_key: AWS access key ID (or from env)
            secret_key: AWS secret access key (or from env)
            endpoint_url: Custom endpoint for S3-compatible services
            public_url: Public URL prefix for accessing files
        """
        self.bucket = bucket
        self.region = region
        self.public_url = public_url

        # Create S3 client
        config = Config(
            region_name=region,
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        )

        client_kwargs = {"config": config}

        if access_key and secret_key:
            client_kwargs["aws_access_key_id"] = access_key
            client_kwargs["aws_secret_access_key"] = secret_key

        if endpoint_url:
            client_kwargs["endpoint_url"] = endpoint_url

        self.client = boto3.client("s3", **client_kwargs)

        # Default public URL
        if not self.public_url:
            if endpoint_url:
                self.public_url = f"{endpoint_url}/{bucket}"
            else:
                self.public_url = f"https://{bucket}.s3.{region}.amazonaws.com"

    def _generate_key(self, filename: str, folder: str = "") -> str:
        """Generate a unique storage key for a file."""
        timestamp = datetime.now().strftime("%Y/%m/%d")
        random_hash = hashlib.md5(
            f"{filename}{datetime.now().isoformat()}{id(filename)}".encode()
        ).hexdigest()[:8]

        # Sanitize filename
        safe_filename = "".join(
            c for c in filename if c.isalnum() or c in ".-_"
        ).rstrip()

        if folder:
            return f"{folder}/{timestamp}/{random_hash}_{safe_filename}"
        return f"{timestamp}/{random_hash}_{safe_filename}"

    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = "",
    ) -> StoredFile:
        """Upload a file to S3."""
        key = self._generate_key(filename, folder)
        content = file.read()
        size = len(content)

        # Upload to S3
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )

        return StoredFile(
            key=key,
            url=f"{self.public_url}/{key}",
            filename=filename,
            content_type=content_type,
            size=size,
        )

    async def download(self, key: str) -> bytes:
        """Download a file from S3."""
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                raise FileNotFoundError(f"File not found: {key}")
            raise

    async def delete(self, key: str) -> bool:
        """Delete a file from S3."""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get a presigned URL for a file."""
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
            return url
        except ClientError:
            # Fall back to public URL
            return f"{self.public_url}/{key}"

    async def exists(self, key: str) -> bool:
        """Check if a file exists in S3."""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    async def list_files(
        self, prefix: str = "", max_keys: int = 1000
    ) -> list[StoredFile]:
        """List files in S3 with optional prefix."""
        files = []

        paginator = self.client.get_paginator("list_objects_v2")
        pages = paginator.paginate(
            Bucket=self.bucket,
            Prefix=prefix,
            PaginationConfig={"MaxItems": max_keys},
        )

        for page in pages:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                files.append(StoredFile(
                    key=key,
                    url=f"{self.public_url}/{key}",
                    filename=key.split("/")[-1],
                    content_type=self._guess_content_type(key),
                    size=obj["Size"],
                ))

        return files

    def _guess_content_type(self, filename: str) -> str:
        """Guess content type from filename extension."""
        import mimetypes
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or "application/octet-stream"
