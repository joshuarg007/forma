"""Configuration settings for Forma Runtime."""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./app.db",
        description="Database connection URL",
    )

    # Schema
    schema_path: str = Field(
        default="schema.json",
        description="Path to the schema.json file",
    )

    # Server
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=False)

    # API
    api_prefix: str = Field(default="/api")

    # Auth
    jwt_secret: str = Field(
        default="change-me-in-production-use-a-real-secret-key",
        description="Secret key for JWT token signing",
    )
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=7)

    # Storage
    storage_provider: str = Field(
        default="local",
        description="Storage provider: local, s3",
    )
    storage_path: str = Field(
        default="./uploads",
        description="Local storage path",
    )
    s3_bucket: str | None = Field(default=None)
    s3_region: str | None = Field(default=None)
    s3_access_key: str | None = Field(default=None)
    s3_secret_key: str | None = Field(default=None)
    s3_endpoint: str | None = Field(
        default=None,
        description="Custom S3 endpoint for MinIO/R2",
    )

    # CORS
    cors_origins: list[str] = Field(default=["*"])
    cors_credentials: bool = Field(default=True)

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
