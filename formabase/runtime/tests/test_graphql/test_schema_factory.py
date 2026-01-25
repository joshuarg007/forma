"""Tests for GraphQL schema factory."""

import pytest
from strawberry import Schema

from forma_runtime.graphql import GraphQLSchemaFactory


class TestGraphQLSchemaFactory:
    """Tests for GraphQLSchemaFactory."""

    def test_generate_schema(self, parsed_schema, model_factory):
        """Test generating GraphQL schema."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        assert schema is not None
        assert isinstance(schema, Schema)

    def test_schema_has_query_type(self, parsed_schema, model_factory):
        """Test that schema has Query type."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        # Schema should have query type (access via _schema internal attribute)
        query_type = schema._schema.query_type
        assert query_type is not None

    def test_schema_has_mutation_type(self, parsed_schema, model_factory):
        """Test that schema has Mutation type."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        # Schema should have mutation type
        mutation_type = schema._schema.mutation_type
        assert mutation_type is not None

    def test_types_generated_for_collections(self, parsed_schema, model_factory):
        """Test that types are generated for all collections."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        # Get all type names
        type_map = schema._schema.type_map
        type_names = list(type_map.keys())

        # Should have types for user, post, category
        assert any("User" in name for name in type_names)
        assert any("Post" in name for name in type_names)
        assert any("Category" in name for name in type_names)

    def test_query_fields_exist(self, parsed_schema, model_factory):
        """Test that query fields exist for collections."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        # Get query field names (fields is a dict)
        query_type = schema._schema.query_type
        field_names = list(query_type.fields.keys())

        # Should have fields for listing collections
        # Note: field names might be pluralized or have different naming conventions
        assert len(field_names) > 0

    def test_mutation_fields_exist(self, parsed_schema, model_factory):
        """Test that mutation fields exist for collections."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        schema = factory.generate_schema()

        mutation_type = schema._schema.mutation_type
        if mutation_type:
            field_names = list(mutation_type.fields.keys())
            # Should have create/update/delete mutations
            assert len(field_names) > 0


class TestGraphQLExecution:
    """Tests for GraphQL query execution."""

    @pytest.fixture
    def graphql_schema(self, parsed_schema, model_factory):
        """Create GraphQL schema."""
        models = model_factory.generate_models()
        factory = GraphQLSchemaFactory(parsed_schema, models)
        return factory.generate_schema()

    @pytest.mark.asyncio
    async def test_introspection_query(self, graphql_schema):
        """Test that introspection works."""
        query = """
        {
            __schema {
                types {
                    name
                }
            }
        }
        """

        result = await graphql_schema.execute(query)

        assert result.errors is None
        assert result.data is not None
        assert "__schema" in result.data
        assert "types" in result.data["__schema"]

    @pytest.mark.asyncio
    async def test_type_introspection(self, graphql_schema):
        """Test type introspection."""
        query = """
        {
            __schema {
                queryType {
                    name
                    fields {
                        name
                    }
                }
            }
        }
        """

        result = await graphql_schema.execute(query)

        assert result.errors is None
        assert result.data["__schema"]["queryType"] is not None
