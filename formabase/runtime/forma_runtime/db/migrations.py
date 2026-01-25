"""Database migration management."""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import DeclarativeBase


class MigrationManager:
    """Manages database migrations and schema updates."""

    def __init__(
        self,
        engine: AsyncEngine,
        models: dict[str, type],
        base: type[DeclarativeBase] | None = None,
    ):
        """
        Initialize the migration manager.

        Args:
            engine: The async database engine
            models: Dictionary of collection name to model class
            base: The declarative base class (auto-detected from models if not provided)
        """
        self.engine = engine
        self.models = models
        # Auto-detect base from first model
        if base is None and models:
            first_model = next(iter(models.values()))
            for cls in first_model.__mro__:
                if hasattr(cls, "metadata") and isinstance(cls, type) and issubclass(cls, DeclarativeBase):
                    base = cls
                    break
        self.base = base

    async def auto_migrate(self) -> list[str]:
        """
        Automatically create/update tables based on models.

        This is a simple auto-migration that creates tables if they don't exist.
        For production, use proper Alembic migrations.

        Returns:
            List of actions taken
        """
        if self.base is None:
            raise RuntimeError("No base class available for migrations")

        actions = []
        base = self.base

        async with self.engine.begin() as conn:
            # Get existing tables
            def get_existing_tables(connection):
                inspector = inspect(connection)
                return set(inspector.get_table_names())

            existing_tables = await conn.run_sync(get_existing_tables)

            # Create all tables that don't exist
            def create_tables(connection):
                base.metadata.create_all(connection, checkfirst=True)

            await conn.run_sync(create_tables)

            # Get new tables
            new_tables = await conn.run_sync(get_existing_tables)

            # Log what was created
            for table in new_tables - existing_tables:
                actions.append(f"Created table: {table}")

        return actions

    async def get_table_info(self) -> dict[str, list[dict]]:
        """
        Get information about existing tables.

        Returns:
            Dictionary mapping table names to column info
        """
        info = {}

        async with self.engine.connect() as conn:
            def get_info(connection):
                inspector = inspect(connection)
                tables = {}
                for table_name in inspector.get_table_names():
                    columns = []
                    for col in inspector.get_columns(table_name):
                        columns.append({
                            "name": col["name"],
                            "type": str(col["type"]),
                            "nullable": col["nullable"],
                            "default": col.get("default"),
                            "primary_key": col.get("primary_key", False),
                        })
                    tables[table_name] = columns
                return tables

            info = await conn.run_sync(get_info)

        return info

    async def drop_all_tables(self) -> list[str]:
        """
        Drop all tables. USE WITH CAUTION.

        Returns:
            List of dropped tables
        """
        if self.base is None:
            raise RuntimeError("No base class available for migrations")

        dropped = []
        base = self.base

        async with self.engine.begin() as conn:
            def get_tables(connection):
                inspector = inspect(connection)
                return inspector.get_table_names()

            tables = await conn.run_sync(get_tables)

            def drop_tables(connection):
                base.metadata.drop_all(connection)

            await conn.run_sync(drop_tables)
            dropped = tables

        return dropped

    async def check_schema_sync(self) -> dict[str, list[str]]:
        """
        Check if database schema matches model definitions.

        Returns:
            Dictionary with 'missing_tables', 'extra_tables', 'missing_columns'
        """
        result = {
            "missing_tables": [],
            "extra_tables": [],
            "missing_columns": [],
        }

        # Get expected tables from models
        expected_tables = set(
            model.__tablename__ for model in self.models.values()
        )

        async with self.engine.connect() as conn:
            def check_sync(connection):
                inspector = inspect(connection)
                existing_tables = set(inspector.get_table_names())

                # Missing tables
                missing = expected_tables - existing_tables

                # Extra tables (not in schema)
                # Filter out known system tables
                system_tables = {"alembic_version"}
                extra = existing_tables - expected_tables - system_tables

                # Check columns for existing tables
                missing_cols = []
                for table_name in expected_tables & existing_tables:
                    existing_cols = {
                        col["name"] for col in inspector.get_columns(table_name)
                    }

                    # Find model for this table
                    model = None
                    for m in self.models.values():
                        if m.__tablename__ == table_name:
                            model = m
                            break

                    if model:
                        expected_cols = {
                            col.name for col in model.__table__.columns
                        }
                        missing_in_table = expected_cols - existing_cols
                        for col in missing_in_table:
                            missing_cols.append(f"{table_name}.{col}")

                return list(missing), list(extra), missing_cols

            missing, extra, missing_cols = await conn.run_sync(check_sync)
            result["missing_tables"] = missing
            result["extra_tables"] = extra
            result["missing_columns"] = missing_cols

        return result
