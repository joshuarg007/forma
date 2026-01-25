"""Dynamic router generation from schema."""

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, create_model
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import CRUDBase, get_session
from ..schema import CollectionDefinition, FieldDefinition, FieldType, SchemaDefinition
from ..hooks import get_executor
from .permissions import create_permission_dependency


class RouterFactory:
    """Factory for generating FastAPI routers from schema definitions."""

    def __init__(self, schema: SchemaDefinition, models: dict[str, type]):
        """
        Initialize the router factory.

        Args:
            schema: The parsed schema definition
            models: Dictionary of collection name to SQLAlchemy model
        """
        self.schema = schema
        self.models = models
        self.crud_instances: dict[str, CRUDBase] = {}
        self.pydantic_models: dict[str, dict[str, type[BaseModel]]] = {}

    def generate_routers(self) -> APIRouter:
        """
        Generate routers for all collections.

        Returns:
            Main router with all collection routes
        """
        main_router = APIRouter()

        for name, collection in self.schema.collections.items():
            if name not in self.models:
                continue

            model = self.models[name]
            crud = CRUDBase(model)
            self.crud_instances[name] = crud

            # Generate Pydantic models
            pydantic_models = self._generate_pydantic_models(name, collection)
            self.pydantic_models[name] = pydantic_models

            # Create router
            router = self._create_collection_router(name, collection, crud, pydantic_models)

            # Use collection name as-is for route prefix
            prefix = f"/{name}"
            main_router.include_router(router, prefix=prefix, tags=[name.title()])

        return main_router

    def _generate_pydantic_models(
        self, name: str, collection: CollectionDefinition
    ) -> dict[str, type[BaseModel]]:
        """Generate Create, Update, Response Pydantic models for a collection."""
        fields = collection.fields

        create_fields: dict[str, Any] = {}
        update_fields: dict[str, Any] = {}
        response_fields: dict[str, Any] = {"id": (int, ...)}

        type_mapping = {
            FieldType.TEXT: str,
            FieldType.EMAIL: str,
            FieldType.INTEGER: int,
            FieldType.FLOAT: float,
            FieldType.BOOLEAN: bool,
            FieldType.DATETIME: str,  # ISO format string
            FieldType.DATE: str,
            FieldType.JSON: dict,
            FieldType.RICHTEXT: str,
            FieldType.FILE: str,  # URL string
            FieldType.ENUM: str,
            FieldType.RELATION: int,  # Foreign key ID
        }

        for field_name, field in fields.items():
            # Skip many-to-many relations for now (handled separately)
            if field.type == FieldType.RELATION and field.relation and "many-to-many" in field.relation.value:
                continue

            py_type = type_mapping.get(field.type, Any)

            # Create model: required fields are required, optional have defaults
            if field.required:
                create_fields[field_name] = (py_type, ...)
            else:
                default = field.default
                create_fields[field_name] = (py_type | None, default)

            # Update model: all fields optional
            update_fields[field_name] = (py_type | None, None)

            # Response model: all fields optional (for flexibility)
            response_fields[field_name] = (py_type | None, None)

        # Add timestamps to response
        if collection.timestamps:
            response_fields["created_at"] = (str | None, None)
            response_fields["updated_at"] = (str | None, None)

        # Add soft delete to response
        if collection.soft_delete:
            response_fields["deleted_at"] = (str | None, None)

        # Create the models
        model_name = name.title().replace("_", "")
        create_model_cls = create_model(f"{model_name}Create", **create_fields)
        update_model_cls = create_model(f"{model_name}Update", **update_fields)
        response_model_cls = create_model(f"{model_name}Response", **response_fields)

        return {
            "create": create_model_cls,
            "update": update_model_cls,
            "response": response_model_cls,
        }

    def _create_collection_router(
        self,
        name: str,
        collection: CollectionDefinition,
        crud: CRUDBase,
        pydantic_models: dict[str, type[BaseModel]],
    ) -> APIRouter:
        """Create a router for a collection with all CRUD endpoints."""
        router = APIRouter()
        CreateModel = pydantic_models["create"]
        UpdateModel = pydantic_models["update"]
        ResponseModel = pydantic_models["response"]

        # Get API config
        api_config = collection.api
        default_limit = api_config.default_limit if api_config else 20
        max_limit = api_config.max_limit if api_config else 100
        search_fields = api_config.search_fields if api_config else None

        # Create permission dependencies
        permissions = collection.permissions
        read_permission = create_permission_dependency(name, permissions, "read")
        create_permission = create_permission_dependency(name, permissions, "create")
        update_permission = create_permission_dependency(name, permissions, "update")
        delete_permission = create_permission_dependency(name, permissions, "delete")

        # Get hook executor for this collection
        hook_executor = get_executor(name, collection.hooks)

        # List endpoint
        @router.get("")
        async def list_items(
            skip: int = Query(0, ge=0, description="Number of items to skip"),
            limit: int = Query(default_limit, ge=1, le=max_limit, description="Number of items to return"),
            order_by: str | None = Query(None, description="Field to order by"),
            order_dir: str = Query("desc", regex="^(asc|desc)$", description="Order direction"),
            search: str | None = Query(None, description="Search query"),
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(read_permission),
        ) -> dict[str, Any]:
            """List items with pagination and filtering."""
            items, total = await crud.get_multi(
                session,
                skip=skip,
                limit=limit,
                order_by=order_by,
                order_dir=order_dir,
                search=search,
                search_fields=search_fields,
            )
            return {
                "items": [_serialize(item) for item in items],
                "total": total,
                "skip": skip,
                "limit": limit,
            }

        # Get single item
        @router.get("/{item_id}")
        async def get_item(
            item_id: int,
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(read_permission),
        ) -> dict[str, Any]:
            """Get a single item by ID."""
            item = await crud.get(session, item_id)
            if not item:
                raise HTTPException(status_code=404, detail=f"{name} not found")
            return _serialize(item)

        # Create item
        @router.post("", status_code=201)
        async def create_item(
            data: CreateModel,  # type: ignore
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(create_permission),
        ) -> dict[str, Any]:
            """Create a new item."""
            # Run beforeCreate hooks
            item_data = data.model_dump(exclude_unset=True)
            item_data = await hook_executor.run_before_create(item_data, current_user)

            # Create the item
            item = await crud.create(session, item_data)

            # Run afterCreate hooks
            await hook_executor.run_after_create(item_data, current_user, item)

            return _serialize(item)

        # Update item
        @router.put("/{item_id}")
        async def update_item(
            item_id: int,
            data: UpdateModel,  # type: ignore
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(update_permission),
        ) -> dict[str, Any]:
            """Update an existing item."""
            # Get existing item for hooks
            existing = await crud.get(session, item_id)
            if not existing:
                raise HTTPException(status_code=404, detail=f"{name} not found")

            # Run beforeUpdate hooks
            item_data = data.model_dump(exclude_unset=True, exclude_none=True)
            item_data = await hook_executor.run_before_update(item_data, current_user, existing)

            # Update the item
            item = await crud.update(session, item_id, item_data)

            # Run afterUpdate hooks
            await hook_executor.run_after_update(item_data, current_user, item)

            return _serialize(item)

        # Partial update (PATCH)
        @router.patch("/{item_id}")
        async def patch_item(
            item_id: int,
            data: UpdateModel,  # type: ignore
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(update_permission),
        ) -> dict[str, Any]:
            """Partially update an existing item."""
            # Get existing item for hooks
            existing = await crud.get(session, item_id)
            if not existing:
                raise HTTPException(status_code=404, detail=f"{name} not found")

            # Run beforeUpdate hooks
            item_data = data.model_dump(exclude_unset=True, exclude_none=True)
            item_data = await hook_executor.run_before_update(item_data, current_user, existing)

            # Update the item
            item = await crud.update(session, item_id, item_data)

            # Run afterUpdate hooks
            await hook_executor.run_after_update(item_data, current_user, item)

            return _serialize(item)

        # Delete item
        @router.delete("/{item_id}", status_code=204)
        async def delete_item(
            item_id: int,
            soft: bool = Query(False, description="Use soft delete"),
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(delete_permission),
        ) -> None:
            """Delete an item."""
            # Get existing item for hooks
            existing = await crud.get(session, item_id)
            if not existing:
                raise HTTPException(status_code=404, detail=f"{name} not found")

            # Run beforeDelete hooks
            should_proceed = await hook_executor.run_before_delete(item_id, current_user, existing)
            if not should_proceed:
                raise HTTPException(status_code=400, detail="Delete cancelled by hook")

            # Delete the item
            deleted = await crud.delete(session, item_id, soft=soft)

            # Run afterDelete hooks
            await hook_executor.run_after_delete(item_id, current_user, existing)

        # Count endpoint
        @router.get("/count", include_in_schema=True)
        async def count_items(
            session: AsyncSession = Depends(get_session),
            current_user: Optional[dict] = Depends(read_permission),
        ) -> dict[str, int]:
            """Get total count of items."""
            total = await crud.count(session)
            return {"count": total}

        return router


def _serialize(obj: Any) -> dict[str, Any]:
    """Convert SQLAlchemy model instance to dictionary."""
    result = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        # Convert datetime to ISO string
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        result[column.name] = value
    return result
