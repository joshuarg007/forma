"""Comprehensive tests for AI Schema Validator.

Tests cover:
1. Structural validation (schema format, field types, relations)
2. Security validation (dangerous fields, auth requirements)
3. Breaking change detection (dropped collections, type changes)
4. AI review integration (when available)
5. Edge cases and error handling
"""

import pytest
from forma_runtime.ai import (
    SchemaValidator,
    ValidationResult,
    ValidationIssue,
    IssueSeverity,
    IssueCategory,
)


# =============================================================================
# TEST FIXTURES
# =============================================================================

@pytest.fixture
def validator():
    """Create a validator instance (AI disabled for unit tests)."""
    return SchemaValidator()


@pytest.fixture
def valid_blog_schema():
    """A valid blog schema with users, posts, and comments."""
    return {
        "version": "1.0",
        "name": "blog-app",
        "collections": {
            "user": {
                "auth": True,
                "timestamps": True,
                "fields": {
                    "email": {"type": "email", "required": True, "unique": True},
                    "name": {"type": "text", "required": True},
                    "role": {"type": "enum", "options": ["admin", "author", "reader"], "default": "reader"},
                    "bio": {"type": "text"},
                }
            },
            "post": {
                "timestamps": True,
                "fields": {
                    "title": {"type": "text", "required": True},
                    "slug": {"type": "text", "unique": True},
                    "content": {"type": "richtext", "required": True},
                    "status": {"type": "enum", "options": ["draft", "published", "archived"], "default": "draft"},
                    "author": {"type": "relation", "target": "user", "relation": "many-to-one"},
                }
            },
            "comment": {
                "timestamps": True,
                "fields": {
                    "content": {"type": "text", "required": True},
                    "post": {"type": "relation", "target": "post", "relation": "many-to-one"},
                    "author": {"type": "relation", "target": "user", "relation": "many-to-one"},
                }
            },
            "category": {
                "timestamps": True,
                "fields": {
                    "name": {"type": "text", "required": True, "unique": True},
                    "slug": {"type": "text", "unique": True},
                    "posts": {"type": "relation", "target": "post", "relation": "many-to-many"},
                }
            }
        }
    }


@pytest.fixture
def minimal_valid_schema():
    """Minimal valid schema with just a user collection."""
    return {
        "version": "1.0",
        "name": "minimal-app",
        "collections": {
            "user": {
                "auth": True,
                "fields": {
                    "email": {"type": "email", "required": True, "unique": True},
                }
            }
        }
    }


# =============================================================================
# STRUCTURAL VALIDATION TESTS
# =============================================================================

class TestStructuralValidation:
    """Test structural schema validation."""

    def test_valid_schema_passes(self, validator, valid_blog_schema):
        """Valid schema should pass with no critical issues."""
        result = validator.validate(valid_blog_schema, use_ai=False)
        assert result.can_deploy
        assert len(result.critical_issues) == 0

    def test_missing_collections_field(self, validator):
        """Schema without collections should fail."""
        schema = {"version": "1.0", "name": "test"}
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "collections" in i.message.lower()
            for i in result.issues
        )

    def test_empty_collections(self, validator):
        """Schema with empty collections should fail."""
        schema = {"version": "1.0", "name": "test", "collections": {}}
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "no collections" in i.message.lower()
            for i in result.issues
        )

    def test_missing_version_warning(self, validator, minimal_valid_schema):
        """Missing version should produce warning."""
        del minimal_valid_schema["version"]
        result = validator.validate(minimal_valid_schema, use_ai=False)
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING and "version" in i.message.lower()
            for i in result.issues
        )

    def test_missing_name_warning(self, validator, minimal_valid_schema):
        """Missing name should produce warning."""
        del minimal_valid_schema["name"]
        result = validator.validate(minimal_valid_schema, use_ai=False)
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING and "name" in i.message.lower()
            for i in result.issues
        )

    def test_field_without_type(self, validator):
        """Field without type should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        "name": {"required": True}  # Missing type!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "no type" in i.message.lower()
            for i in result.issues
        )

    def test_collection_without_fields_warning(self, validator):
        """Collection without fields should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "empty_collection": {}
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING and "no fields" in i.message.lower()
            for i in result.issues
        )

    def test_invalid_collection_definition(self, validator):
        """Collection that's not a dict should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "bad_collection": "not a dict"
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "not a valid object" in i.message.lower()
            for i in result.issues
        )

    def test_invalid_field_definition(self, validator):
        """Field that's not a dict should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        "bad_field": "not a dict"
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "not a valid object" in i.message.lower()
            for i in result.issues
        )


# =============================================================================
# RELATION VALIDATION TESTS
# =============================================================================

class TestRelationValidation:
    """Test relation field validation."""

    def test_valid_relation(self, validator, valid_blog_schema):
        """Valid relations should pass."""
        result = validator.validate(valid_blog_schema, use_ai=False)
        assert result.can_deploy
        # No relation-related critical issues
        assert not any(
            i.severity == IssueSeverity.CRITICAL and "relation" in i.message.lower()
            for i in result.issues
        )

    def test_relation_without_target(self, validator):
        """Relation without target should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "post": {
                    "fields": {
                        "author": {"type": "relation", "relation": "many-to-one"}
                        # Missing target!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "no target" in i.message.lower()
            for i in result.issues
        )

    def test_relation_to_nonexistent_collection(self, validator):
        """Relation to non-existent collection should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "post": {
                    "fields": {
                        "author": {
                            "type": "relation",
                            "target": "user",  # user doesn't exist!
                            "relation": "many-to-one"
                        }
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "non-existent" in i.message.lower()
            for i in result.issues
        )

    def test_self_referencing_relation(self, validator):
        """Self-referencing relations should be valid."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "category": {
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "parent": {
                            "type": "relation",
                            "target": "category",  # Self-reference
                            "relation": "many-to-one"
                        }
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy


# =============================================================================
# ENUM VALIDATION TESTS
# =============================================================================

class TestEnumValidation:
    """Test enum field validation."""

    def test_valid_enum(self, validator, valid_blog_schema):
        """Valid enums should pass."""
        result = validator.validate(valid_blog_schema, use_ai=False)
        assert result.can_deploy

    def test_enum_without_options(self, validator):
        """Enum without options should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        "status": {"type": "enum"}  # Missing options!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "no options" in i.message.lower()
            for i in result.issues
        )

    def test_enum_with_empty_options(self, validator):
        """Enum with empty options array should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        "status": {"type": "enum", "options": []}
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy


# =============================================================================
# SECURITY VALIDATION TESTS
# =============================================================================

class TestSecurityValidation:
    """Test security-related validation."""

    def test_no_auth_collection_info(self, validator):
        """Schema without auth collection should produce info."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        "name": {"type": "text", "required": True}
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy  # Info, not blocking
        assert any(
            i.severity == IssueSeverity.INFO and "no auth collection" in i.message.lower()
            for i in result.issues
        )

    def test_multiple_auth_collections_warning(self, validator):
        """Multiple auth collections should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True}
                    }
                },
                "admin": {
                    "auth": True,  # Second auth collection!
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True}
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING and "multiple auth" in i.message.lower()
            for i in result.issues
        )

    def test_auth_collection_missing_email(self, validator):
        """Auth collection without email field should fail."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "name": {"type": "text", "required": True}
                        # Missing email field!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL and "email" in i.message.lower()
            for i in result.issues
        )

    def test_dangerous_field_password(self, validator):
        """Field named 'password' should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "password": {"type": "text"}  # Dangerous!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING and "password" in i.message.lower()
            for i in result.issues
        )

    def test_dangerous_field_api_key(self, validator):
        """Field with 'api_key' should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "settings": {
                    "fields": {
                        "openai_api_key": {"type": "text"}  # Dangerous!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert any(
            i.severity == IssueSeverity.WARNING and "api" in i.message.lower()
            for i in result.issues
        )

    def test_dangerous_field_secret(self, validator):
        """Field with 'secret' should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "settings": {
                    "fields": {
                        "client_secret": {"type": "text"}  # Dangerous!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert any(
            i.severity == IssueSeverity.WARNING and "secret" in i.message.lower()
            for i in result.issues
        )

    def test_dangerous_field_ssn(self, validator):
        """Field with 'ssn' should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "employees": {
                    "fields": {
                        "ssn": {"type": "text"}  # Dangerous!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert any(
            i.severity == IssueSeverity.WARNING and "ssn" in i.message.lower()
            for i in result.issues
        )

    def test_dangerous_field_credit_card(self, validator):
        """Field with 'credit_card' should produce warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "payments": {
                    "fields": {
                        "credit_card_number": {"type": "text"}  # Dangerous!
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert any(
            i.severity == IssueSeverity.WARNING and "credit" in i.message.lower()
            for i in result.issues
        )

    def test_admin_field_bypasses_security_warning(self, validator):
        """Fields marked as admin should not trigger security warning."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "settings": {
                    "fields": {
                        "api_key": {"type": "text", "admin": True}  # Marked admin
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        # Should NOT have api_key warning since it's admin-only
        assert not any(
            i.severity == IssueSeverity.WARNING
            and "api" in i.message.lower()
            and "api_key" in (i.field_path or "")
            for i in result.issues
        )


# =============================================================================
# BREAKING CHANGE DETECTION TESTS
# =============================================================================

class TestBreakingChangeDetection:
    """Test detection of breaking changes between schemas."""

    def test_no_changes(self, validator, valid_blog_schema):
        """Identical schemas should have no breaking changes."""
        result = validator.validate(
            valid_blog_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert result.can_deploy
        assert not any(
            i.category == IssueCategory.BREAKING_CHANGE
            for i in result.issues
        )

    def test_dropped_collection(self, validator, valid_blog_schema):
        """Dropping a collection should be critical."""
        new_schema = {
            "version": "1.0",
            "name": "blog-app",
            "collections": {
                "user": valid_blog_schema["collections"]["user"],
                "post": valid_blog_schema["collections"]["post"],
                # comment collection dropped!
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL
            and i.category == IssueCategory.BREAKING_CHANGE
            and "comment" in i.message.lower()
            for i in result.issues
        )

    def test_dropped_field(self, validator, valid_blog_schema):
        """Dropping a field should be critical."""
        new_schema = {
            "version": "1.0",
            "name": "blog-app",
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        # role field dropped!
                        # bio field dropped!
                    }
                },
                "post": valid_blog_schema["collections"]["post"],
                "comment": valid_blog_schema["collections"]["comment"],
                "category": valid_blog_schema["collections"]["category"],
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL
            and i.category == IssueCategory.BREAKING_CHANGE
            and "role" in i.message.lower()
            for i in result.issues
        )

    def test_type_change(self, validator, valid_blog_schema):
        """Changing field type should be critical."""
        new_schema = {
            "version": "1.0",
            "name": "blog-app",
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "integer"},  # Changed from text to integer!
                        "role": {"type": "enum", "options": ["admin", "author", "reader"], "default": "reader"},
                        "bio": {"type": "text"},
                    }
                },
                "post": valid_blog_schema["collections"]["post"],
                "comment": valid_blog_schema["collections"]["comment"],
                "category": valid_blog_schema["collections"]["category"],
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert not result.can_deploy
        assert any(
            i.severity == IssueSeverity.CRITICAL
            and i.category == IssueCategory.BREAKING_CHANGE
            and "type changed" in i.message.lower()
            for i in result.issues
        )

    def test_adding_required_to_existing_field(self, validator, valid_blog_schema):
        """Making an optional field required should be warning."""
        new_schema = {
            "version": "1.0",
            "name": "blog-app",
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "role": {"type": "enum", "options": ["admin", "author", "reader"], "default": "reader"},
                        "bio": {"type": "text", "required": True},  # Was optional, now required!
                    }
                },
                "post": valid_blog_schema["collections"]["post"],
                "comment": valid_blog_schema["collections"]["comment"],
                "category": valid_blog_schema["collections"]["category"],
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert result.can_deploy  # Warning, not critical
        assert any(
            i.severity == IssueSeverity.WARNING
            and i.category == IssueCategory.BREAKING_CHANGE
            and "now required" in i.message.lower()
            for i in result.issues
        )

    def test_adding_new_collection_is_safe(self, validator, valid_blog_schema):
        """Adding a new collection should not be a breaking change."""
        new_schema = {
            **valid_blog_schema,
            "collections": {
                **valid_blog_schema["collections"],
                "tag": {  # New collection
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                    }
                }
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert result.can_deploy
        # No breaking change issues for adding collection
        assert not any(
            i.category == IssueCategory.BREAKING_CHANGE
            and "tag" in i.message.lower()
            for i in result.issues
        )

    def test_adding_new_optional_field_is_safe(self, validator, valid_blog_schema):
        """Adding a new optional field should not be a breaking change."""
        new_schema = {
            "version": "1.0",
            "name": "blog-app",
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "role": {"type": "enum", "options": ["admin", "author", "reader"], "default": "reader"},
                        "bio": {"type": "text"},
                        "avatar_url": {"type": "text"},  # New optional field
                    }
                },
                "post": valid_blog_schema["collections"]["post"],
                "comment": valid_blog_schema["collections"]["comment"],
                "category": valid_blog_schema["collections"]["category"],
            }
        }
        result = validator.validate(
            new_schema,
            existing_schema=valid_blog_schema,
            use_ai=False
        )
        assert result.can_deploy
        # No breaking change for new optional field
        assert not any(
            i.category == IssueCategory.BREAKING_CHANGE
            and "avatar" in i.message.lower()
            for i in result.issues
        )


# =============================================================================
# VALIDATION RESULT TESTS
# =============================================================================

class TestValidationResult:
    """Test ValidationResult helper methods."""

    def test_can_deploy_with_no_issues(self, validator, minimal_valid_schema):
        """can_deploy should be True with no critical issues."""
        result = validator.validate(minimal_valid_schema, use_ai=False)
        assert result.can_deploy

    def test_can_deploy_with_warnings(self, validator):
        """can_deploy should be True with only warnings."""
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "password_hint": {"type": "text"}  # Warning-level issue
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy
        assert len(result.warnings) > 0

    def test_cannot_deploy_with_critical(self, validator):
        """can_deploy should be False with critical issues."""
        schema = {"version": "1.0", "name": "test"}  # Missing collections
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy
        assert len(result.critical_issues) > 0

    def test_to_dict_format(self, validator, minimal_valid_schema):
        """to_dict should return proper format."""
        result = validator.validate(minimal_valid_schema, use_ai=False)
        d = result.to_dict()

        assert "valid" in d
        assert "can_deploy" in d
        assert "issues" in d
        assert "summary" in d
        assert isinstance(d["issues"], list)
        assert "critical" in d["summary"]
        assert "warnings" in d["summary"]
        assert "info" in d["summary"]


# =============================================================================
# EDGE CASES
# =============================================================================

class TestEdgeCases:
    """Test edge cases and unusual inputs."""

    def test_empty_schema(self, validator):
        """Empty dict should fail gracefully."""
        result = validator.validate({}, use_ai=False)
        assert not result.can_deploy

    def test_null_collections(self, validator):
        """None collections should fail gracefully."""
        schema = {"version": "1.0", "name": "test", "collections": None}
        result = validator.validate(schema, use_ai=False)
        assert not result.can_deploy

    def test_deeply_nested_valid_schema(self, validator):
        """Complex schema with many collections and relations should work."""
        schema = {
            "version": "1.0",
            "name": "complex-app",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                    }
                },
                "organization": {
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "owner": {"type": "relation", "target": "user", "relation": "many-to-one"},
                    }
                },
                "team": {
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "organization": {"type": "relation", "target": "organization", "relation": "many-to-one"},
                        "members": {"type": "relation", "target": "user", "relation": "many-to-many"},
                    }
                },
                "project": {
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "team": {"type": "relation", "target": "team", "relation": "many-to-one"},
                    }
                },
                "task": {
                    "fields": {
                        "title": {"type": "text", "required": True},
                        "project": {"type": "relation", "target": "project", "relation": "many-to-one"},
                        "assignee": {"type": "relation", "target": "user", "relation": "many-to-one"},
                        "parent": {"type": "relation", "target": "task", "relation": "many-to-one"},
                    }
                },
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy

    def test_unicode_names(self, validator):
        """Unicode in names should work."""
        schema = {
            "version": "1.0",
            "name": "日本語アプリ",
            "collections": {
                "utilisateur": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "prénom": {"type": "text"},
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy

    def test_very_long_field_names(self, validator):
        """Very long field names should work."""
        long_name = "a" * 200
        schema = {
            "version": "1.0",
            "name": "test",
            "collections": {
                "items": {
                    "fields": {
                        long_name: {"type": "text"}
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy

    def test_special_characters_in_names(self, validator):
        """Special characters in names should work (validator doesn't restrict)."""
        schema = {
            "version": "1.0",
            "name": "test-app_v2",
            "collections": {
                "my_items_v2": {
                    "fields": {
                        "field_name_123": {"type": "text"}
                    }
                }
            }
        }
        result = validator.validate(schema, use_ai=False)
        assert result.can_deploy


# =============================================================================
# AI INTEGRATION TESTS (require Ollama running)
# =============================================================================

class TestAIIntegration:
    """Tests that require Ollama to be running.

    These tests are marked to skip if Ollama is not available.
    """

    @pytest.fixture
    def ai_validator(self):
        """Create validator with AI enabled."""
        return SchemaValidator(
            model="qwen2.5-coder:32b",
            host="http://localhost:11434"
        )

    def _ollama_available(self, validator) -> bool:
        """Check if Ollama is available."""
        try:
            validator.client.list()
            return True
        except Exception:
            return False

    def test_ai_review_valid_schema(self, ai_validator, valid_blog_schema):
        """AI should review valid schema without critical issues."""
        if not self._ollama_available(ai_validator):
            pytest.skip("Ollama not available")

        result = ai_validator.validate(valid_blog_schema, use_ai=True)
        # AI might find suggestions but shouldn't block a valid schema
        assert result.can_deploy
        assert result.ai_review is not None

    def test_ai_review_security_issues(self, ai_validator):
        """AI should detect security issues."""
        if not self._ollama_available(ai_validator):
            pytest.skip("Ollama not available")

        schema = {
            "version": "1.0",
            "name": "insecure-app",
            "collections": {
                "user": {
                    "auth": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "password": {"type": "text"},  # Storing plaintext password!
                        "ssn": {"type": "text"},  # Sensitive data
                    }
                }
            }
        }
        result = ai_validator.validate(schema, use_ai=True)
        assert result.ai_review is not None
        # Should have security-related warnings
        assert any(
            i.category == IssueCategory.SECURITY
            for i in result.issues
        )

    def test_ai_graceful_failure(self, ai_validator, minimal_valid_schema):
        """Validator should handle AI failure gracefully."""
        # Use invalid host to simulate failure
        bad_validator = SchemaValidator(
            model="qwen2.5-coder:32b",
            host="http://localhost:99999"  # Invalid port
        )

        result = bad_validator.validate(minimal_valid_schema, use_ai=True)
        # Should still validate structure, just warn about AI unavailable
        assert result.can_deploy
        assert any(
            "unavailable" in i.message.lower()
            for i in result.issues
        )


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
