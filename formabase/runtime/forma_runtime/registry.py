"""Multi-tenant Schema Registry

Manages schemas and models for multiple projects in a shared runtime.
Each project gets isolated tables (prefixed) and routes.
"""

import asyncio
from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from .db.model_factory import ModelFactory, create_base
from .schema.parser import SchemaParser
from .schema.types import SchemaDefinition


class ProjectRegistration:
    """Registration info for a single project."""

    def __init__(
        self,
        project_id: str,
        schema: SchemaDefinition,
        models: dict[str, type],
        base: type,
        table_prefix: str,
    ):
        self.project_id = project_id
        self.schema = schema
        self.models = models
        self.base = base
        self.table_prefix = table_prefix
        self.registered_at = datetime.utcnow()
        self.collections = list(schema.collections.keys())


class SchemaRegistry:
    """
    Registry for multi-tenant project schemas.

    Each project is isolated with:
    - Prefixed table names: p_{project_id}_{collection}
    - Scoped API routes: /api/p/{project_id}/{collection}
    """

    def __init__(self, engine: AsyncEngine):
        self.engine = engine
        self._projects: dict[str, ProjectRegistration] = {}
        self._lock = asyncio.Lock()

    async def register(self, project_id: str, schema_dict: dict[str, Any]) -> ProjectRegistration:
        """
        Register a project schema.

        Creates database tables and stores the registration.

        Args:
            project_id: Unique project identifier
            schema_dict: Schema definition as dict

        Returns:
            ProjectRegistration with models and metadata
        """
        async with self._lock:
            # Parse and validate schema
            schema = SchemaParser.from_dict(schema_dict)

            # Create table prefix (short version of project_id for table names)
            # Use first 8 chars of UUID to keep table names reasonable
            short_id = project_id.replace("-", "")[:8]
            table_prefix = f"p_{short_id}"

            # Create a new declarative base for this project
            base = create_base()

            # Generate models with prefixed table names
            factory = PrefixedModelFactory(schema, base, table_prefix)
            models = factory.generate_models()

            # Create tables in database
            await self._create_tables(base)

            # Store registration
            registration = ProjectRegistration(
                project_id=project_id,
                schema=schema,
                models=models,
                base=base,
                table_prefix=table_prefix,
            )
            self._projects[project_id] = registration

            return registration

    async def unregister(self, project_id: str) -> bool:
        """
        Unregister a project (removes from memory, keeps tables).

        Args:
            project_id: Project to unregister

        Returns:
            True if found and removed
        """
        async with self._lock:
            if project_id in self._projects:
                del self._projects[project_id]
                return True
            return False

    def get(self, project_id: str) -> ProjectRegistration | None:
        """Get registration for a project."""
        return self._projects.get(project_id)

    def get_models(self, project_id: str) -> dict[str, type] | None:
        """Get SQLAlchemy models for a project."""
        reg = self._projects.get(project_id)
        return reg.models if reg else None

    def get_schema(self, project_id: str) -> SchemaDefinition | None:
        """Get schema definition for a project."""
        reg = self._projects.get(project_id)
        return reg.schema if reg else None

    def is_registered(self, project_id: str) -> bool:
        """Check if project is registered."""
        return project_id in self._projects

    def list_projects(self) -> list[str]:
        """List all registered project IDs."""
        return list(self._projects.keys())

    async def _create_tables(self, base: type) -> None:
        """Create tables for a project's models."""
        async with self.engine.begin() as conn:
            await conn.run_sync(base.metadata.create_all)


class PrefixedModelFactory(ModelFactory):
    """Model factory that adds table name prefixes for multi-tenancy."""

    def __init__(
        self,
        schema: SchemaDefinition,
        base: type,
        table_prefix: str,
    ):
        super().__init__(schema, base)
        self.table_prefix = table_prefix

    def _create_model(self, name: str, collection) -> type:
        """Create model with prefixed table name."""
        # Store original name for reference
        original_name = name

        # Override table name with prefix
        prefixed_table = f"{self.table_prefix}_{name}"

        # Call parent to create model
        model = super()._create_model(name, collection)

        # Update the tablename
        model.__tablename__ = prefixed_table

        # Store original collection name as attribute
        model._collection_name = original_name

        return model

    def _create_junction_tables(self) -> None:
        """Create junction tables with prefixed names."""
        from sqlalchemy import Column, ForeignKey, Integer, Table

        from .schema.types import FieldType, RelationType

        for coll_name, collection in self.schema.collections.items():
            for field_name, field in collection.fields.items():
                if (
                    field.type == FieldType.RELATION
                    and field.relation == RelationType.MANY_TO_MANY
                ):
                    # Create prefixed junction table name
                    names = sorted([coll_name, field.target])
                    junction_name = f"{self.table_prefix}_{names[0]}_{names[1]}"

                    if junction_name not in self.junction_tables:
                        # Prefixed foreign key references
                        fk1 = f"{self.table_prefix}_{coll_name}.id"
                        fk2 = f"{self.table_prefix}_{field.target}.id"

                        self.junction_tables[junction_name] = Table(
                            junction_name,
                            self.base.metadata,
                            Column(
                                f"{coll_name}_id",
                                Integer,
                                ForeignKey(fk1, ondelete="CASCADE"),
                                primary_key=True,
                            ),
                            Column(
                                f"{field.target}_id",
                                Integer,
                                ForeignKey(fk2, ondelete="CASCADE"),
                                primary_key=True,
                            ),
                        )
