"""Pytest configuration and fixtures."""

import asyncio
from pathlib import Path

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from forma_runtime.db import ModelFactory
from forma_runtime.schema import SchemaParser


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def blog_schema_path(tmp_path: Path) -> Path:
    """Create a test blog schema."""
    schema = {
        "version": "1.0",
        "name": "test-blog",
        "collections": {
            "user": {
                "auth": True,
                "fields": {
                    "email": {"type": "email", "required": True, "unique": True},
                    "password_hash": {"type": "text", "required": True},
                    "name": {"type": "text"},
                    "role": {"type": "enum", "options": ["admin", "user"], "default": "user"}
                }
            },
            "post": {
                "timestamps": True,
                "fields": {
                    "title": {"type": "text", "required": True},
                    "content": {"type": "richtext"},
                    "author": {"type": "relation", "target": "user", "relation": "many-to-one"},
                    "status": {"type": "enum", "options": ["draft", "published"], "default": "draft"}
                }
            },
            "category": {
                "fields": {
                    "name": {"type": "text", "required": True},
                    "slug": {"type": "text", "unique": True}
                }
            }
        }
    }

    import json
    schema_path = tmp_path / "schema.json"
    schema_path.write_text(json.dumps(schema))
    return schema_path


@pytest.fixture
def parsed_schema(blog_schema_path: Path):
    """Parse the test schema."""
    parser = SchemaParser(blog_schema_path)
    return parser.parse()


@pytest.fixture
def model_factory(parsed_schema):
    """Create a model factory with fresh base for each test."""
    return ModelFactory(parsed_schema)


@pytest_asyncio.fixture
async def async_engine():
    """Create an in-memory SQLite engine for testing."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def async_session(async_engine, model_factory):
    """Create a database session for testing."""
    models = model_factory.generate_models()

    async with async_engine.begin() as conn:
        await conn.run_sync(model_factory.base.metadata.create_all)

    session_factory = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_factory() as session:
        yield session
