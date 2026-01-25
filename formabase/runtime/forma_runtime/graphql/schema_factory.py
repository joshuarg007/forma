"""Dynamic GraphQL schema generation from Forma schema."""

from typing import Any, Optional

import strawberry
from strawberry import Schema
from strawberry.types import Info

from ..db import CRUDBase, get_session_factory
from ..schema import FieldType, SchemaDefinition


class GraphQLSchemaFactory:
    """Factory for generating GraphQL schema from Forma schema definitions."""

    def __init__(self, forma_schema: SchemaDefinition, models: dict[str, type]):
        """
        Initialize the GraphQL schema factory.

        Args:
            forma_schema: The parsed Forma schema definition
            models: Dictionary of collection name to SQLAlchemy model
        """
        self.forma_schema = forma_schema
        self.models = models
        self.graphql_types: dict[str, type] = {}
        self.graphql_inputs: dict[str, type] = {}

    def generate_schema(self) -> Schema:
        """
        Generate a Strawberry GraphQL schema.

        Returns:
            Strawberry Schema instance
        """
        # Generate types for each collection
        for name, collection in self.forma_schema.collections.items():
            if name not in self.models:
                continue

            # Create GraphQL type
            graphql_type = self._create_graphql_type(name, collection)
            self.graphql_types[name] = graphql_type

            # Create input types
            create_input = self._create_input_type(name, collection, "Create")
            update_input = self._create_input_type(name, collection, "Update", all_optional=True)
            self.graphql_inputs[f"{name}_create"] = create_input
            self.graphql_inputs[f"{name}_update"] = update_input

        # Create Query type
        Query = self._create_query_type()

        # Create Mutation type
        Mutation = self._create_mutation_type()

        return strawberry.Schema(query=Query, mutation=Mutation)

    def _create_graphql_type(self, name: str, collection) -> type:
        """Create a Strawberry type for a collection."""
        fields = collection.fields
        annotations = {"id": int}
        defaults = {}

        type_mapping = {
            FieldType.TEXT: str,
            FieldType.EMAIL: str,
            FieldType.INTEGER: int,
            FieldType.FLOAT: float,
            FieldType.BOOLEAN: bool,
            FieldType.DATETIME: str,
            FieldType.DATE: str,
            FieldType.JSON: strawberry.scalars.JSON,
            FieldType.RICHTEXT: str,
            FieldType.FILE: str,
            FieldType.ENUM: str,
            FieldType.RELATION: int,
        }

        for field_name, field in fields.items():
            # Skip many-to-many for now
            if field.type == FieldType.RELATION and field.relation and "many-to-many" in field.relation.value:
                continue

            py_type = type_mapping.get(field.type, str)

            if not field.required:
                annotations[field_name] = Optional[py_type]
                defaults[field_name] = None
            else:
                annotations[field_name] = py_type

        # Add timestamps
        if collection.timestamps:
            annotations["created_at"] = Optional[str]
            annotations["updated_at"] = Optional[str]
            defaults["created_at"] = None
            defaults["updated_at"] = None

        # Create the class
        class_name = self._to_class_name(name)

        # Build class dict
        class_dict = {"__annotations__": annotations}
        class_dict.update(defaults)

        # Create class and apply strawberry.type decorator
        graphql_type = type(class_name, (), class_dict)
        return strawberry.type(graphql_type)

    def _create_input_type(
        self, name: str, collection, suffix: str, all_optional: bool = False
    ) -> type:
        """Create a Strawberry input type for a collection."""
        fields = collection.fields
        annotations = {}
        defaults = {}

        type_mapping = {
            FieldType.TEXT: str,
            FieldType.EMAIL: str,
            FieldType.INTEGER: int,
            FieldType.FLOAT: float,
            FieldType.BOOLEAN: bool,
            FieldType.DATETIME: str,
            FieldType.DATE: str,
            FieldType.JSON: strawberry.scalars.JSON,
            FieldType.RICHTEXT: str,
            FieldType.FILE: str,
            FieldType.ENUM: str,
            FieldType.RELATION: int,
        }

        for field_name, field in fields.items():
            # Skip many-to-many and computed fields
            if field.type == FieldType.RELATION and field.relation and "many-to-many" in field.relation.value:
                continue

            py_type = type_mapping.get(field.type, str)

            if all_optional or not field.required:
                annotations[field_name] = Optional[py_type]
                defaults[field_name] = strawberry.UNSET
            else:
                annotations[field_name] = py_type

        class_name = f"{self._to_class_name(name)}{suffix}Input"

        class_dict = {"__annotations__": annotations}
        class_dict.update(defaults)

        input_type = type(class_name, (), class_dict)
        return strawberry.input(input_type)

    def _create_query_type(self) -> type:
        """Create the root Query type with resolvers for all collections."""
        factory = self  # Capture for closure

        class QueryFields:
            pass

        annotations = {}

        for name in self.graphql_types:
            graphql_type = self.graphql_types[name]
            model = self.models[name]

            # Create resolver factory functions (not async)
            def make_list_resolver(mdl: type, gql_type: type):
                async def resolver(
                    self,
                    info: Info,
                    skip: int = 0,
                    limit: int = 20,
                    order_by: Optional[str] = None,
                    order_dir: str = "desc",
                ) -> list:
                    session_factory = get_session_factory()
                    async with session_factory() as session:
                        crud = CRUDBase(mdl)
                        items, _ = await crud.get_multi(
                            session,
                            skip=skip,
                            limit=limit,
                            order_by=order_by,
                            order_dir=order_dir,
                        )
                        return [factory._model_to_graphql(item, gql_type) for item in items]

                return resolver

            def make_get_resolver(mdl: type, gql_type: type):
                async def resolver(self, info: Info, id: int) -> Optional[Any]:
                    session_factory = get_session_factory()
                    async with session_factory() as session:
                        crud = CRUDBase(mdl)
                        item = await crud.get(session, id)
                        if item:
                            return factory._model_to_graphql(item, gql_type)
                        return None

                return resolver

            # Add list field
            list_field_name = f"{name}s" if not name.endswith("s") else name
            list_resolver = make_list_resolver(model, graphql_type)
            setattr(QueryFields, list_field_name, strawberry.field(resolver=list_resolver))
            annotations[list_field_name] = list[graphql_type]

            # Add single field
            get_resolver = make_get_resolver(model, graphql_type)
            setattr(QueryFields, name, strawberry.field(resolver=get_resolver))
            annotations[name] = Optional[graphql_type]

        QueryFields.__annotations__ = annotations
        return strawberry.type(QueryFields)

    def _create_mutation_type(self) -> type:
        """Create the root Mutation type with mutations for all collections."""
        factory = self

        class MutationFields:
            pass

        annotations = {}

        for name in self.graphql_types:
            graphql_type = self.graphql_types[name]
            model = self.models[name]
            create_input = self.graphql_inputs.get(f"{name}_create")
            update_input = self.graphql_inputs.get(f"{name}_update")

            class_name = self._to_class_name(name)

            # Create mutation
            if create_input:
                def make_create_mutation(mdl: type, gql_type: type, inp: type):
                    async def resolver(self, info: Info, data: inp) -> Any:
                        session_factory = get_session_factory()
                        async with session_factory() as session:
                            crud = CRUDBase(mdl)
                            # Convert input to dict, excluding UNSET values
                            input_dict = {}
                            for field_name in data.__annotations__:
                                value = getattr(data, field_name)
                                if value is not strawberry.UNSET:
                                    input_dict[field_name] = value

                            item = await crud.create(session, input_dict)
                            await session.commit()
                            return factory._model_to_graphql(item, gql_type)

                    return resolver

                create_resolver = make_create_mutation(model, graphql_type, create_input)
                mutation_name = f"create_{class_name}"
                setattr(MutationFields, mutation_name, strawberry.mutation(resolver=create_resolver))
                annotations[mutation_name] = graphql_type

            # Update mutation
            if update_input:
                def make_update_mutation(mdl: type, gql_type: type, inp: type):
                    async def resolver(self, info: Info, id: int, data: inp) -> Optional[Any]:
                        session_factory = get_session_factory()
                        async with session_factory() as session:
                            crud = CRUDBase(mdl)

                            # Convert input to dict, excluding UNSET values
                            input_dict = {}
                            for field_name in data.__annotations__:
                                value = getattr(data, field_name)
                                if value is not strawberry.UNSET and value is not None:
                                    input_dict[field_name] = value

                            item = await crud.update(session, id, input_dict)
                            if item:
                                await session.commit()
                                return factory._model_to_graphql(item, gql_type)
                            return None

                    return resolver

                update_resolver = make_update_mutation(model, graphql_type, update_input)
                mutation_name = f"update_{class_name}"
                setattr(MutationFields, mutation_name, strawberry.mutation(resolver=update_resolver))
                annotations[mutation_name] = Optional[graphql_type]

            # Delete mutation
            def make_delete_mutation(mdl: type):
                async def resolver(self, info: Info, id: int) -> bool:
                    session_factory = get_session_factory()
                    async with session_factory() as session:
                        crud = CRUDBase(mdl)
                        deleted = await crud.delete(session, id)
                        if deleted:
                            await session.commit()
                        return deleted

                return resolver

            delete_resolver = make_delete_mutation(model)
            mutation_name = f"delete_{class_name}"
            setattr(MutationFields, mutation_name, strawberry.mutation(resolver=delete_resolver))
            annotations[mutation_name] = bool

        MutationFields.__annotations__ = annotations
        return strawberry.type(MutationFields)

    def _model_to_graphql(self, model_instance: Any, graphql_type: type) -> Any:
        """Convert a SQLAlchemy model instance to a GraphQL type instance."""
        data = {}
        for column in model_instance.__table__.columns:
            value = getattr(model_instance, column.name)
            if hasattr(value, "isoformat"):
                value = value.isoformat()
            data[column.name] = value

        return graphql_type(**data)

    def _to_class_name(self, name: str) -> str:
        """Convert collection name to PascalCase class name."""
        return "".join(word.capitalize() for word in name.split("_"))
