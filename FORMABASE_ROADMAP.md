# Formabase: Complete Development Roadmap

> **This document is the single source of truth for building Formabase. Future Claude sessions should read this first and continue where the last session left off.**

---

## Table of Contents

1. [Vision & Architecture](#vision--architecture)
2. [Repository Structure](#repository-structure)
3. [Tech Stack Decisions](#tech-stack-decisions)
4. [Schema Specification](#schema-specification)
5. [Runtime Development](#runtime-development)
6. [Builder Integration](#builder-integration)
7. [CMS Development](#cms-development)
8. [Deployment & Hosting](#deployment--hosting)
9. [Open Source Strategy](#open-source-strategy)
10. [Implementation Checklist](#implementation-checklist)
11. [Session Log](#session-log)

---

## Vision & Architecture

### What is Formabase?

Formabase is a full-stack React app builder consisting of three products:

| Product | Description | License | Repo |
|---------|-------------|---------|------|
| **Forma Runtime** | Python/FastAPI backend engine that powers generated apps | Open Source (MIT) | `formabase/runtime` |
| **Forma Builder** | Visual drag-drop app builder (Next.js SaaS) | Proprietary | `formabase/forma` |
| **Forma CMS** | Admin panel for content management post-deploy | Proprietary | Part of `formabase/forma` |

### Why This Architecture?

1. **Runtime is open source** - Attracts developers, builds community, establishes credibility
2. **Builder is proprietary SaaS** - Revenue from subscriptions
3. **Hosting is optional paid service** - Additional revenue from managed deployments
4. **No vendor lock-in** - Users can self-host runtime, export and leave anytime

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FORMABASE PLATFORM (SaaS)                           │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Forma Builder  │  │    Forma CMS     │  │    Dashboard     │          │
│  │    (Next.js)     │  │    (Next.js)     │  │    (Next.js)     │          │
│  │                  │  │                  │  │                  │          │
│  │  - Visual canvas │  │  - Content CRUD  │  │  - Projects      │          │
│  │  - Components    │  │  - Media library │  │  - Team/billing  │          │
│  │  - Data modeling │  │  - User roles    │  │  - Deployments   │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
│           └─────────────────────┴─────────────────────┘                     │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │    Forma API (FastAPI)  │                              │
│                    │                         │                              │
│                    │  - User accounts        │                              │
│                    │  - Project storage      │                              │
│                    │  - Deployment triggers  │                              │
│                    │  - Billing (Stripe)     │                              │
│                    └────────────┬────────────┘                              │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │   PostgreSQL (Platform) │                              │
│                    └─────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Generates & Deploys
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER APP (One per project)                           │
│                                                                             │
│  ┌──────────────────────────┐    ┌──────────────────────────┐              │
│  │    Generated Frontend    │    │      Forma Runtime       │              │
│  │       (Next.js)          │◄──►│    (Python/FastAPI)      │              │
│  │                          │    │                          │              │
│  │  - React components      │    │  - REST API              │              │
│  │  - Pages & routing       │    │  - GraphQL API           │              │
│  │  - API client            │    │  - Auth system           │              │
│  └──────────────────────────┘    │  - File storage          │              │
│                                  │  - Permissions           │              │
│                                  └─────────────┬────────────┘              │
│                                                │                            │
│                                  ┌─────────────▼────────────┐              │
│                                  │  PostgreSQL (App Data)   │              │
│                                  └──────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User designs app in Builder** → creates pages, components, data models
2. **Builder exports schema.json** → defines collections, fields, relations, permissions
3. **Runtime reads schema.json** → generates database tables, API endpoints, auth
4. **Generated frontend** → React app that calls Runtime API
5. **CMS connects to Runtime** → content editors manage data without code

---

## Repository Structure

### GitHub Organization: `formabase`

```
github.com/formabase/
│
├── runtime/                    # Open Source - MIT License
│   ├── README.md
│   ├── LICENSE (MIT)
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── docker-compose.yml
│   │
│   ├── forma_runtime/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app factory
│   │   ├── config.py           # Pydantic settings
│   │   │
│   │   ├── schema/             # Schema parsing
│   │   │   ├── __init__.py
│   │   │   ├── parser.py       # Parse schema.json
│   │   │   ├── types.py        # Field type definitions
│   │   │   ├── validator.py    # Schema validation
│   │   │   └── relations.py    # Relation handling
│   │   │
│   │   ├── db/                 # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── engine.py       # SQLAlchemy async engine
│   │   │   ├── model_factory.py # Dynamic model generation
│   │   │   ├── crud.py         # Generic CRUD operations
│   │   │   └── migrations.py   # Alembic integration
│   │   │
│   │   ├── api/                # REST API
│   │   │   ├── __init__.py
│   │   │   ├── router_factory.py # Generate routes from schema
│   │   │   ├── crud_routes.py  # CRUD endpoint handlers
│   │   │   ├── query.py        # Filtering, sorting
│   │   │   ├── pagination.py   # Cursor/offset pagination
│   │   │   └── upload.py       # File upload endpoints
│   │   │
│   │   ├── graphql/            # GraphQL API
│   │   │   ├── __init__.py
│   │   │   ├── schema_factory.py # Generate GraphQL schema
│   │   │   ├── resolvers.py    # Query resolvers
│   │   │   ├── mutations.py    # Mutation resolvers
│   │   │   └── subscriptions.py # Real-time subscriptions
│   │   │
│   │   ├── auth/               # Authentication
│   │   │   ├── __init__.py
│   │   │   ├── models.py       # User, Session models
│   │   │   ├── routes.py       # Auth endpoints
│   │   │   ├── jwt.py          # Token handling
│   │   │   ├── password.py     # Hashing
│   │   │   ├── permissions.py  # RBAC engine
│   │   │   └── oauth/          # OAuth providers
│   │   │       ├── __init__.py
│   │   │       ├── base.py
│   │   │       ├── google.py
│   │   │       └── github.py
│   │   │
│   │   ├── storage/            # File storage
│   │   │   ├── __init__.py
│   │   │   ├── base.py         # Abstract interface
│   │   │   ├── local.py        # Local filesystem
│   │   │   ├── s3.py           # S3/MinIO/R2
│   │   │   └── manager.py      # Storage manager
│   │   │
│   │   ├── hooks/              # Lifecycle hooks
│   │   │   ├── __init__.py
│   │   │   ├── base.py         # Hook interface
│   │   │   ├── builtin.py      # Email, webhook hooks
│   │   │   └── executor.py     # Hook execution
│   │   │
│   │   ├── realtime/           # WebSocket/SSE
│   │   │   ├── __init__.py
│   │   │   ├── websocket.py    # WS connections
│   │   │   └── events.py       # Event pub/sub
│   │   │
│   │   └── cli/                # Command line interface
│   │       ├── __init__.py
│   │       ├── __main__.py     # Entry point
│   │       ├── serve.py        # Start server
│   │       ├── migrate.py      # Run migrations
│   │       └── seed.py         # Seed data
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_schema/
│   │   ├── test_crud/
│   │   ├── test_auth/
│   │   ├── test_graphql/
│   │   └── test_permissions/
│   │
│   └── examples/
│       ├── blog/
│       │   ├── schema.json
│       │   ├── seed.json
│       │   └── README.md
│       ├── ecommerce/
│       │   ├── schema.json
│       │   └── README.md
│       └── saas/
│           ├── schema.json
│           └── README.md
│
├── forma/                      # Proprietary - Main SaaS
│   ├── apps/
│   │   ├── web/                # Marketing site
│   │   ├── builder/            # Visual builder (current frontend)
│   │   ├── cms/                # CMS admin panel
│   │   └── api/                # Platform API (current backend)
│   │
│   ├── packages/
│   │   ├── ui/                 # Shared React components
│   │   ├── schema/             # Shared TypeScript types
│   │   └── config/             # Shared configs
│   │
│   └── templates/
│       └── nextjs/             # Generated app template
│
├── docs/                       # Documentation site
│   ├── runtime/
│   ├── builder/
│   └── tutorials/
│
└── examples/                   # Community examples
    └── schemas/
```

---

## Tech Stack Decisions

### Runtime (Python)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | FastAPI | Async, fast, OpenAPI docs, Python ecosystem |
| **ORM** | SQLAlchemy 2.0 + asyncpg | Async support, mature, flexible dynamic models |
| **Migrations** | Alembic | SQLAlchemy native, programmatic migrations |
| **Validation** | Pydantic v2 | Fast, typed, FastAPI integration |
| **GraphQL** | Strawberry | Type-safe, async, modern Python GraphQL |
| **Auth** | python-jose + passlib | JWT standard, bcrypt hashing |
| **Storage** | boto3 (async) + aiofiles | S3-compatible APIs, local fallback |
| **CLI** | Typer | Modern Click wrapper, great DX |
| **Config** | pydantic-settings | Environment variables, typed config |
| **Testing** | pytest + pytest-asyncio | Standard, async support |
| **Database** | PostgreSQL (prod), SQLite (dev) | Production-grade + easy local dev |

### Builder (TypeScript/React)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Next.js 14 | App router, RSC, existing codebase |
| **State** | Zustand | Simple, existing in codebase |
| **Styling** | Tailwind CSS | Existing, rapid development |
| **DnD** | dnd-kit | Modern, accessible, existing |
| **Animation** | Framer Motion | Existing, powerful |
| **API Client** | Generated from OpenAPI | Type-safe, auto-generated |

### Infrastructure

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Platform DB** | PostgreSQL (Supabase/Neon) | Managed, scalable |
| **Customer DBs** | PostgreSQL (provisioned) | One DB per customer app |
| **File Storage** | Cloudflare R2 | S3-compatible, cheap, fast |
| **Deployment** | Vercel (frontend) + Railway/Render (runtime) | Easy, scalable |
| **Container Registry** | GitHub Container Registry | Free, integrated |

---

## Schema Specification

### Version 1.0 Schema Format

```json
{
  "$schema": "https://formabase.dev/schema/v1.json",
  "version": "1.0",
  "name": "my-app",

  "collections": {
    "post": {
      "displayName": "Blog Post",
      "icon": "document",
      "timestamps": true,
      "softDelete": false,

      "fields": {
        "title": {
          "type": "text",
          "required": true,
          "maxLength": 200,
          "displayName": "Title",
          "description": "The post title",
          "searchable": true
        },
        "slug": {
          "type": "text",
          "unique": true,
          "pattern": "^[a-z0-9-]+$",
          "auto": "slugify:title"
        },
        "content": {
          "type": "richtext",
          "displayName": "Content"
        },
        "excerpt": {
          "type": "text",
          "maxLength": 500,
          "textarea": true
        },
        "author": {
          "type": "relation",
          "target": "user",
          "relation": "many-to-one",
          "required": true,
          "onDelete": "cascade"
        },
        "categories": {
          "type": "relation",
          "target": "category",
          "relation": "many-to-many"
        },
        "featuredImage": {
          "type": "file",
          "accept": ["image/jpeg", "image/png", "image/webp"],
          "maxSize": 5242880
        },
        "status": {
          "type": "enum",
          "options": ["draft", "published", "archived"],
          "default": "draft"
        },
        "publishedAt": {
          "type": "datetime",
          "nullable": true
        },
        "viewCount": {
          "type": "integer",
          "default": 0,
          "min": 0,
          "admin": true
        },
        "metadata": {
          "type": "json",
          "default": {}
        }
      },

      "indexes": [
        { "fields": ["slug"], "unique": true },
        { "fields": ["status", "publishedAt"] },
        { "fields": ["author"] }
      ],

      "permissions": {
        "create": ["admin", "editor"],
        "read": {
          "public": { "where": { "status": "published" } },
          "authenticated": true,
          "admin": true
        },
        "update": ["admin", "editor", "owner"],
        "delete": ["admin"]
      },

      "hooks": {
        "beforeCreate": ["generateSlug", "setAuthor"],
        "afterCreate": ["notifySubscribers"],
        "beforeUpdate": ["updateSlug"],
        "afterUpdate": ["invalidateCache"],
        "beforeDelete": ["checkDependencies"]
      },

      "api": {
        "list": { "defaultLimit": 20, "maxLimit": 100 },
        "search": { "fields": ["title", "content", "excerpt"] }
      }
    },

    "category": {
      "displayName": "Category",
      "fields": {
        "name": { "type": "text", "required": true },
        "slug": { "type": "text", "unique": true },
        "description": { "type": "text" },
        "parent": {
          "type": "relation",
          "target": "category",
          "relation": "many-to-one",
          "nullable": true
        }
      }
    },

    "user": {
      "displayName": "User",
      "auth": true,
      "fields": {
        "email": { "type": "email", "unique": true, "required": true },
        "name": { "type": "text", "required": true },
        "avatar": { "type": "file", "accept": ["image/*"] },
        "role": {
          "type": "enum",
          "options": ["admin", "editor", "user"],
          "default": "user"
        },
        "bio": { "type": "text", "maxLength": 500 },
        "emailVerified": { "type": "boolean", "default": false }
      }
    }
  },

  "settings": {
    "auth": {
      "providers": ["email", "google", "github"],
      "requireEmailVerification": true,
      "sessionDuration": 604800,
      "allowRegistration": true,
      "defaultRole": "user"
    },
    "storage": {
      "provider": "s3",
      "bucket": "my-app-uploads",
      "region": "auto",
      "publicUrl": "https://cdn.myapp.com"
    },
    "api": {
      "rateLimit": {
        "public": { "requests": 100, "window": 60 },
        "authenticated": { "requests": 1000, "window": 60 }
      },
      "cors": {
        "origins": ["https://myapp.com"],
        "credentials": true
      }
    },
    "hooks": {
      "email": {
        "provider": "resend",
        "from": "noreply@myapp.com"
      },
      "webhook": {
        "secret": "${WEBHOOK_SECRET}"
      }
    }
  }
}
```

### Field Types Reference

| Type | Description | Options |
|------|-------------|---------|
| `text` | String | `required`, `unique`, `minLength`, `maxLength`, `pattern`, `textarea` |
| `email` | Email string | `required`, `unique` |
| `integer` | Integer number | `required`, `min`, `max`, `default` |
| `float` | Decimal number | `required`, `min`, `max`, `precision` |
| `boolean` | True/false | `default` |
| `datetime` | ISO datetime | `required`, `nullable`, `auto` (`now`, `updated`) |
| `date` | Date only | `required`, `nullable` |
| `enum` | Predefined options | `options[]`, `default`, `multiple` |
| `json` | JSON object | `default`, `schema` (JSON Schema) |
| `richtext` | HTML content | `required`, `maxLength` |
| `file` | File upload | `accept[]`, `maxSize`, `multiple` |
| `relation` | Foreign key | `target`, `relation`, `onDelete`, `nullable` |

### Relation Types

| Relation | Description | Database |
|----------|-------------|----------|
| `many-to-one` | Post belongs to User | FK on Post |
| `one-to-many` | User has many Posts | FK on Post (inverse) |
| `many-to-many` | Post has many Tags | Junction table |
| `one-to-one` | User has one Profile | FK with unique |

---

## Runtime Development

### Phase 1: Core (Weeks 1-4)

#### Sprint 1: Schema Parser + Database (Week 1-2)

**Goal:** Parse schema.json → Generate SQLAlchemy models → Create tables

**Files to implement:**

1. **`forma_runtime/schema/types.py`**
```python
from enum import Enum
from typing import Any, Literal
from pydantic import BaseModel, Field

class FieldType(str, Enum):
    TEXT = "text"
    EMAIL = "email"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    DATE = "date"
    ENUM = "enum"
    JSON = "json"
    RICHTEXT = "richtext"
    FILE = "file"
    RELATION = "relation"

class RelationType(str, Enum):
    MANY_TO_ONE = "many-to-one"
    ONE_TO_MANY = "one-to-many"
    MANY_TO_MANY = "many-to-many"
    ONE_TO_ONE = "one-to-one"

class FieldDefinition(BaseModel):
    type: FieldType
    required: bool = False
    unique: bool = False
    nullable: bool = True
    default: Any = None
    # Type-specific options
    min_length: int | None = Field(None, alias="minLength")
    max_length: int | None = Field(None, alias="maxLength")
    pattern: str | None = None
    min: float | None = None
    max: float | None = None
    options: list[str] | None = None  # For enum
    target: str | None = None  # For relation
    relation: RelationType | None = None
    on_delete: Literal["cascade", "set_null", "restrict"] = "cascade"
    accept: list[str] | None = None  # For file
    max_size: int | None = Field(None, alias="maxSize")

class CollectionDefinition(BaseModel):
    display_name: str | None = Field(None, alias="displayName")
    timestamps: bool = True
    soft_delete: bool = Field(False, alias="softDelete")
    fields: dict[str, FieldDefinition]
    permissions: dict | None = None
    hooks: dict | None = None
    auth: bool = False  # Is this the auth collection?

class SchemaDefinition(BaseModel):
    version: str
    name: str
    collections: dict[str, CollectionDefinition]
    settings: dict | None = None
```

2. **`forma_runtime/schema/parser.py`**
```python
import json
from pathlib import Path
from .types import SchemaDefinition

class SchemaParser:
    def __init__(self, schema_path: str | Path):
        self.schema_path = Path(schema_path)
        self._schema: SchemaDefinition | None = None

    def parse(self) -> SchemaDefinition:
        if self._schema:
            return self._schema

        with open(self.schema_path) as f:
            data = json.load(f)

        self._schema = SchemaDefinition.model_validate(data)
        self._validate_relations()
        return self._schema

    def _validate_relations(self):
        """Ensure all relation targets exist"""
        collections = self._schema.collections
        for name, collection in collections.items():
            for field_name, field in collection.fields.items():
                if field.type == "relation":
                    if field.target not in collections:
                        raise ValueError(
                            f"Collection '{name}' field '{field_name}' "
                            f"references unknown collection '{field.target}'"
                        )
```

3. **`forma_runtime/db/model_factory.py`**
```python
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float,
    ForeignKey, Table, JSON, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from ..schema.types import SchemaDefinition, FieldType, RelationType

Base = declarative_base()

class ModelFactory:
    def __init__(self, schema: SchemaDefinition):
        self.schema = schema
        self.models: dict[str, type] = {}
        self.junction_tables: dict[str, Table] = {}

    def generate_models(self) -> dict[str, type]:
        # First pass: create junction tables for many-to-many
        self._create_junction_tables()

        # Second pass: create model classes
        for name, collection in self.schema.collections.items():
            model = self._create_model(name, collection)
            self.models[name] = model

        # Third pass: add relationships
        self._add_relationships()

        return self.models

    def _create_model(self, name: str, collection) -> type:
        columns = {
            '__tablename__': name,
            'id': Column(Integer, primary_key=True, autoincrement=True),
        }

        # Add timestamps
        if collection.timestamps:
            columns['created_at'] = Column(
                DateTime(timezone=True),
                server_default=func.now()
            )
            columns['updated_at'] = Column(
                DateTime(timezone=True),
                server_default=func.now(),
                onupdate=func.now()
            )

        # Add soft delete
        if collection.soft_delete:
            columns['deleted_at'] = Column(DateTime(timezone=True), nullable=True)

        # Add fields
        for field_name, field in collection.fields.items():
            column = self._field_to_column(field_name, field)
            if column is not None:
                columns[field_name] = column

        # Create class
        model = type(name.title(), (Base,), columns)
        return model

    def _field_to_column(self, name: str, field) -> Column | None:
        nullable = not field.required and field.nullable

        type_map = {
            FieldType.TEXT: lambda: String(field.max_length or 255),
            FieldType.EMAIL: lambda: String(255),
            FieldType.INTEGER: lambda: Integer,
            FieldType.FLOAT: lambda: Float,
            FieldType.BOOLEAN: lambda: Boolean,
            FieldType.DATETIME: lambda: DateTime(timezone=True),
            FieldType.DATE: lambda: Date,
            FieldType.JSON: lambda: JSON,
            FieldType.RICHTEXT: lambda: Text,
            FieldType.FILE: lambda: String(500),  # Store URL/path
        }

        if field.type == FieldType.ENUM:
            return Column(
                SQLEnum(*field.options, name=f"{name}_enum"),
                nullable=nullable,
                default=field.default
            )

        if field.type == FieldType.RELATION:
            if field.relation in (RelationType.MANY_TO_ONE, RelationType.ONE_TO_ONE):
                return Column(
                    Integer,
                    ForeignKey(f"{field.target}.id", ondelete=field.on_delete.upper()),
                    nullable=nullable
                )
            # many-to-many handled via junction table
            return None

        if field.type in type_map:
            return Column(
                type_map[field.type](),
                nullable=nullable,
                unique=field.unique,
                default=field.default
            )

        return None

    def _create_junction_tables(self):
        for name, collection in self.schema.collections.items():
            for field_name, field in collection.fields.items():
                if field.type == FieldType.RELATION and field.relation == RelationType.MANY_TO_MANY:
                    table_name = f"{name}_{field.target}"
                    if table_name not in self.junction_tables:
                        self.junction_tables[table_name] = Table(
                            table_name,
                            Base.metadata,
                            Column(f"{name}_id", Integer, ForeignKey(f"{name}.id")),
                            Column(f"{field.target}_id", Integer, ForeignKey(f"{field.target}.id"))
                        )

    def _add_relationships(self):
        # Add SQLAlchemy relationship() for ORM navigation
        pass  # Implement relationship binding
```

4. **`forma_runtime/db/engine.py`**
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from ..config import settings

def get_database_url() -> str:
    url = settings.database_url
    # Convert postgres:// to postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("sqlite://"):
        url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return url

engine = create_async_engine(
    get_database_url(),
    poolclass=NullPool,
    echo=settings.debug
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
```

5. **`forma_runtime/db/migrations.py`**
```python
from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.autogenerate import compare_metadata
from sqlalchemy import inspect
from .model_factory import Base

class MigrationManager:
    def __init__(self, engine, models):
        self.engine = engine
        self.models = models

    async def auto_migrate(self):
        """Auto-create/update tables based on models"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def generate_migration(self, message: str):
        """Generate Alembic migration file"""
        # For production, use proper Alembic migrations
        pass

    async def get_pending_changes(self) -> list:
        """Compare models to database, return differences"""
        async with self.engine.connect() as conn:
            def get_diff(connection):
                context = MigrationContext.configure(connection)
                return compare_metadata(context, Base.metadata)
            return await conn.run_sync(get_diff)
```

6. **`forma_runtime/config.py`**
```python
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database
    database_url: str = Field(default="sqlite:///./app.db")

    # Schema
    schema_path: str = Field(default="schema.json")

    # Server
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=False)

    # Auth
    jwt_secret: str = Field(default="change-me-in-production")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=7)

    # Storage
    storage_provider: str = Field(default="local")
    storage_path: str = Field(default="./uploads")
    s3_bucket: str | None = Field(default=None)
    s3_region: str | None = Field(default=None)
    s3_access_key: str | None = Field(default=None)
    s3_secret_key: str | None = Field(default=None)

    # CORS
    cors_origins: list[str] = Field(default=["*"])

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

7. **`forma_runtime/cli/migrate.py`**
```python
import asyncio
import typer
from rich.console import Console
from ..schema.parser import SchemaParser
from ..db.model_factory import ModelFactory
from ..db.engine import engine
from ..db.migrations import MigrationManager

app = typer.Typer()
console = Console()

@app.command()
def migrate(
    schema: str = typer.Option("schema.json", "--schema", "-s"),
    dry_run: bool = typer.Option(False, "--dry-run")
):
    """Apply database migrations based on schema"""
    asyncio.run(_migrate(schema, dry_run))

async def _migrate(schema_path: str, dry_run: bool):
    console.print(f"[blue]Parsing schema:[/blue] {schema_path}")

    parser = SchemaParser(schema_path)
    schema = parser.parse()

    console.print(f"[blue]Found collections:[/blue] {list(schema.collections.keys())}")

    factory = ModelFactory(schema)
    models = factory.generate_models()

    console.print(f"[blue]Generated models:[/blue] {list(models.keys())}")

    if dry_run:
        console.print("[yellow]Dry run - no changes applied[/yellow]")
        return

    manager = MigrationManager(engine, models)
    await manager.auto_migrate()

    console.print("[green]✓ Migrations applied successfully[/green]")
```

**Tests for Sprint 1:**
```python
# tests/test_schema/test_parser.py
import pytest
from forma_runtime.schema.parser import SchemaParser
from forma_runtime.schema.types import FieldType

def test_parse_basic_schema(tmp_path):
    schema_file = tmp_path / "schema.json"
    schema_file.write_text('''{
        "version": "1.0",
        "name": "test",
        "collections": {
            "post": {
                "fields": {
                    "title": {"type": "text", "required": true}
                }
            }
        }
    }''')

    parser = SchemaParser(schema_file)
    schema = parser.parse()

    assert schema.version == "1.0"
    assert "post" in schema.collections
    assert schema.collections["post"].fields["title"].type == FieldType.TEXT
    assert schema.collections["post"].fields["title"].required == True

def test_invalid_relation_target(tmp_path):
    schema_file = tmp_path / "schema.json"
    schema_file.write_text('''{
        "version": "1.0",
        "name": "test",
        "collections": {
            "post": {
                "fields": {
                    "author": {"type": "relation", "target": "nonexistent", "relation": "many-to-one"}
                }
            }
        }
    }''')

    parser = SchemaParser(schema_file)
    with pytest.raises(ValueError, match="unknown collection"):
        parser.parse()

# tests/test_db/test_model_factory.py
import pytest
from sqlalchemy import inspect
from forma_runtime.schema.types import SchemaDefinition, CollectionDefinition, FieldDefinition, FieldType
from forma_runtime.db.model_factory import ModelFactory, Base

def test_generate_basic_model():
    schema = SchemaDefinition(
        version="1.0",
        name="test",
        collections={
            "post": CollectionDefinition(
                fields={
                    "title": FieldDefinition(type=FieldType.TEXT, required=True),
                    "views": FieldDefinition(type=FieldType.INTEGER, default=0)
                }
            )
        }
    )

    factory = ModelFactory(schema)
    models = factory.generate_models()

    assert "post" in models
    Post = models["post"]

    # Check columns exist
    mapper = inspect(Post)
    columns = {c.name for c in mapper.columns}

    assert "id" in columns
    assert "title" in columns
    assert "views" in columns
    assert "created_at" in columns
    assert "updated_at" in columns
```

#### Sprint 2: REST API + CRUD (Week 3-4)

**Goal:** Auto-generate REST endpoints from schema

**Files to implement:**

1. **`forma_runtime/api/crud.py`**
```python
from typing import Any, TypeVar, Generic
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

T = TypeVar("T")

class CRUDBase(Generic[T]):
    def __init__(self, model: type[T]):
        self.model = model

    async def get(self, session: AsyncSession, id: int) -> T | None:
        result = await session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        session: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
        order_by: str | None = None,
        order_dir: str = "asc"
    ) -> tuple[list[T], int]:
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        if filters:
            conditions = self._build_filters(filters)
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        if order_by and hasattr(self.model, order_by):
            col = getattr(self.model, order_by)
            query = query.order_by(col.desc() if order_dir == "desc" else col.asc())

        query = query.offset(skip).limit(limit)

        result = await session.execute(query)
        count_result = await session.execute(count_query)

        return list(result.scalars().all()), count_result.scalar()

    async def create(self, session: AsyncSession, data: dict[str, Any]) -> T:
        obj = self.model(**data)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj

    async def update(
        self, session: AsyncSession, id: int, data: dict[str, Any]
    ) -> T | None:
        obj = await self.get(session, id)
        if not obj:
            return None

        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)

        await session.commit()
        await session.refresh(obj)
        return obj

    async def delete(self, session: AsyncSession, id: int) -> bool:
        obj = await self.get(session, id)
        if not obj:
            return False

        await session.delete(obj)
        await session.commit()
        return True

    def _build_filters(self, filters: dict[str, Any]) -> list:
        conditions = []
        for key, value in filters.items():
            if "__" in key:
                field, op = key.rsplit("__", 1)
                if hasattr(self.model, field):
                    col = getattr(self.model, field)
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
                    elif op == "in":
                        conditions.append(col.in_(value))
            elif hasattr(self.model, key):
                conditions.append(getattr(self.model, key) == value)

        return conditions
```

2. **`forma_runtime/api/router_factory.py`**
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from pydantic import create_model
from ..db.engine import get_session
from ..schema.types import SchemaDefinition, FieldType
from .crud import CRUDBase

class RouterFactory:
    def __init__(self, schema: SchemaDefinition, models: dict[str, type]):
        self.schema = schema
        self.models = models
        self.crud_instances: dict[str, CRUDBase] = {}
        self.pydantic_models: dict[str, dict[str, type]] = {}

    def generate_routers(self) -> APIRouter:
        main_router = APIRouter()

        for name, collection in self.schema.collections.items():
            if name not in self.models:
                continue

            model = self.models[name]
            crud = CRUDBase(model)
            self.crud_instances[name] = crud

            # Generate Pydantic models for request/response
            self._generate_pydantic_models(name, collection)

            # Create router for this collection
            router = self._create_collection_router(name, collection, crud)
            main_router.include_router(router, prefix=f"/{name}s", tags=[name])

        return main_router

    def _generate_pydantic_models(self, name: str, collection):
        """Generate Create, Update, Response Pydantic models"""
        fields = collection.fields

        create_fields = {}
        update_fields = {}
        response_fields = {"id": (int, ...)}

        type_mapping = {
            FieldType.TEXT: str,
            FieldType.EMAIL: str,
            FieldType.INTEGER: int,
            FieldType.FLOAT: float,
            FieldType.BOOLEAN: bool,
            FieldType.DATETIME: str,  # ISO format
            FieldType.DATE: str,
            FieldType.JSON: dict,
            FieldType.RICHTEXT: str,
            FieldType.FILE: str,
            FieldType.ENUM: str,
            FieldType.RELATION: int,  # Foreign key ID
        }

        for field_name, field in fields.items():
            if field.type == FieldType.RELATION and field.relation == "many-to-many":
                continue  # Handle separately

            py_type = type_mapping.get(field.type, Any)

            if field.required:
                create_fields[field_name] = (py_type, ...)
            else:
                create_fields[field_name] = (py_type | None, field.default)

            update_fields[field_name] = (py_type | None, None)
            response_fields[field_name] = (py_type | None, None)

        if collection.timestamps:
            response_fields["created_at"] = (str | None, None)
            response_fields["updated_at"] = (str | None, None)

        self.pydantic_models[name] = {
            "create": create_model(f"{name.title()}Create", **create_fields),
            "update": create_model(f"{name.title()}Update", **update_fields),
            "response": create_model(f"{name.title()}Response", **response_fields),
        }

    def _create_collection_router(self, name: str, collection, crud: CRUDBase) -> APIRouter:
        router = APIRouter()
        models = self.pydantic_models[name]
        CreateModel = models["create"]
        UpdateModel = models["update"]
        ResponseModel = models["response"]

        @router.get("", response_model=dict)
        async def list_items(
            skip: int = Query(0, ge=0),
            limit: int = Query(20, ge=1, le=100),
            order_by: str | None = None,
            order_dir: str = Query("asc", regex="^(asc|desc)$"),
            session: AsyncSession = Depends(get_session)
        ):
            # Extract filter params from query string
            items, total = await crud.get_multi(
                session, skip=skip, limit=limit,
                order_by=order_by, order_dir=order_dir
            )
            return {
                "items": [self._serialize(item) for item in items],
                "total": total,
                "skip": skip,
                "limit": limit
            }

        @router.get("/{id}", response_model=ResponseModel)
        async def get_item(
            id: int,
            session: AsyncSession = Depends(get_session)
        ):
            item = await crud.get(session, id)
            if not item:
                raise HTTPException(status_code=404, detail=f"{name} not found")
            return self._serialize(item)

        @router.post("", response_model=ResponseModel, status_code=201)
        async def create_item(
            data: CreateModel,
            session: AsyncSession = Depends(get_session)
        ):
            item = await crud.create(session, data.model_dump(exclude_unset=True))
            return self._serialize(item)

        @router.put("/{id}", response_model=ResponseModel)
        async def update_item(
            id: int,
            data: UpdateModel,
            session: AsyncSession = Depends(get_session)
        ):
            item = await crud.update(session, id, data.model_dump(exclude_unset=True))
            if not item:
                raise HTTPException(status_code=404, detail=f"{name} not found")
            return self._serialize(item)

        @router.delete("/{id}", status_code=204)
        async def delete_item(
            id: int,
            session: AsyncSession = Depends(get_session)
        ):
            deleted = await crud.delete(session, id)
            if not deleted:
                raise HTTPException(status_code=404, detail=f"{name} not found")

        return router

    def _serialize(self, obj) -> dict:
        """Convert SQLAlchemy model to dict"""
        result = {}
        for key in obj.__table__.columns.keys():
            value = getattr(obj, key)
            if hasattr(value, "isoformat"):
                value = value.isoformat()
            result[key] = value
        return result
```

3. **`forma_runtime/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .schema.parser import SchemaParser
from .db.model_factory import ModelFactory
from .db.engine import engine
from .db.migrations import MigrationManager
from .api.router_factory import RouterFactory

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    parser = SchemaParser(settings.schema_path)
    schema = parser.parse()

    factory = ModelFactory(schema)
    models = factory.generate_models()

    # Auto-migrate in development
    if settings.debug:
        manager = MigrationManager(engine, models)
        await manager.auto_migrate()

    # Store in app state
    app.state.schema = schema
    app.state.models = models

    # Generate and mount API routers
    router_factory = RouterFactory(schema, models)
    api_router = router_factory.generate_routers()
    app.include_router(api_router, prefix="/api")

    yield

    # Shutdown
    await engine.dispose()

def create_app() -> FastAPI:
    app = FastAPI(
        title="Forma Runtime",
        description="Auto-generated API from schema",
        version="1.0.0",
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app

app = create_app()
```

4. **`forma_runtime/cli/serve.py`**
```python
import typer
import uvicorn
from ..config import settings

app = typer.Typer()

@app.command()
def serve(
    schema: str = typer.Option("schema.json", "--schema", "-s"),
    host: str = typer.Option("0.0.0.0", "--host", "-h"),
    port: int = typer.Option(8000, "--port", "-p"),
    reload: bool = typer.Option(False, "--reload", "-r")
):
    """Start the Forma Runtime server"""
    # Override settings
    settings.schema_path = schema
    settings.host = host
    settings.port = port

    uvicorn.run(
        "forma_runtime.main:app",
        host=host,
        port=port,
        reload=reload
    )
```

### Phase 2: Auth + GraphQL (Weeks 5-8)

#### Sprint 3: Authentication (Week 5-6)

**Files to implement:**

1. **`forma_runtime/auth/models.py`** - User model with password hash
2. **`forma_runtime/auth/jwt.py`** - Token creation/validation
3. **`forma_runtime/auth/password.py`** - bcrypt hashing
4. **`forma_runtime/auth/routes.py`** - Register, login, logout, me, refresh
5. **`forma_runtime/auth/dependencies.py`** - get_current_user dependency
6. **`forma_runtime/auth/permissions.py`** - RBAC middleware

**Auth endpoints:**
```
POST /api/auth/register    - Create account
POST /api/auth/login       - Get tokens
POST /api/auth/logout      - Invalidate refresh token
POST /api/auth/refresh     - Refresh access token
GET  /api/auth/me          - Get current user
PUT  /api/auth/me          - Update profile
POST /api/auth/password    - Change password
POST /api/auth/forgot      - Request password reset
POST /api/auth/reset       - Reset password with token
```

#### Sprint 4: GraphQL (Week 7-8)

**Files to implement:**

1. **`forma_runtime/graphql/schema_factory.py`** - Generate Strawberry types from schema
2. **`forma_runtime/graphql/resolvers.py`** - Query resolvers
3. **`forma_runtime/graphql/mutations.py`** - Mutation resolvers
4. **`forma_runtime/graphql/filters.py`** - WhereInput types
5. **`forma_runtime/graphql/pagination.py`** - Connection types

**GraphQL example:**
```graphql
type Query {
  posts(where: PostWhereInput, orderBy: PostOrderByInput, first: Int, skip: Int): PostConnection!
  post(id: ID!): Post
  users(where: UserWhereInput): UserConnection!
  user(id: ID!): User
  me: User
}

type Mutation {
  createPost(data: PostCreateInput!): Post!
  updatePost(id: ID!, data: PostUpdateInput!): Post!
  deletePost(id: ID!): Boolean!

  register(data: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
}

type Subscription {
  postCreated: Post!
  postUpdated(id: ID): Post!
}
```

### Phase 3: Storage + Hooks (Weeks 9-10)

**Files to implement:**

1. **`forma_runtime/storage/base.py`** - Abstract storage interface
2. **`forma_runtime/storage/local.py`** - Local filesystem storage
3. **`forma_runtime/storage/s3.py`** - S3-compatible storage
4. **`forma_runtime/storage/manager.py`** - Storage manager
5. **`forma_runtime/api/upload.py`** - Upload endpoints
6. **`forma_runtime/hooks/base.py`** - Hook interface
7. **`forma_runtime/hooks/executor.py`** - Hook execution engine
8. **`forma_runtime/hooks/builtin.py`** - Built-in hooks (email, webhook, slugify)

### Phase 4: Production Ready (Weeks 11-12)

1. **Docker setup**
   - Multi-stage Dockerfile
   - docker-compose.yml with Postgres
   - Health checks

2. **Documentation**
   - README with quick start
   - API documentation (auto-generated OpenAPI + GraphQL)
   - Configuration reference
   - Deployment guide

3. **Examples**
   - `/examples/blog` - Blog with posts, categories, comments
   - `/examples/ecommerce` - Products, orders, users
   - `/examples/saas` - Multi-tenant SaaS starter

4. **CI/CD**
   - GitHub Actions for tests
   - Auto-publish to PyPI
   - Auto-build Docker image

---

## Builder Integration

### Phase 5: Data Model Designer (Weeks 13-14)

**Add to Forma Builder:**

1. **`DataModelSidebar.tsx`** - List collections, add/remove
2. **`CollectionEditor.tsx`** - Edit collection fields
3. **`FieldEditor.tsx`** - Configure field options
4. **`RelationPicker.tsx`** - Set up relations
5. **`PermissionsEditor.tsx`** - Configure RBAC
6. **`SchemaPreview.tsx`** - Show generated schema.json

**Store additions:**
```typescript
// stores/schemaStore.ts
interface SchemaStore {
  collections: Record<string, CollectionDefinition>
  addCollection: (name: string) => void
  removeCollection: (name: string) => void
  addField: (collection: string, name: string, field: FieldDefinition) => void
  updateField: (collection: string, name: string, field: Partial<FieldDefinition>) => void
  removeField: (collection: string, name: string) => void
  exportSchema: () => SchemaDefinition
}
```

### Phase 6: Dynamic Components (Weeks 15-16)

**New canvas components:**

1. **`DataList`** - Renders list from collection
   - Props: collection, filters, orderBy, limit
   - Slot for item template

2. **`DataDetail`** - Renders single item
   - Props: collection, id (from route param)
   - Slot for fields

3. **`DataForm`** - Create/update form
   - Props: collection, mode (create/edit), redirectTo
   - Auto-generates fields from schema

4. **`AuthForm`** - Login/register forms
   - Props: mode (login/register), redirectTo

5. **`ProtectedRoute`** - Wraps content requiring auth
   - Props: roles, redirectTo

### Phase 7: Export + Deploy (Weeks 17-18)

**Export generates:**

```
my-app/
├── package.json
├── next.config.js
├── .env.example
│
├── schema.json              # Runtime schema
├── docker-compose.yml       # Runtime + Postgres
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [generated pages...]
│   │
│   ├── components/
│   │   └── [generated components...]
│   │
│   └── lib/
│       ├── api.ts           # Generated API client
│       └── auth.tsx         # Auth context/hooks
│
└── runtime/                 # Or pull from Docker
    └── docker-compose.yml
```

**Deployment options:**

1. **Self-host** - Download zip, run `docker-compose up`
2. **Forma Hosting** - One-click, we provision everything
3. **Vercel + Railway** - Frontend on Vercel, runtime on Railway

---

## CMS Development

### Phase 8: CMS Admin Panel (Weeks 19-20)

**Separate Next.js app or embedded in generated app:**

1. **Collection browser** - List all collections
2. **Record list** - Paginated, searchable, filterable
3. **Record editor** - Form generated from schema
4. **Media library** - Upload, organize, search files
5. **User management** - For apps with auth
6. **Settings** - API keys, webhooks, etc.

**CMS connects directly to Runtime API** - No separate backend needed.

---

## Deployment & Hosting

### Forma Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FORMA PLATFORM                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Builder    │    │   API       │    │  Deployer   │     │
│  │  (Vercel)   │    │ (Railway)   │    │  (Worker)   │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                               │             │
└───────────────────────────────────────────────│─────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
          │  Customer App 1 │       │  Customer App 2 │       │  Customer App N │
          │                 │       │                 │       │                 │
          │ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
          │ │  Frontend   │ │       │ │  Frontend   │ │       │ │  Frontend   │ │
          │ │  (Vercel)   │ │       │ │  (Vercel)   │ │       │ │  (Vercel)   │ │
          │ └─────────────┘ │       │ └─────────────┘ │       │ └─────────────┘ │
          │ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
          │ │   Runtime   │ │       │ │   Runtime   │ │       │ │   Runtime   │ │
          │ │  (Railway)  │ │       │ │  (Railway)  │ │       │ │  (Railway)  │ │
          │ └─────────────┘ │       │ └─────────────┘ │       │ └─────────────┘ │
          │ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
          │ │  Postgres   │ │       │ │  Postgres   │ │       │ │  Postgres   │ │
          │ │   (Neon)    │ │       │ │   (Neon)    │ │       │ │   (Neon)    │ │
          │ └─────────────┘ │       │ └─────────────┘ │       │ └─────────────┘ │
          └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Deployment Flow

1. User clicks "Deploy" in Builder
2. Platform API creates deployment record
3. Deployer worker:
   - Provisions Neon database
   - Deploys Runtime to Railway (with schema.json + DB URL)
   - Deploys Frontend to Vercel (with Runtime URL)
   - Updates DNS (app-name.forma.app)
4. User gets live URL

---

## Open Source Strategy

### Runtime Repository

**License:** MIT

**Why open source:**
- Builds trust (users can inspect, audit, fork)
- Community contributions
- Establishes technical credibility
- Attracts developers who become Builder users
- Runtime alone is useful → top-of-funnel for SaaS

**Contribution areas:**
- Field types (new field types like `phone`, `currency`)
- Storage providers (Azure Blob, GCS, etc.)
- Auth providers (more OAuth options)
- Hook types (Slack, Discord, etc.)
- Bug fixes and performance

**What stays proprietary:**
- Builder UI
- CMS UI
- Deployment orchestration
- Team collaboration features
- Enterprise features (SSO, audit logs)

### Marketing Positioning

```
"The open-source backend for React apps.
Define your schema, get REST + GraphQL + Auth instantly.
Like Supabase, but Python. Like Strapi, but faster."
```

**Target audience for Runtime:**
- Python developers
- FastAPI users
- Teams wanting self-hosted backend
- Developers burned by vendor lock-in

**Target audience for Builder:**
- Agencies building client sites
- Startups needing MVPs fast
- Developers who hate boilerplate
- Non-technical founders (with technical co-founder)

---

## Implementation Checklist

### Runtime v1.0 (MVP)

- [x] **Schema** ✅ COMPLETE
  - [x] `schema/types.py` - Type definitions (FieldType, RelationType, CollectionDefinition, SchemaDefinition)
  - [x] `schema/parser.py` - Parse and validate schema.json with relation validation
  - [x] `schema/__init__.py` - Module exports

- [x] **Database** ✅ COMPLETE
  - [x] `db/engine.py` - Async SQLAlchemy engine with session factory
  - [x] `db/model_factory.py` - Dynamic model generation from schema
  - [x] `db/crud.py` - Generic CRUD with filtering, pagination, soft delete
  - [x] `db/migrations.py` - Auto-migration manager
  - [x] `db/base.py` - Declarative base

- [x] **REST API** ✅ COMPLETE
  - [x] `api/router_factory.py` - Auto-generates routes from schema
  - [x] CRUD endpoints (GET list, GET one, POST, PUT, PATCH, DELETE)
  - [x] Filtering with operators (eq, ne, gt, gte, lt, lte, contains, startswith, in, notin)
  - [x] Pagination (skip/limit)
  - [x] Sorting (order_by, order_dir)
  - [x] Search across fields

- [x] **Auth** ✅ COMPLETE
  - [x] `auth/jwt.py` - Token creation/validation
  - [x] `auth/password.py` - bcrypt hashing with passlib
  - [x] `auth/routes.py` - Register, login, logout, refresh, me, password change
  - [x] `auth/dependencies.py` - get_current_user, get_current_user_optional, require_roles

- [x] **GraphQL** ✅ COMPLETE
  - [x] `graphql/schema_factory.py` - Generates Strawberry types from schema
  - [x] Query resolvers (list with pagination, get by ID)
  - [x] Mutation resolvers (create, update, delete)
  - [x] Input types for create/update

- [x] **CLI** ✅ COMPLETE
  - [x] `cli/main.py` - Typer CLI with all commands
  - [x] `serve` command - Start server with schema
  - [x] `migrate` command - Apply migrations
  - [x] `info` command - Show schema info
  - [x] `check` command - Validate schema
  - [x] `version` command - Show version

- [x] **Infrastructure** ✅ COMPLETE
  - [x] `pyproject.toml` - All dependencies configured
  - [x] `config.py` - Pydantic settings
  - [x] `main.py` - FastAPI app factory with lifespan
  - [x] `README.md` - Documentation
  - [x] `LICENSE` - MIT license
  - [x] Git repository initialized

- [x] **Tests** ✅ 20 TESTS PASSING
  - [x] Schema parser tests (10 tests)
  - [x] Model factory tests (10 tests)

- [x] **Examples** ✅ COMPLETE
  - [x] `examples/blog/schema.json` - Full blog schema with user, post, category, comment

### Runtime v1.1 (Enhanced)

- [ ] **Storage**
  - [ ] `storage/base.py` - Abstract storage interface
  - [ ] `storage/local.py` - Local filesystem storage
  - [ ] `storage/s3.py` - S3/MinIO/R2 compatible storage
  - [ ] `storage/manager.py` - Storage manager
  - [ ] `api/upload.py` - Upload endpoints (single, multiple, presigned URLs)

- [ ] **Hooks**
  - [ ] `hooks/base.py` - Hook interface
  - [ ] `hooks/executor.py` - Hook execution engine
  - [ ] `hooks/builtin.py` - Built-in hooks (slugify, email, webhook)
  - [ ] beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeDelete, afterDelete

- [ ] **Realtime**
  - [ ] `realtime/websocket.py` - WebSocket connections
  - [ ] `realtime/events.py` - Event pub/sub
  - [ ] GraphQL subscriptions

- [ ] **Auth Enhancements**
  - [ ] `auth/oauth/google.py` - Google OAuth
  - [ ] `auth/oauth/github.py` - GitHub OAuth
  - [ ] `auth/permissions.py` - Full RBAC engine
  - [ ] API key authentication (for service-to-service)
  - [ ] Email verification flow
  - [ ] Password reset flow

- [ ] **Additional Tests**
  - [ ] Auth endpoint tests
  - [ ] REST API integration tests
  - [ ] GraphQL integration tests
  - [ ] Storage tests

- [ ] **Docker**
  - [ ] `Dockerfile` - Multi-stage build
  - [ ] `docker-compose.yml` - Runtime + Postgres
  - [ ] Health check endpoints

### Runtime v1.2 (Production)

- [ ] **Security**
  - [ ] Rate limiting (per IP, per user)
  - [ ] Query complexity limits (GraphQL)
  - [ ] Input sanitization
  - [ ] Audit logging

- [ ] **Performance**
  - [ ] Query optimization
  - [ ] Caching layer (Redis)
  - [ ] Connection pooling tuning

- [ ] **Operations**
  - [ ] `cli/seed.py` - Data seeding
  - [ ] `cli/backup.py` - Backup/restore
  - [ ] Structured logging (JSON)
  - [ ] Metrics endpoint (Prometheus)

- [ ] **Multi-tenancy**
  - [ ] Schema-based isolation
  - [ ] Row-level security option

### Runtime v2.0 (Advanced)

- [ ] **Computed Fields**
  - [ ] Virtual fields derived from other fields
  - [ ] Aggregation fields (count, sum, avg)

- [ ] **Full-text Search**
  - [ ] PostgreSQL full-text search integration
  - [ ] Elasticsearch/Meilisearch adapter

- [ ] **Workflows**
  - [ ] State machine fields
  - [ ] Automated transitions
  - [ ] Approval workflows

### Builder Modules (COMPLETE)

- [x] **Tier 1 Modules (17 total)** ✅ COMPLETE
  - [x] Layout: Container, Section, Grid, FlexRow, FlexColumn
  - [x] Hero: HeroSimple, HeroSplit, HeroVideo, HeroAnimated
  - [x] Navigation: NavbarSimple, Sidebar, Tabs, Breadcrumbs
  - [x] Content: TextBlock, FeatureGrid, CardBasic, TestimonialCard, PricingCard, TeamCard, BlogCard
  - [x] Forms: ContactForm, NewsletterSignup, LoginForm, RegisterForm
  - [x] Media: ImageModule, VideoEmbed
  - [x] CTA: CTABanner
  - [x] Footer: FooterSimple, FooterColumns
  - [x] Utility: Button, Spacer, Divider

- [x] **Tier 2 Modules (19 total)** ✅ COMPLETE
  - [x] Data Display: StatsCard, DataTable
  - [x] Feedback: Alert, Modal, Toast
  - [x] Sections: PricingSection, TestimonialsSection, TeamSection, FAQSection

- [x] **Tier 3 Modules (18 total)** ✅ COMPLETE
  - [x] Hero: HeroGradient, HeroParallax
  - [x] Navigation: MegaMenu, CommandPalette
  - [x] Content: Timeline, Accordion, Comparison, LogoCloud
  - [x] Media: Gallery, Carousel
  - [x] E-commerce: ProductCard, CartSummary
  - [x] Marketing: CountdownTimer, SocialProof, Marquee
  - [x] Sections: FeatureShowcase, StatsSection, LogoCloudSection

### Phase B: Page Templates (NEXT)

- [ ] **Landing Page Templates**
  - [ ] SaaS Landing - Hero, Features, Pricing, Testimonials, CTA, Footer
  - [ ] Agency Landing - HeroSplit, LogoCloud, FeatureShowcase, Team, Contact
  - [ ] Product Launch - HeroVideo, Countdown, Stats, FAQ, CTA

- [ ] **Business Templates**
  - [ ] Portfolio - HeroParallax, Gallery, Timeline, Contact
  - [ ] Blog - NavbarSimple, BlogCard grid, Sidebar, Footer
  - [ ] Documentation - MegaMenu, Sidebar, Accordion, Search

- [ ] **E-commerce Templates**
  - [ ] Product Page - ProductCard, Gallery, Tabs, RelatedProducts
  - [ ] Checkout - CartSummary, Forms, Trust badges
  - [ ] Store Home - HeroGradient, ProductGrid, Categories

- [ ] **Template System**
  - [ ] Template preview thumbnails
  - [ ] One-click template apply
  - [ ] Template customization wizard
  - [ ] Category filtering

### Phase C: Builder Infrastructure

- [ ] **OAuth Integration**
  - [ ] Google OAuth login/signup
  - [ ] GitHub OAuth login/signup
  - [ ] Social login buttons on auth page
  - [ ] Account linking (existing email -> OAuth)

- [ ] **Drag-and-Drop System**
  - [ ] Module palette with search
  - [ ] Drag preview with snap guides
  - [ ] Drop zones with visual feedback
  - [ ] Nested module support
  - [ ] Reorder within containers

- [ ] **Module Configuration**
  - [ ] Properties panel per module
  - [ ] Field types: text, select, color, number, boolean, array
  - [ ] Real-time preview updates
  - [ ] Reset to defaults
  - [ ] Copy/paste styles

- [ ] **Live Preview**
  - [ ] Side-by-side preview pane
  - [ ] Device breakpoint toggles
  - [ ] Interactive preview mode
  - [ ] Sync scroll with canvas

- [ ] **Project Management**
  - [ ] Save/load project JSON
  - [ ] Version history
  - [ ] Undo/redo (50 steps)
  - [ ] Auto-save
  - [ ] Export to React code

### Phase D: Theme System

- [ ] **Color Schemes**
  - [ ] Pre-built palettes (10+)
  - [ ] Custom color picker
  - [ ] CSS variable generation
  - [ ] Dark mode variants
  - [ ] Contrast checker

- [ ] **Typography**
  - [ ] Font family presets
  - [ ] Type scale (modular scale)
  - [ ] Heading styles (h1-h6)
  - [ ] Body text styles
  - [ ] Google Fonts integration

- [ ] **Spacing & Sizing**
  - [ ] Spacing scale (4px base)
  - [ ] Border radius presets
  - [ ] Shadow presets
  - [ ] Breakpoint definitions

- [ ] **Theme Presets**
  - [ ] Minimal
  - [ ] Corporate
  - [ ] Creative
  - [ ] Bold
  - [ ] Elegant
  - [ ] Custom theme builder

### Phase A: Tier 4 Specialized Modules

- [ ] **Blog Modules**
  - [ ] BlogList - Paginated post grid/list
  - [ ] BlogPost - Full article layout
  - [ ] AuthorBio - Author card with social
  - [ ] RelatedPosts - Related content grid
  - [ ] CategoryFilter - Filter by category
  - [ ] SearchResults - Search results page

- [ ] **Portfolio Modules**
  - [ ] PortfolioGrid - Filterable project grid
  - [ ] CaseStudy - Detailed project page
  - [ ] ProjectCard - Project preview card
  - [ ] ClientList - Client logo showcase
  - [ ] SkillsChart - Skills visualization

- [ ] **Dashboard Modules**
  - [ ] DashboardCard - Metric card
  - [ ] ChartWidget - Line/bar/pie charts
  - [ ] MetricCard - KPI display
  - [ ] ActivityFeed - Recent activity
  - [ ] ProgressBar - Progress tracking
  - [ ] DataCard - Data summary card

- [ ] **Interactive Modules**
  - [ ] Quiz - Multi-step quiz
  - [ ] Poll - Single question poll
  - [ ] Calculator - Custom calculator
  - [ ] ProgressTracker - Multi-step progress
  - [ ] RatingInput - Star/emoji rating
  - [ ] Slider - Range slider input

- [ ] **Social Modules**
  - [ ] SocialFeed - Social media feed
  - [ ] ShareButtons - Social share
  - [ ] CommentSection - Comments with replies
  - [ ] FollowCard - Follow/subscribe CTA
  - [ ] UserCard - User profile card

- [ ] **Integration Modules**
  - [ ] MapEmbed - Google/Mapbox map
  - [ ] CalendarEmbed - Calendar widget
  - [ ] ChatWidget - Live chat
  - [ ] VideoConference - Meeting embed
  - [ ] FormEmbed - External form embed

### Builder Integration (Data)

- [ ] **Data Modeling UI**
  - [ ] Collection list/editor
  - [ ] Field editor
  - [ ] Relation picker
  - [ ] Permissions editor
  - [ ] Schema export

- [ ] **Dynamic Components**
  - [ ] DataList component
  - [ ] DataDetail component
  - [ ] DataForm component
  - [ ] AuthForm component

- [ ] **Export**
  - [ ] Next.js template
  - [ ] API client generation
  - [ ] Docker compose for runtime

### CMS

- [ ] Collection browser
- [ ] Record list view
- [ ] Record editor
- [ ] Media library
- [ ] User management

---

## Session Log

> **Update this section at the end of each session**

### Session 1: 2024-12-14
**Completed:**
- ✅ Created complete project structure at `~/formabase/runtime`
- ✅ Implemented schema parser with full validation
- ✅ Built dynamic SQLAlchemy model factory
- ✅ Created async database engine with session management
- ✅ Implemented generic CRUD operations with advanced filtering
- ✅ Built REST API router factory with auto-generated endpoints
- ✅ Implemented JWT authentication (register, login, refresh, logout, me, password)
- ✅ Built GraphQL schema factory with Strawberry
- ✅ Created CLI with serve, migrate, info, check, version commands
- ✅ Created blog example schema
- ✅ All 20 tests passing
- ✅ Server running and tested at http://localhost:8001
- ✅ Git repository initialized with 3 commits

**Issues Fixed:**
- Fixed SQLAlchemy metadata conflict by creating fresh Base per ModelFactory instance
- Fixed GraphQL resolver factory pattern (non-async wrapper returning async resolver)
- Changed API routes from plural (`/api/categorys`) to singular (`/api/category`)

**Runtime Status:**
```
Location: ~/formabase/runtime
Git: 3 commits on master
Tests: 20 passing
Server: Running on port 8001
Endpoints:
  - REST: http://localhost:8001/api/{collection}
  - GraphQL: http://localhost:8001/graphql
  - Docs: http://localhost:8001/docs
```

**Forma Builder Status:**
```
Location: ~/forma
Frontend: Running on port 3000
Backend: Running on port 8000
```

**Next steps:**
1. File storage (local + S3)
2. Lifecycle hooks
3. OAuth providers (Google, GitHub)
4. Docker setup
5. More tests (auth, API integration)
6. Builder integration (data modeling UI)

**Blockers:**
- None

**Notes:**
- Runtime is standalone, Builder has its own backend
- Architecture: Builder (3000/8000) creates apps, Runtime (8001) runs them
- User can define schema.json → Runtime generates full API automatically

---

### Session 2: 2026-01-21
**Completed:**
- ✅ Built all Tier 3 modules (18 new components)
- ✅ Created 2 new categories: E-commerce, Marketing
- ✅ Updated module registry with all exports
- ✅ Created frontend/README.md with full module documentation
- ✅ Updated CLAUDE.md session state
- ✅ Updated FORMABASE_ROADMAP.md with Phases B, C, D, A

**Tier 3 Modules Built:**
| Category | Modules |
|----------|---------|
| Hero | HeroGradient, HeroParallax |
| Navigation | MegaMenu, CommandPalette |
| Content | Timeline, Accordion, Comparison, LogoCloud |
| Media | Gallery, Carousel |
| E-commerce (NEW) | ProductCard, CartSummary |
| Marketing (NEW) | CountdownTimer, SocialProof, Marquee |
| Sections | FeatureShowcase, StatsSection, LogoCloudSection |

**Module Totals:**
- Tier 1: 17 modules
- Tier 2: 19 modules
- Tier 3: 18 modules
- **Total: 54 modules**

**Files Created/Modified:**
```
frontend/src/components/builder/
├── hero/HeroGradient.tsx, HeroParallax.tsx
├── navigation/MegaMenu.tsx, CommandPalette.tsx
├── content/Timeline.tsx, Accordion.tsx, Comparison.tsx, LogoCloud.tsx
├── media/Gallery.tsx, Carousel.tsx
├── ecommerce/ProductCard.tsx, CartSummary.tsx, index.ts (NEW)
├── marketing/CountdownTimer.tsx, SocialProof.tsx, Marquee.tsx, index.ts (NEW)
├── sections/FeatureShowcase.tsx, StatsSection.tsx, LogoCloudSection.tsx
└── index.ts (updated with all new modules)

frontend/README.md (NEW - full module documentation)
CLAUDE.md (updated session state)
FORMABASE_ROADMAP.md (added Phases B, C, D, A)
```

**Build Status:**
- ✅ Build successful
- All modules typed and exported

**Next Steps (Roadmap):**
1. **Phase B**: Page Templates - Pre-built layouts using 54 modules
2. **Phase C**: Builder Infrastructure - Drag-drop, config panels, preview
3. **Phase D**: Theme System - Color schemes, typography, spacing
4. **Phase A**: Tier 4 Specialized Modules - Blog, Portfolio, Dashboard, etc.

**Blockers:**
- None

---

### How to Continue

1. **Read this document** - Understand the full scope
2. **Check Session Log** - See where last session left off
3. **Check Implementation Checklist** - See what's done/pending
4. **Continue from next unchecked item** - Or pick up from session notes
5. **Update Session Log** - Before ending session

**Repository locations:**
- Runtime: `~/formabase/runtime` (local, ready to push to `github.com/formabase/runtime`)
- Builder: `~/forma` (existing, will become `github.com/formabase/forma`)

**Commands to start:**
```bash
# Start everything (3 services)
cd ~/formabase/runtime && source venv/bin/activate && python -m forma_runtime.cli serve --schema examples/blog/schema.json --port 8001 &
cd ~/forma/backend && source venv/bin/activate && uvicorn app.main:app --port 8000 &
cd ~/forma/frontend && npm run dev &

# Runtime only
cd ~/formabase/runtime
source venv/bin/activate
pytest                    # Run tests
python -m forma_runtime.cli serve --schema examples/blog/schema.json --port 8001

# Test runtime
curl http://localhost:8001/health
curl http://localhost:8001/api/category
curl -X POST http://localhost:8001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"secret123","name":"Test"}'
```

**Quick API Reference:**
```
# Runtime (port 8001)
GET  /health                    - Health check
GET  /schema                    - View loaded schema
GET  /docs                      - Swagger UI
GET  /graphql                   - GraphQL Playground

# REST (auto-generated per collection)
GET  /api/{collection}          - List items
GET  /api/{collection}/{id}     - Get item
POST /api/{collection}          - Create item
PUT  /api/{collection}/{id}     - Update item
DELETE /api/{collection}/{id}   - Delete item

# Auth
POST /api/auth/register         - Register
POST /api/auth/login            - Login
POST /api/auth/refresh          - Refresh token
POST /api/auth/logout           - Logout
GET  /api/auth/me               - Current user
PUT  /api/auth/password         - Change password
```
