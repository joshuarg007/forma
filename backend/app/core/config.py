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

    # AI (Anthropic)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # Stripe
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_pro: str = ""
    stripe_price_team: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

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
