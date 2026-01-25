"""Database engine and session management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from ..config import settings


def get_database_url() -> str:
    """
    Get the async database URL.

    Converts standard URLs to async driver URLs.
    """
    url = settings.database_url

    # Convert to async drivers
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("sqlite://"):
        url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    return url


def create_engine() -> AsyncEngine:
    """Create the async database engine."""
    url = get_database_url()

    # Use NullPool for SQLite (doesn't support connection pooling)
    pool_class = NullPool if "sqlite" in url else None

    return create_async_engine(
        url,
        poolclass=pool_class,
        echo=settings.debug,
    )


# Global engine instance
engine: AsyncEngine | None = None


def get_engine() -> AsyncEngine:
    """Get or create the database engine."""
    global engine
    if engine is None:
        engine = create_engine()
    return engine


def create_session_factory(eng: AsyncEngine | None = None) -> async_sessionmaker[AsyncSession]:
    """Create an async session factory."""
    if eng is None:
        eng = get_engine()

    return async_sessionmaker(
        eng,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


# Global session factory
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get or create the session factory."""
    global _session_factory
    if _session_factory is None:
        _session_factory = create_session_factory()
    return _session_factory


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions.

    Usage in FastAPI:
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_session)):
            ...
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def dispose_engine() -> None:
    """Dispose of the database engine."""
    global engine, _session_factory
    if engine is not None:
        await engine.dispose()
        engine = None
        _session_factory = None
