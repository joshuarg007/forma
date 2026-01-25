"""Pytest configuration and fixtures."""
import os
import pytest
from typing import Generator
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment before importing app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["ANTHROPIC_API_KEY"] = "test-key"

from app.main import app
from app.db.database import Base, get_db
from app.db.models import User, Project, PlanType
from app.core.security import get_password_hash, create_access_token


# Create test database engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db() -> Generator:
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db) -> Generator:
    """Create test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        name="Test User",
        plan=PlanType.STARTER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user) -> str:
    """Create access token for test user."""
    return create_access_token({"sub": str(test_user.id)})


@pytest.fixture
def auth_headers(test_user_token) -> dict:
    """Create authorization headers."""
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def test_project(db, test_user) -> Project:
    """Create a test project."""
    project = Project(
        id=uuid4(),
        user_id=test_user.id,
        name="Test Project",
        description="A test project",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@pytest.fixture
def second_user(db) -> User:
    """Create a second test user."""
    user = User(
        id=uuid4(),
        email="user2@example.com",
        password_hash=get_password_hash("password123"),
        name="Second User",
        plan=PlanType.STARTER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def second_user_token(second_user) -> str:
    """Create access token for second user."""
    return create_access_token({"sub": str(second_user.id)})
