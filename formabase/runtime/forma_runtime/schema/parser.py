"""Schema parser for reading and validating schema.json files."""

import json
from pathlib import Path

from pydantic import ValidationError

from .types import FieldType, RelationType, SchemaDefinition


class SchemaParseError(Exception):
    """Raised when schema parsing fails."""

    pass


class SchemaValidationError(Exception):
    """Raised when schema validation fails."""

    pass


class SchemaParser:
    """Parser for Forma schema.json files."""

    def __init__(self, schema_path: str | Path):
        """
        Initialize the parser.

        Args:
            schema_path: Path to the schema.json file
        """
        self.schema_path = Path(schema_path)
        self._schema: SchemaDefinition | None = None

    def parse(self) -> SchemaDefinition:
        """
        Parse and validate the schema file.

        Returns:
            Validated SchemaDefinition

        Raises:
            SchemaParseError: If the file cannot be read or parsed
            SchemaValidationError: If the schema is invalid
        """
        if self._schema is not None:
            return self._schema

        # Read the file
        try:
            with open(self.schema_path, encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            raise SchemaParseError(f"Schema file not found: {self.schema_path}")
        except json.JSONDecodeError as e:
            raise SchemaParseError(f"Invalid JSON in schema file: {e}")

        # Parse with Pydantic
        try:
            self._schema = SchemaDefinition.model_validate(data)
        except ValidationError as e:
            errors = []
            for error in e.errors():
                loc = ".".join(str(x) for x in error["loc"])
                errors.append(f"  - {loc}: {error['msg']}")
            raise SchemaValidationError(
                f"Schema validation failed:\n" + "\n".join(errors)
            )

        # Additional validation
        self._validate_relations()
        self._validate_enums()
        self._validate_auth_collection()

        return self._schema

    def _validate_relations(self) -> None:
        """Validate that all relation targets exist."""
        assert self._schema is not None

        collections = self._schema.collections
        for coll_name, collection in collections.items():
            for field_name, field in collection.fields.items():
                if field.type == FieldType.RELATION:
                    # Check target exists
                    if field.target is None:
                        raise SchemaValidationError(
                            f"Collection '{coll_name}' field '{field_name}': "
                            f"relation field must have a 'target'"
                        )
                    if field.target not in collections:
                        raise SchemaValidationError(
                            f"Collection '{coll_name}' field '{field_name}': "
                            f"relation target '{field.target}' does not exist"
                        )
                    # Check relation type is specified
                    if field.relation is None:
                        raise SchemaValidationError(
                            f"Collection '{coll_name}' field '{field_name}': "
                            f"relation field must have a 'relation' type"
                        )

    def _validate_enums(self) -> None:
        """Validate that enum fields have options."""
        assert self._schema is not None

        for coll_name, collection in self._schema.collections.items():
            for field_name, field in collection.fields.items():
                if field.type == FieldType.ENUM:
                    if not field.options or len(field.options) == 0:
                        raise SchemaValidationError(
                            f"Collection '{coll_name}' field '{field_name}': "
                            f"enum field must have 'options'"
                        )

    def _validate_auth_collection(self) -> None:
        """Validate the auth collection has required fields."""
        assert self._schema is not None

        auth = self._schema.get_auth_collection()
        if auth is None:
            return  # No auth collection is fine

        name, collection = auth

        # Must have email field
        email_field = None
        for field_name, field in collection.fields.items():
            if field.type == FieldType.EMAIL:
                email_field = field_name
                break

        if email_field is None:
            raise SchemaValidationError(
                f"Auth collection '{name}' must have an email field"
            )

    @classmethod
    def from_dict(cls, data: dict) -> SchemaDefinition:
        """
        Create a schema from a dictionary.

        Args:
            data: Schema data as dictionary

        Returns:
            Validated SchemaDefinition
        """
        try:
            schema = SchemaDefinition.model_validate(data)
        except ValidationError as e:
            errors = []
            for error in e.errors():
                loc = ".".join(str(x) for x in error["loc"])
                errors.append(f"  - {loc}: {error['msg']}")
            raise SchemaValidationError(
                f"Schema validation failed:\n" + "\n".join(errors)
            )

        # Create a temporary parser for validation
        parser = cls.__new__(cls)
        parser._schema = schema

        parser._validate_relations()
        parser._validate_enums()
        parser._validate_auth_collection()

        return schema
