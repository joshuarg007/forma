"""Tests for database model factory."""

import pytest
from sqlalchemy import inspect

from forma_runtime.db import ModelFactory
from forma_runtime.schema import FieldType


class TestModelFactory:
    """Tests for ModelFactory."""

    def test_generate_models(self, model_factory):
        """Test generating models from schema."""
        models = model_factory.generate_models()

        assert "user" in models
        assert "post" in models
        assert "category" in models

    def test_model_has_id(self, model_factory):
        """Test that models have id column."""
        models = model_factory.generate_models()

        User = models["user"]
        mapper = inspect(User)
        columns = {c.name for c in mapper.columns}

        assert "id" in columns

    def test_model_has_fields(self, model_factory):
        """Test that models have expected fields."""
        models = model_factory.generate_models()

        User = models["user"]
        mapper = inspect(User)
        columns = {c.name for c in mapper.columns}

        assert "email" in columns
        assert "password_hash" in columns
        assert "name" in columns
        assert "role" in columns

    def test_model_has_timestamps(self, model_factory):
        """Test that models with timestamps=True have timestamp columns."""
        models = model_factory.generate_models()

        Post = models["post"]
        mapper = inspect(Post)
        columns = {c.name for c in mapper.columns}

        assert "created_at" in columns
        assert "updated_at" in columns

    def test_model_without_timestamps(self, model_factory):
        """Test that models without explicit timestamps use defaults."""
        models = model_factory.generate_models()

        # Category doesn't have timestamps specified
        # Default is True, so it should have timestamps
        Category = models["category"]
        mapper = inspect(Category)
        columns = {c.name for c in mapper.columns}

        # Default timestamps=True means it should have these
        assert "created_at" in columns
        assert "updated_at" in columns

    def test_foreign_key_relation(self, model_factory):
        """Test that many-to-one relations create foreign key."""
        models = model_factory.generate_models()

        Post = models["post"]
        mapper = inspect(Post)
        columns = {c.name for c in mapper.columns}

        # Author is a many-to-one relation, should have author column
        assert "author" in columns

    def test_enum_field(self, model_factory):
        """Test that enum fields are created correctly."""
        models = model_factory.generate_models()

        User = models["user"]
        mapper = inspect(User)

        role_col = None
        for col in mapper.columns:
            if col.name == "role":
                role_col = col
                break

        assert role_col is not None
        # Check it's an enum type
        assert "ENUM" in str(type(role_col.type).__name__).upper() or "enum" in str(role_col.type).lower()

    def test_model_class_name(self, model_factory):
        """Test that model class names are PascalCase."""
        models = model_factory.generate_models()

        User = models["user"]
        Post = models["post"]
        Category = models["category"]

        assert User.__name__ == "User"
        assert Post.__name__ == "Post"
        assert Category.__name__ == "Category"

    def test_table_name(self, model_factory):
        """Test that table names match collection names."""
        models = model_factory.generate_models()

        User = models["user"]
        Post = models["post"]

        assert User.__tablename__ == "user"
        assert Post.__tablename__ == "post"

    def test_get_model(self, model_factory):
        """Test getting a model by name."""
        model_factory.generate_models()

        User = model_factory.get_model("user")
        assert User is not None
        assert User.__name__ == "User"

        NonExistent = model_factory.get_model("nonexistent")
        assert NonExistent is None
