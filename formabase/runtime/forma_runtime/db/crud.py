"""Generic CRUD operations for dynamic models."""

from typing import Any, Generic, TypeVar

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

T = TypeVar("T")


class CRUDBase(Generic[T]):
    """Generic CRUD operations for a model."""

    def __init__(self, model: type[T]):
        """
        Initialize CRUD instance.

        Args:
            model: The SQLAlchemy model class
        """
        self.model = model

    async def get(
        self,
        session: AsyncSession,
        id: int,
        include_deleted: bool = False,
    ) -> T | None:
        """
        Get a single record by ID.

        Args:
            session: Database session
            id: Record ID
            include_deleted: Include soft-deleted records

        Returns:
            The record or None
        """
        query = select(self.model).where(self.model.id == id)

        # Handle soft delete
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))

        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        session: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
        search: str | None = None,
        search_fields: list[str] | None = None,
        order_by: str | None = None,
        order_dir: str = "asc",
        include_deleted: bool = False,
    ) -> tuple[list[T], int]:
        """
        Get multiple records with filtering and pagination.

        Args:
            session: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of field filters
            search: Search string
            search_fields: Fields to search in
            order_by: Field to order by
            order_dir: Order direction ('asc' or 'desc')
            include_deleted: Include soft-deleted records

        Returns:
            Tuple of (records, total_count)
        """
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        # Handle soft delete
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))
            count_query = count_query.where(self.model.deleted_at.is_(None))

        # Apply filters
        if filters:
            conditions = self._build_filters(filters)
            if conditions:
                query = query.where(and_(*conditions))
                count_query = count_query.where(and_(*conditions))

        # Apply search
        if search and search_fields:
            search_conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    col = getattr(self.model, field)
                    search_conditions.append(col.ilike(f"%{search}%"))
            if search_conditions:
                query = query.where(or_(*search_conditions))
                count_query = count_query.where(or_(*search_conditions))

        # Apply ordering
        if order_by and hasattr(self.model, order_by):
            col = getattr(self.model, order_by)
            if order_dir.lower() == "desc":
                query = query.order_by(col.desc())
            else:
                query = query.order_by(col.asc())
        elif hasattr(self.model, "created_at"):
            # Default to newest first
            query = query.order_by(self.model.created_at.desc())

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Execute queries
        result = await session.execute(query)
        count_result = await session.execute(count_query)

        return list(result.scalars().all()), count_result.scalar() or 0

    async def create(
        self,
        session: AsyncSession,
        data: dict[str, Any],
    ) -> T:
        """
        Create a new record.

        Args:
            session: Database session
            data: Record data

        Returns:
            The created record
        """
        obj = self.model(**data)
        session.add(obj)
        await session.flush()
        await session.refresh(obj)
        return obj

    async def update(
        self,
        session: AsyncSession,
        id: int,
        data: dict[str, Any],
    ) -> T | None:
        """
        Update an existing record.

        Args:
            session: Database session
            id: Record ID
            data: Updated data

        Returns:
            The updated record or None if not found
        """
        obj = await self.get(session, id)
        if obj is None:
            return None

        for key, value in data.items():
            if hasattr(obj, key) and key != "id":
                setattr(obj, key, value)

        await session.flush()
        await session.refresh(obj)
        return obj

    async def delete(
        self,
        session: AsyncSession,
        id: int,
        soft: bool = False,
    ) -> bool:
        """
        Delete a record.

        Args:
            session: Database session
            id: Record ID
            soft: Use soft delete if available

        Returns:
            True if deleted, False if not found
        """
        obj = await self.get(session, id)
        if obj is None:
            return False

        if soft and hasattr(obj, "deleted_at"):
            from datetime import datetime, timezone

            obj.deleted_at = datetime.now(timezone.utc)
            await session.flush()
        else:
            await session.delete(obj)
            await session.flush()

        return True

    async def count(
        self,
        session: AsyncSession,
        filters: dict[str, Any] | None = None,
        include_deleted: bool = False,
    ) -> int:
        """
        Count records matching filters.

        Args:
            session: Database session
            filters: Dictionary of field filters
            include_deleted: Include soft-deleted records

        Returns:
            Count of matching records
        """
        query = select(func.count()).select_from(self.model)

        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))

        if filters:
            conditions = self._build_filters(filters)
            if conditions:
                query = query.where(and_(*conditions))

        result = await session.execute(query)
        return result.scalar() or 0

    async def exists(
        self,
        session: AsyncSession,
        id: int,
        include_deleted: bool = False,
    ) -> bool:
        """
        Check if a record exists.

        Args:
            session: Database session
            id: Record ID
            include_deleted: Include soft-deleted records

        Returns:
            True if exists
        """
        query = select(func.count()).select_from(self.model).where(self.model.id == id)

        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))

        result = await session.execute(query)
        return (result.scalar() or 0) > 0

    def _build_filters(self, filters: dict[str, Any]) -> list:
        """
        Build SQLAlchemy filter conditions from a filter dictionary.

        Supports operators:
            - field: exact match
            - field__eq: exact match
            - field__ne: not equal
            - field__gt: greater than
            - field__gte: greater than or equal
            - field__lt: less than
            - field__lte: less than or equal
            - field__contains: contains substring (case-insensitive)
            - field__startswith: starts with (case-insensitive)
            - field__endswith: ends with (case-insensitive)
            - field__in: in list
            - field__notin: not in list
            - field__isnull: is null (value should be True/False)

        Args:
            filters: Dictionary of filters

        Returns:
            List of SQLAlchemy conditions
        """
        conditions = []

        for key, value in filters.items():
            if value is None:
                continue

            # Parse key for operator
            if "__" in key:
                parts = key.rsplit("__", 1)
                field_name = parts[0]
                op = parts[1]
            else:
                field_name = key
                op = "eq"

            # Check field exists
            if not hasattr(self.model, field_name):
                continue

            col = getattr(self.model, field_name)

            # Apply operator
            if op == "eq":
                conditions.append(col == value)
            elif op == "ne":
                conditions.append(col != value)
            elif op == "gt":
                conditions.append(col > value)
            elif op == "gte":
                conditions.append(col >= value)
            elif op == "lt":
                conditions.append(col < value)
            elif op == "lte":
                conditions.append(col <= value)
            elif op == "contains":
                conditions.append(col.ilike(f"%{value}%"))
            elif op == "startswith":
                conditions.append(col.ilike(f"{value}%"))
            elif op == "endswith":
                conditions.append(col.ilike(f"%{value}"))
            elif op == "in":
                if isinstance(value, (list, tuple)):
                    conditions.append(col.in_(value))
            elif op == "notin":
                if isinstance(value, (list, tuple)):
                    conditions.append(col.notin_(value))
            elif op == "isnull":
                if value:
                    conditions.append(col.is_(None))
                else:
                    conditions.append(col.isnot(None))

        return conditions
