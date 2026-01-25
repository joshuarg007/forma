"""Tests for schema parsing."""

import json
from pathlib import Path

import pytest

from forma_runtime.schema import (
    FieldType,
    SchemaParseError,
    SchemaParser,
    SchemaValidationError,
)


class TestSchemaParser:
    """Tests for SchemaParser."""

    def test_parse_valid_schema(self, blog_schema_path: Path):
        """Test parsing a valid schema."""
        parser = SchemaParser(blog_schema_path)
        schema = parser.parse()

        assert schema.version == "1.0"
        assert schema.name == "test-blog"
        assert "user" in schema.collections
        assert "post" in schema.collections
        assert "category" in schema.collections

    def test_parse_collections(self, parsed_schema):
        """Test that collections are parsed correctly."""
        user = parsed_schema.collections["user"]
        assert user.auth is True
        assert "email" in user.fields
        assert user.fields["email"].type == FieldType.EMAIL
        assert user.fields["email"].required is True
        assert user.fields["email"].unique is True

    def test_parse_relations(self, parsed_schema):
        """Test that relations are parsed correctly."""
        post = parsed_schema.collections["post"]
        author_field = post.fields["author"]

        assert author_field.type == FieldType.RELATION
        assert author_field.target == "user"
        assert author_field.relation.value == "many-to-one"

    def test_parse_enums(self, parsed_schema):
        """Test that enums are parsed correctly."""
        user = parsed_schema.collections["user"]
        role_field = user.fields["role"]

        assert role_field.type == FieldType.ENUM
        assert role_field.options == ["admin", "user"]
        assert role_field.default == "user"

    def test_file_not_found(self, tmp_path: Path):
        """Test error when schema file doesn't exist."""
        parser = SchemaParser(tmp_path / "nonexistent.json")

        with pytest.raises(SchemaParseError, match="not found"):
            parser.parse()

    def test_invalid_json(self, tmp_path: Path):
        """Test error when JSON is invalid."""
        schema_path = tmp_path / "invalid.json"
        schema_path.write_text("{ invalid json }")

        parser = SchemaParser(schema_path)

        with pytest.raises(SchemaParseError, match="Invalid JSON"):
            parser.parse()

    def test_invalid_relation_target(self, tmp_path: Path):
        """Test error when relation target doesn't exist."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "post": {
                    "fields": {
                        "author": {
                            "type": "relation",
                            "target": "nonexistent",
                            "relation": "many-to-one"
                        }
                    }
                }
            }
        }

        schema_path = tmp_path / "schema.json"
        schema_path.write_text(json.dumps(schema))

        parser = SchemaParser(schema_path)

        with pytest.raises(SchemaValidationError, match="does not exist"):
            parser.parse()

    def test_enum_without_options(self, tmp_path: Path):
        """Test error when enum field has no options."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "item": {
                    "fields": {
                        "status": {
                            "type": "enum"
                            # Missing options
                        }
                    }
                }
            }
        }

        schema_path = tmp_path / "schema.json"
        schema_path.write_text(json.dumps(schema))

        parser = SchemaParser(schema_path)

        with pytest.raises(SchemaValidationError, match="must have 'options'"):
            parser.parse()

    def test_get_auth_collection(self, parsed_schema):
        """Test getting the auth collection."""
        auth = parsed_schema.get_auth_collection()

        assert auth is not None
        name, collection = auth
        assert name == "user"
        assert collection.auth is True

    def test_caching(self, blog_schema_path: Path):
        """Test that schema is cached after first parse."""
        parser = SchemaParser(blog_schema_path)

        schema1 = parser.parse()
        schema2 = parser.parse()

        assert schema1 is schema2
