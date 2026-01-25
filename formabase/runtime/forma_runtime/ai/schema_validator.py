"""AI-powered schema validation with safety rails."""

import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .prompts import SCHEMA_VALIDATION_SYSTEM, SCHEMA_VALIDATION_USER


class IssueSeverity(str, Enum):
    """Severity level of a validation issue."""
    CRITICAL = "critical"  # Blocks deployment
    WARNING = "warning"    # Shows warning but allows deployment
    INFO = "info"          # Informational suggestion


class IssueCategory(str, Enum):
    """Category of validation issue."""
    SECURITY = "security"
    BREAKING_CHANGE = "breaking_change"
    BEST_PRACTICE = "best_practice"
    STRUCTURE = "structure"
    PERFORMANCE = "performance"


@dataclass
class ValidationIssue:
    """A single validation issue found in the schema."""
    severity: IssueSeverity
    category: IssueCategory
    message: str
    field_path: str | None = None  # e.g., "collections.user.fields.password"
    suggestion: str | None = None


@dataclass
class ValidationResult:
    """Result of schema validation."""
    valid: bool
    issues: list[ValidationIssue] = field(default_factory=list)
    ai_review: str | None = None  # Full AI review text

    @property
    def critical_issues(self) -> list[ValidationIssue]:
        return [i for i in self.issues if i.severity == IssueSeverity.CRITICAL]

    @property
    def warnings(self) -> list[ValidationIssue]:
        return [i for i in self.issues if i.severity == IssueSeverity.WARNING]

    @property
    def can_deploy(self) -> bool:
        """Returns True if there are no critical issues."""
        return len(self.critical_issues) == 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "valid": self.valid,
            "can_deploy": self.can_deploy,
            "issues": [
                {
                    "severity": i.severity.value,
                    "category": i.category.value,
                    "message": i.message,
                    "field_path": i.field_path,
                    "suggestion": i.suggestion,
                }
                for i in self.issues
            ],
            "ai_review": self.ai_review,
            "summary": {
                "critical": len(self.critical_issues),
                "warnings": len(self.warnings),
                "info": len([i for i in self.issues if i.severity == IssueSeverity.INFO]),
            }
        }


class SchemaValidator:
    """Validate Formabase schemas with AI-powered safety rails."""

    def __init__(
        self,
        model: str = "qwen2.5-coder:32b",
        host: str = "http://localhost:11434",
    ):
        self.model = model
        self.host = host
        self._client = None

    @property
    def client(self):
        """Lazy-load Ollama client."""
        if self._client is None:
            try:
                import ollama
                self._client = ollama.Client(host=self.host)
            except ImportError:
                raise ImportError("ollama package not installed. Run: pip install ollama")
        return self._client

    def validate(
        self,
        schema: dict[str, Any],
        existing_schema: dict[str, Any] | None = None,
        use_ai: bool = True,
    ) -> ValidationResult:
        """
        Validate a schema for deployment.

        Args:
            schema: The new schema to validate
            existing_schema: Previous schema (for breaking change detection)
            use_ai: Whether to use AI for deep review

        Returns:
            ValidationResult with issues found
        """
        issues: list[ValidationIssue] = []

        # Phase 1: Structural validation (fast, no AI)
        issues.extend(self._validate_structure(schema))

        # Phase 2: Security checks (fast, no AI)
        issues.extend(self._validate_security(schema))

        # Phase 3: Breaking change detection (if existing schema provided)
        if existing_schema:
            issues.extend(self._detect_breaking_changes(schema, existing_schema))

        # Phase 4: AI-powered deep review (slower, but more comprehensive)
        ai_review = None
        if use_ai:
            try:
                ai_issues, ai_review = self._ai_review(schema, existing_schema)
                issues.extend(ai_issues)
            except Exception as e:
                # If AI fails, add a warning but don't block
                issues.append(ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.STRUCTURE,
                    message=f"AI review unavailable: {str(e)}",
                    suggestion="Ensure Ollama is running for full validation"
                ))

        # Determine overall validity
        valid = all(i.severity != IssueSeverity.CRITICAL for i in issues)

        return ValidationResult(valid=valid, issues=issues, ai_review=ai_review)

    def _validate_structure(self, schema: dict[str, Any]) -> list[ValidationIssue]:
        """Validate basic schema structure."""
        issues = []

        # Check required top-level fields
        if "version" not in schema:
            issues.append(ValidationIssue(
                severity=IssueSeverity.WARNING,
                category=IssueCategory.STRUCTURE,
                message="Missing 'version' field",
                suggestion="Add 'version': '1.0' to your schema"
            ))

        if "name" not in schema:
            issues.append(ValidationIssue(
                severity=IssueSeverity.WARNING,
                category=IssueCategory.STRUCTURE,
                message="Missing 'name' field",
                suggestion="Add a 'name' field to identify your schema"
            ))

        if "collections" not in schema:
            issues.append(ValidationIssue(
                severity=IssueSeverity.CRITICAL,
                category=IssueCategory.STRUCTURE,
                message="Missing 'collections' field - schema has no data models",
                suggestion="Add at least one collection to your schema"
            ))
            return issues  # Can't continue without collections

        collections = schema.get("collections", {})

        if not collections:
            issues.append(ValidationIssue(
                severity=IssueSeverity.CRITICAL,
                category=IssueCategory.STRUCTURE,
                message="Schema has no collections defined",
                suggestion="Add at least one collection with fields"
            ))
            return issues

        # Validate each collection
        for coll_name, collection in collections.items():
            if not isinstance(collection, dict):
                issues.append(ValidationIssue(
                    severity=IssueSeverity.CRITICAL,
                    category=IssueCategory.STRUCTURE,
                    message=f"Collection '{coll_name}' is not a valid object",
                    field_path=f"collections.{coll_name}"
                ))
                continue

            fields = collection.get("fields", {})
            if not fields:
                issues.append(ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.STRUCTURE,
                    message=f"Collection '{coll_name}' has no fields",
                    field_path=f"collections.{coll_name}",
                    suggestion="Add fields to make this collection useful"
                ))

            # Validate fields
            for field_name, field_def in fields.items():
                if not isinstance(field_def, dict):
                    issues.append(ValidationIssue(
                        severity=IssueSeverity.CRITICAL,
                        category=IssueCategory.STRUCTURE,
                        message=f"Field '{field_name}' in '{coll_name}' is not a valid object",
                        field_path=f"collections.{coll_name}.fields.{field_name}"
                    ))
                    continue

                if "type" not in field_def:
                    issues.append(ValidationIssue(
                        severity=IssueSeverity.CRITICAL,
                        category=IssueCategory.STRUCTURE,
                        message=f"Field '{field_name}' in '{coll_name}' has no type",
                        field_path=f"collections.{coll_name}.fields.{field_name}",
                        suggestion="Add a 'type' property (text, email, integer, etc.)"
                    ))

                # Check relation targets exist
                if field_def.get("type") == "relation":
                    target = field_def.get("target")
                    if not target:
                        issues.append(ValidationIssue(
                            severity=IssueSeverity.CRITICAL,
                            category=IssueCategory.STRUCTURE,
                            message=f"Relation field '{field_name}' has no target",
                            field_path=f"collections.{coll_name}.fields.{field_name}",
                            suggestion="Add a 'target' property pointing to another collection"
                        ))
                    elif target not in collections:
                        issues.append(ValidationIssue(
                            severity=IssueSeverity.CRITICAL,
                            category=IssueCategory.STRUCTURE,
                            message=f"Relation field '{field_name}' targets non-existent collection '{target}'",
                            field_path=f"collections.{coll_name}.fields.{field_name}",
                            suggestion=f"Create collection '{target}' or fix the target"
                        ))

                # Check enum has options
                if field_def.get("type") == "enum" and not field_def.get("options"):
                    issues.append(ValidationIssue(
                        severity=IssueSeverity.CRITICAL,
                        category=IssueCategory.STRUCTURE,
                        message=f"Enum field '{field_name}' has no options",
                        field_path=f"collections.{coll_name}.fields.{field_name}",
                        suggestion="Add 'options': ['value1', 'value2'] to the field"
                    ))

        return issues

    def _validate_security(self, schema: dict[str, Any]) -> list[ValidationIssue]:
        """Check for security issues."""
        issues = []
        collections = schema.get("collections", {})

        # Handle None or invalid collections
        if not collections or not isinstance(collections, dict):
            return issues  # Structural validation will catch this

        # Check for auth collection (skip non-dict collections)
        auth_collections = [
            name for name, coll in collections.items()
            if isinstance(coll, dict) and coll.get("auth") is True
        ]

        if not auth_collections:
            issues.append(ValidationIssue(
                severity=IssueSeverity.INFO,
                category=IssueCategory.SECURITY,
                message="No auth collection defined",
                suggestion="Add 'auth': true to a user collection for authentication"
            ))
        elif len(auth_collections) > 1:
            issues.append(ValidationIssue(
                severity=IssueSeverity.WARNING,
                category=IssueCategory.SECURITY,
                message=f"Multiple auth collections: {auth_collections}",
                suggestion="Only one collection should have 'auth': true"
            ))

        # Check auth collection has email field
        for auth_coll in auth_collections:
            fields = collections[auth_coll].get("fields", {})
            if "email" not in fields:
                issues.append(ValidationIssue(
                    severity=IssueSeverity.CRITICAL,
                    category=IssueCategory.SECURITY,
                    message=f"Auth collection '{auth_coll}' missing required 'email' field",
                    field_path=f"collections.{auth_coll}",
                    suggestion="Add an 'email' field with type 'email' and unique: true"
                ))

        # Check for dangerous field names
        dangerous_patterns = [
            ("password", "Storing plain text passwords is insecure"),
            ("secret", "Secret fields should not be in the schema"),
            ("api_key", "API keys should be stored securely, not in user data"),
            ("credit_card", "Credit card data requires PCI compliance"),
            ("ssn", "SSN data requires special handling"),
        ]

        for coll_name, collection in collections.items():
            # Skip non-dict collections (structural validation handles this)
            if not isinstance(collection, dict):
                continue
            fields = collection.get("fields", {})
            if not isinstance(fields, dict):
                continue
            for field_name, field_def in fields.items():
                if not isinstance(field_def, dict):
                    continue
                field_lower = field_name.lower()
                for pattern, message in dangerous_patterns:
                    if pattern in field_lower:
                        # Skip if it's specifically marked as admin-only
                        if field_def.get("admin"):
                            continue
                        issues.append(ValidationIssue(
                            severity=IssueSeverity.WARNING,
                            category=IssueCategory.SECURITY,
                            message=f"Potentially sensitive field '{field_name}': {message}",
                            field_path=f"collections.{coll_name}.fields.{field_name}",
                            suggestion="Consider using the auth system's built-in password handling"
                        ))

        return issues

    def _detect_breaking_changes(
        self,
        new_schema: dict[str, Any],
        old_schema: dict[str, Any]
    ) -> list[ValidationIssue]:
        """Detect breaking changes between schemas."""
        issues = []

        old_collections = set(old_schema.get("collections", {}).keys())
        new_collections = set(new_schema.get("collections", {}).keys())

        # Dropped collections
        dropped = old_collections - new_collections
        for coll in dropped:
            issues.append(ValidationIssue(
                severity=IssueSeverity.CRITICAL,
                category=IssueCategory.BREAKING_CHANGE,
                message=f"Collection '{coll}' was removed - this will delete all data!",
                field_path=f"collections.{coll}",
                suggestion="Keep the collection or migrate data first"
            ))

        # Check each existing collection for changes
        for coll_name in old_collections & new_collections:
            old_coll = old_schema["collections"][coll_name]
            new_coll = new_schema["collections"].get(coll_name, {})

            old_fields = set(old_coll.get("fields", {}).keys())
            new_fields = set(new_coll.get("fields", {}).keys())

            # Dropped fields (with data)
            dropped_fields = old_fields - new_fields
            for field in dropped_fields:
                issues.append(ValidationIssue(
                    severity=IssueSeverity.CRITICAL,
                    category=IssueCategory.BREAKING_CHANGE,
                    message=f"Field '{field}' removed from '{coll_name}' - data will be lost!",
                    field_path=f"collections.{coll_name}.fields.{field}",
                    suggestion="Keep the field or migrate data first"
                ))

            # Type changes
            for field_name in old_fields & new_fields:
                old_type = old_coll["fields"][field_name].get("type")
                new_type = new_coll["fields"].get(field_name, {}).get("type")

                if old_type and new_type and old_type != new_type:
                    issues.append(ValidationIssue(
                        severity=IssueSeverity.CRITICAL,
                        category=IssueCategory.BREAKING_CHANGE,
                        message=f"Field '{field_name}' type changed from '{old_type}' to '{new_type}'",
                        field_path=f"collections.{coll_name}.fields.{field_name}",
                        suggestion="Create a new field and migrate data, or use a migration script"
                    ))

            # Required added to existing field
            for field_name in old_fields & new_fields:
                old_required = old_coll["fields"][field_name].get("required", False)
                new_required = new_coll["fields"].get(field_name, {}).get("required", False)

                if not old_required and new_required:
                    issues.append(ValidationIssue(
                        severity=IssueSeverity.WARNING,
                        category=IssueCategory.BREAKING_CHANGE,
                        message=f"Field '{field_name}' is now required - existing null values will fail",
                        field_path=f"collections.{coll_name}.fields.{field_name}",
                        suggestion="Set default values for existing records first"
                    ))

        return issues

    def _ai_review(
        self,
        schema: dict[str, Any],
        existing_schema: dict[str, Any] | None = None
    ) -> tuple[list[ValidationIssue], str]:
        """Use AI to perform deep schema review."""
        issues = []

        # Build the prompt
        schema_json = json.dumps(schema, indent=2)
        existing_json = json.dumps(existing_schema, indent=2) if existing_schema else None

        user_prompt = SCHEMA_VALIDATION_USER.format(
            schema=schema_json,
            existing_schema=existing_json or "None (new deployment)",
        )

        # Call Ollama
        response = self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": SCHEMA_VALIDATION_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.2,  # Low for consistent analysis
                "num_predict": 2048,
            },
        )

        content = response["message"]["content"]

        # Parse AI response for structured issues
        issues.extend(self._parse_ai_response(content))

        return issues, content

    def _parse_ai_response(self, content: str) -> list[ValidationIssue]:
        """Parse AI response to extract structured issues."""
        issues = []

        # Try to find JSON block in response
        try:
            import re
            json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(1))
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "message" in item:
                            issues.append(ValidationIssue(
                                severity=IssueSeverity(item.get("severity", "info")),
                                category=IssueCategory(item.get("category", "best_practice")),
                                message=item["message"],
                                field_path=item.get("field_path"),
                                suggestion=item.get("suggestion"),
                            ))
        except (json.JSONDecodeError, ValueError):
            # If we can't parse structured output, check for keywords
            content_lower = content.lower()

            if "critical" in content_lower or "dangerous" in content_lower:
                issues.append(ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.BEST_PRACTICE,
                    message="AI review found potential issues - see full review",
                    suggestion="Review the AI analysis for details"
                ))

        return issues
