"""Main FastAPI application for Forma Runtime."""

import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from strawberry.fastapi import GraphQLRouter

from .admin import create_admin_router, create_multitenant_admin_router
from .api.upload import router as upload_router
from .ai import SchemaValidator, ValidationResult
from .api.router_factory import RouterFactory
from .auth import create_auth_router
from .config import settings
from .db import MigrationManager, ModelFactory, dispose_engine, get_engine
from .graphql import GraphQLSchemaFactory
from .registry import SchemaRegistry
from .schema import SchemaParser

# Multi-tenant mode configuration
MULTI_TENANT = os.getenv("MULTI_TENANT", "false").lower() == "true"
INTERNAL_KEY = os.getenv("INTERNAL_KEY", "dev-internal-key")

# AI validation configuration
AI_VALIDATION_ENABLED = os.getenv("AI_VALIDATION_ENABLED", "true").lower() == "true"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:32b")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    engine = get_engine()

    if MULTI_TENANT:
        # Multi-tenant mode: initialize registry, no default schema
        app.state.registry = SchemaRegistry(engine)
        app.state.schema = None
        app.state.models = {}

        # Add multi-tenant admin UI
        admin_router = create_multitenant_admin_router(app.state.registry)
        app.include_router(admin_router)
    else:
        # Single-tenant mode: load schema.json as before
        parser = SchemaParser(settings.schema_path)
        schema = parser.parse()

        # Generate models
        factory = ModelFactory(schema)
        models = factory.generate_models()

        # Auto-migrate in development
        if settings.debug:
            manager = MigrationManager(engine, models)
            await manager.auto_migrate()

        # Store in app state
        app.state.schema = schema
        app.state.models = models
        app.state.model_factory = factory

        # Generate and mount API routers
        router_factory = RouterFactory(schema, models)
        api_router = router_factory.generate_routers()
        app.include_router(api_router, prefix=settings.api_prefix)

        # Store router factory for access to CRUD instances
        app.state.router_factory = router_factory

        # Add auth routes if auth collection exists
        if schema.get_auth_collection():
            auth_router = create_auth_router(app.state)
            app.include_router(auth_router, prefix=settings.api_prefix)

        # Add GraphQL endpoint
        graphql_factory = GraphQLSchemaFactory(schema, models)
        graphql_schema = graphql_factory.generate_schema()
        graphql_router = GraphQLRouter(graphql_schema)
        app.include_router(graphql_router, prefix="/graphql")

        # Add Admin UI
        admin_router = create_admin_router(schema, models)
        app.include_router(admin_router)

    yield

    # Shutdown
    await dispose_engine()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Forma Runtime",
        description="Auto-generated API from schema definition",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Root endpoint
    @app.get("/", tags=["Info"])
    async def root():
        """Welcome endpoint with API info."""
        return {
            "name": "Formabase Runtime",
            "version": "0.1.0",
            "docs": "/docs",
            "graphql": "/graphql",
            "health": "/health",
            "api": "/api",
            "admin": "/admin",
            "upload": "/upload",
        }

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "version": "0.1.0",
            "multi_tenant": MULTI_TENANT,
        }

    # Schema info endpoint (single-tenant mode)
    @app.get("/schema", tags=["Schema"])
    async def schema_info():
        """Get schema information."""
        if MULTI_TENANT:
            return {
                "mode": "multi_tenant",
                "projects": app.state.registry.list_projects() if hasattr(app.state, "registry") else [],
            }
        schema = app.state.schema
        return {
            "name": schema.name,
            "version": schema.version,
            "collections": list(schema.collections.keys()),
        }

    # =========================================================================
    # MULTI-TENANT INTERNAL ENDPOINTS
    # =========================================================================

    if MULTI_TENANT:
        class ValidationIssueResponse(BaseModel):
            severity: str
            category: str
            message: str
            field_path: str | None = None
            suggestion: str | None = None

        class ValidationResultResponse(BaseModel):
            valid: bool
            can_deploy: bool
            issues: list[ValidationIssueResponse]
            summary: dict[str, int]

        class RegisterRequest(BaseModel):
            project_id: str
            schema: dict[str, Any]
            existing_schema: dict[str, Any] | None = None  # For breaking change detection
            skip_ai_validation: bool = False  # Option to skip AI review (faster)

        class RegisterResponse(BaseModel):
            success: bool
            api_base: str | None = None
            collections: list[str] = []
            validation: ValidationResultResponse | None = None
            message: str | None = None

        @app.post("/internal/register", response_model=RegisterResponse, tags=["Internal"])
        async def register_project(
            data: RegisterRequest,
            x_internal_key: str = Header(None),
        ):
            """
            Register a project schema (internal endpoint).

            Called by the Forma Builder to deploy a project's backend.
            Validates the schema before deployment and blocks if critical issues found.
            """
            # Validate internal key
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")

            if not hasattr(app.state, "registry"):
                raise HTTPException(status_code=500, detail="Registry not initialized")

            # =========================================================
            # PHASE 1: Schema Validation (AI-powered safety rails)
            # =========================================================
            try:
                validator = SchemaValidator(
                    model=OLLAMA_MODEL,
                    host=OLLAMA_HOST,
                )

                # Run validation (with or without AI depending on settings)
                use_ai = AI_VALIDATION_ENABLED and not data.skip_ai_validation
                validation_result = validator.validate(
                    schema=data.schema,
                    existing_schema=data.existing_schema,
                    use_ai=use_ai,
                )

                # Convert to response format
                validation_response = ValidationResultResponse(
                    valid=validation_result.valid,
                    can_deploy=validation_result.can_deploy,
                    issues=[
                        ValidationIssueResponse(
                            severity=issue.severity.value,
                            category=issue.category.value,
                            message=issue.message,
                            field_path=issue.field_path,
                            suggestion=issue.suggestion,
                        )
                        for issue in validation_result.issues
                    ],
                    summary={
                        "critical": len(validation_result.critical_issues),
                        "warnings": len(validation_result.warnings),
                        "info": len([i for i in validation_result.issues
                                    if i.severity.value == "info"]),
                    },
                )

                # Block deployment if critical issues found
                if not validation_result.can_deploy:
                    return RegisterResponse(
                        success=False,
                        validation=validation_response,
                        message=f"Deployment blocked: {len(validation_result.critical_issues)} critical issue(s) found",
                    )

            except Exception as e:
                # If validation fails, allow deployment with warning
                validation_response = ValidationResultResponse(
                    valid=True,
                    can_deploy=True,
                    issues=[
                        ValidationIssueResponse(
                            severity="warning",
                            category="structure",
                            message=f"Validation service unavailable: {str(e)}",
                            suggestion="Ensure Ollama is running for full validation",
                        )
                    ],
                    summary={"critical": 0, "warnings": 1, "info": 0},
                )

            # =========================================================
            # PHASE 2: Schema Registration and Table Creation
            # =========================================================
            try:
                registration = await app.state.registry.register(
                    project_id=data.project_id,
                    schema_dict=data.schema,
                )

                # Generate and mount API routes for this project
                router_factory = RouterFactory(registration.schema, registration.models)
                project_router = router_factory.generate_routers()

                # Mount under project-specific prefix
                api_base = f"/api/p/{data.project_id}"
                app.include_router(project_router, prefix=api_base)

                # Add auth routes if auth collection exists
                if registration.schema.get_auth_collection():
                    auth_router = create_auth_router(app.state)
                    app.include_router(auth_router, prefix=api_base)

                # Add GraphQL endpoint for this project
                graphql_factory = GraphQLSchemaFactory(registration.schema, registration.models)
                graphql_schema = graphql_factory.generate_schema()
                graphql_router = GraphQLRouter(graphql_schema)
                app.include_router(graphql_router, prefix=f"/graphql/p/{data.project_id}")

                return RegisterResponse(
                    success=True,
                    api_base=api_base,
                    collections=registration.collections,
                    validation=validation_response,
                    message="Backend deployed successfully" + (
                        f" with {len(validation_response.issues)} warning(s)"
                        if validation_response.summary.get("warnings", 0) > 0
                        else ""
                    ),
                )

            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @app.delete("/internal/unregister/{project_id}", tags=["Internal"])
        async def unregister_project(
            project_id: str,
            x_internal_key: str = Header(None),
        ):
            """Unregister a project (internal endpoint)."""
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")

            if not hasattr(app.state, "registry"):
                raise HTTPException(status_code=500, detail="Registry not initialized")

            success = await app.state.registry.unregister(project_id)
            return {"success": success}

        @app.get("/internal/projects", tags=["Internal"])
        async def list_projects(
            x_internal_key: str = Header(None),
        ):
            """List registered projects (internal endpoint)."""
            if x_internal_key != INTERNAL_KEY:
                raise HTTPException(status_code=403, detail="Invalid internal key")

            if not hasattr(app.state, "registry"):
                return {"projects": []}

            return {"projects": app.state.registry.list_projects()}

    # =========================================================================
    # FILE UPLOAD ENDPOINTS (works in both single and multi-tenant mode)
    # =========================================================================
    app.include_router(upload_router, prefix="/upload", tags=["Upload"])

    # Mount static files for serving uploads (local storage)
    upload_path = getattr(settings, "upload_path", "./uploads")
    if os.path.exists(upload_path) or True:  # Always mount, directory created on first upload
        os.makedirs(upload_path, exist_ok=True)
        app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

    return app


# Create the app instance
app = create_app()
