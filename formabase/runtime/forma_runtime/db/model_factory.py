"""Dynamic SQLAlchemy model generation from schema."""

from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    String,
    Table,
    Text,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func

from ..schema.types import (
    CollectionDefinition,
    FieldDefinition,
    FieldType,
    RelationType,
    SchemaDefinition,
)


def create_base() -> type[DeclarativeBase]:
    """Create a new declarative base class."""
    class Base(DeclarativeBase):
        pass
    return Base


class ModelFactory:
    """Factory for generating SQLAlchemy models from schema definitions."""

    def __init__(self, schema: SchemaDefinition, base: type[DeclarativeBase] | None = None):
        """
        Initialize the model factory.

        Args:
            schema: The parsed schema definition
            base: Optional custom declarative base (creates new one if not provided)
        """
        self.schema = schema
        self.base = base or create_base()
        self.models: dict[str, type] = {}
        self.junction_tables: dict[str, Table] = {}
        self._model_to_collection: dict[str, str] = {}

    def generate_models(self) -> dict[str, type]:
        """
        Generate SQLAlchemy models for all collections.

        Returns:
            Dictionary mapping collection names to model classes
        """
        # First pass: create junction tables for many-to-many
        self._create_junction_tables()

        # Second pass: create model classes
        for name, collection in self.schema.collections.items():
            model = self._create_model(name, collection)
            self.models[name] = model
            self._model_to_collection[model.__name__] = name

        # Third pass: add relationships
        self._add_relationships()

        # Fourth pass: add indexes
        self._add_indexes()

        return self.models

    def _create_model(self, name: str, collection: CollectionDefinition) -> type:
        """Create a SQLAlchemy model class for a collection."""
        # Table name is the collection name (lowercase, snake_case assumed)
        table_name = name

        # Base columns
        columns: dict[str, Any] = {
            "__tablename__": table_name,
            "id": Column(Integer, primary_key=True, autoincrement=True),
        }

        # Add timestamps if enabled
        if collection.timestamps:
            columns["created_at"] = Column(
                DateTime(timezone=True),
                server_default=func.now(),
                nullable=False,
            )
            columns["updated_at"] = Column(
                DateTime(timezone=True),
                server_default=func.now(),
                onupdate=func.now(),
                nullable=False,
            )

        # Add soft delete if enabled
        if collection.soft_delete:
            columns["deleted_at"] = Column(DateTime(timezone=True), nullable=True)

        # Add fields
        for field_name, field in collection.fields.items():
            column = self._field_to_column(field_name, field, name)
            if column is not None:
                columns[field_name] = column

        # Create the model class
        model_name = self._to_model_name(name)
        model = type(model_name, (self.base,), columns)

        return model

    def _field_to_column(
        self, name: str, field: FieldDefinition, collection_name: str
    ) -> Column | None:
        """Convert a field definition to a SQLAlchemy column."""
        nullable = not field.required and field.nullable

        # Type mapping
        if field.type == FieldType.TEXT:
            col_type = String(field.max_length) if field.max_length else String(255)
            if field.textarea or (field.max_length and field.max_length > 1000):
                col_type = Text()
            return Column(
                col_type,
                nullable=nullable,
                unique=field.unique,
                default=field.default,
            )

        elif field.type == FieldType.EMAIL:
            return Column(
                String(255),
                nullable=nullable,
                unique=field.unique,
                default=field.default,
            )

        elif field.type == FieldType.INTEGER:
            return Column(
                Integer,
                nullable=nullable,
                unique=field.unique,
                default=field.default,
            )

        elif field.type == FieldType.FLOAT:
            return Column(
                Float(precision=field.precision) if field.precision else Float,
                nullable=nullable,
                unique=field.unique,
                default=field.default,
            )

        elif field.type == FieldType.BOOLEAN:
            return Column(
                Boolean,
                nullable=nullable,
                default=field.default if field.default is not None else False,
            )

        elif field.type == FieldType.DATETIME:
            default_val = None
            if field.auto == "now":
                default_val = func.now()
            return Column(
                DateTime(timezone=True),
                nullable=nullable,
                default=default_val,
                server_default=func.now() if field.auto == "now" else None,
            )

        elif field.type == FieldType.DATE:
            return Column(
                DateTime(timezone=True),  # Using DateTime for simplicity
                nullable=nullable,
                default=field.default,
            )

        elif field.type == FieldType.ENUM:
            if not field.options:
                raise ValueError(f"Enum field '{name}' must have options")
            enum_name = f"{collection_name}_{name}_enum"
            return Column(
                SQLEnum(*field.options, name=enum_name),
                nullable=nullable,
                default=field.default,
            )

        elif field.type == FieldType.JSON:
            return Column(
                JSON,
                nullable=nullable,
                default=field.default if field.default is not None else {},
            )

        elif field.type == FieldType.RICHTEXT:
            return Column(
                Text,
                nullable=nullable,
                default=field.default,
            )

        elif field.type == FieldType.FILE:
            # Store file URL/path as string
            return Column(
                String(500),
                nullable=nullable,
                default=field.default,
            )

        elif field.type == FieldType.IMAGE:
            # Store image URL/path as string (same as FILE)
            return Column(
                String(500),
                nullable=nullable,
                default=field.default,
            )

        elif field.type == FieldType.RELATION:
            # Handle relation fields
            if field.relation in (RelationType.MANY_TO_ONE, RelationType.ONE_TO_ONE):
                # Foreign key column
                fk_column = f"{field.target}.id"
                on_delete = field.on_delete.value.upper().replace("_", " ")
                return Column(
                    Integer,
                    ForeignKey(fk_column, ondelete=on_delete),
                    nullable=nullable,
                )
            # many-to-many and one-to-many don't create columns here
            return None

        return None

    def _create_junction_tables(self) -> None:
        """Create junction tables for many-to-many relationships."""
        for coll_name, collection in self.schema.collections.items():
            for field_name, field in collection.fields.items():
                if (
                    field.type == FieldType.RELATION
                    and field.relation == RelationType.MANY_TO_MANY
                ):
                    # Create junction table name (alphabetically sorted)
                    names = sorted([coll_name, field.target])
                    junction_name = f"{names[0]}_{names[1]}"

                    # Only create if not already exists
                    if junction_name not in self.junction_tables:
                        self.junction_tables[junction_name] = Table(
                            junction_name,
                            self.base.metadata,
                            Column(
                                f"{coll_name}_id",
                                Integer,
                                ForeignKey(f"{coll_name}.id", ondelete="CASCADE"),
                                primary_key=True,
                            ),
                            Column(
                                f"{field.target}_id",
                                Integer,
                                ForeignKey(f"{field.target}.id", ondelete="CASCADE"),
                                primary_key=True,
                            ),
                        )

    def _add_relationships(self) -> None:
        """Add SQLAlchemy relationship() to models."""
        for coll_name, collection in self.schema.collections.items():
            model = self.models[coll_name]

            for field_name, field in collection.fields.items():
                if field.type != FieldType.RELATION:
                    continue

                target_model = self.models.get(field.target)
                if target_model is None:
                    continue

                if field.relation == RelationType.MANY_TO_ONE:
                    # Forward relationship: post.author -> User
                    setattr(
                        model,
                        f"{field_name}_rel",
                        relationship(
                            target_model.__name__,
                            foreign_keys=[getattr(model, field_name)],
                            lazy="selectin",
                        ),
                    )

                elif field.relation == RelationType.ONE_TO_ONE:
                    setattr(
                        model,
                        f"{field_name}_rel",
                        relationship(
                            target_model.__name__,
                            foreign_keys=[getattr(model, field_name)],
                            uselist=False,
                            lazy="selectin",
                        ),
                    )

                elif field.relation == RelationType.MANY_TO_MANY:
                    # Find junction table
                    names = sorted([coll_name, field.target])
                    junction_name = f"{names[0]}_{names[1]}"
                    junction_table = self.junction_tables.get(junction_name)

                    if junction_table is not None:
                        setattr(
                            model,
                            f"{field_name}_rel",
                            relationship(
                                target_model.__name__,
                                secondary=junction_table,
                                lazy="selectin",
                            ),
                        )

    def _add_indexes(self) -> None:
        """Add indexes to models."""
        for coll_name, collection in self.schema.collections.items():
            if not collection.indexes:
                continue

            model = self.models[coll_name]

            for idx_def in collection.indexes:
                columns = [
                    getattr(model, f) for f in idx_def.fields if hasattr(model, f)
                ]
                if columns:
                    idx_name = idx_def.name or f"ix_{coll_name}_{'_'.join(idx_def.fields)}"
                    index = Index(idx_name, *columns, unique=idx_def.unique)
                    # Index will be created when tables are created

    def _to_model_name(self, name: str) -> str:
        """Convert collection name to model class name (PascalCase)."""
        return "".join(word.capitalize() for word in name.split("_"))

    def get_model(self, collection_name: str) -> type | None:
        """Get a model by collection name."""
        return self.models.get(collection_name)
