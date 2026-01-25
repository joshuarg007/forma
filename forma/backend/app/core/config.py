"""FORMA Configuration"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "FORMA"
    debug: bool = False

    # Database (SQLite for local dev, PostgreSQL for production)
    database_url: str = "sqlite:///./forma.db"

    # Auth
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # AI (Anthropic) - Disabled, using TensorFlow.js locally
    # These settings are kept for backward compatibility but are not used
    anthropic_api_key: str = ""  # Optional, not required
    anthropic_model: str = "disabled"  # Not used

    # Stripe
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_pro: str = ""
    stripe_price_team: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:3000/auth/github/callback"

    # Email (SendGrid)
    sendgrid_api_key: str = ""
    from_email: str = "noreply@forma.app"

    # Cloudflare Pages (Forma Hosting)
    cloudflare_api_token: str = ""  # Cloudflare API token with Pages permissions
    cloudflare_account_id: str = ""  # Cloudflare account ID
    forma_domain: str = "forma.app"  # Base domain for subdomains
    build_timeout_seconds: int = 300  # 5 minute build timeout
    max_concurrent_builds: int = 5  # Max concurrent builds

    # Hosting Limits per plan
    free_sites_limit: int = 1
    starter_sites_limit: int = 3
    pro_sites_limit: int = 10
    team_sites_limit: int = 100

    # File Storage
    upload_dir: str = "./uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    # Usage Limits
    starter_ops_limit: int = 100
    pro_ops_limit: int = 500
    team_ops_limit: int = 2000
    overage_rate: float = 0.05  # $0.05 per operation

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
