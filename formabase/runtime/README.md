<p align="center">
  <img src="../../forma/images/forma-logo.png" alt="Forma Runtime" width="120"/>
</p>

<h1 align="center">Forma Runtime</h1>

<p align="center">
  <strong>The open-source backend engine for React applications.</strong><br>
  Define your schema. Get REST, GraphQL, and Auth instantly.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License"/></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python 3.11+"/></a>
  <a href="#"><img src="https://img.shields.io/badge/FastAPI-0.109+-teal.svg" alt="FastAPI"/></a>
  <a href="#"><img src="https://img.shields.io/badge/SQLAlchemy-2.0+-orange.svg" alt="SQLAlchemy"/></a>
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#schema-reference">Schema Reference</a> &bull;
  <a href="#api-reference">API Reference</a> &bull;
  <a href="#configuration">Configuration</a>
</p>

---

## What is Forma Runtime?

Forma Runtime is a **schema-driven backend engine** that generates production-ready APIs from a simple JSON schema. No boilerplate. No repetitive CRUD code. Just define your data model and go.

```
schema.json  →  Forma Runtime  →  REST API
                                  GraphQL API
                                  Auth Endpoints
                                  Admin UI
                                  OpenAPI Docs
```

### Why Forma Runtime?

| Traditional Approach | Forma Runtime |
|---------------------|---------------|
| Write models, migrations, routes, serializers | Define schema once |
| 500+ lines of boilerplate per model | 10 lines of JSON per collection |
| Hours of setup | Minutes to production |
| Maintain sync between DB/API/docs | Always in sync automatically |

---

## Features

| Category | Capabilities |
|----------|-------------|
| **API Generation** | REST endpoints with pagination, filtering, sorting. GraphQL queries and mutations. OpenAPI/Swagger docs. |
| **Authentication** | JWT access + refresh tokens. Role-based access control. OAuth providers (Google, GitHub, Zoom). |
| **Data Modeling** | 15+ field types. Relations (1:1, 1:N, M:N). Validations. Computed fields. Soft delete. |
| **File Storage** | Local filesystem or S3-compatible. Image optimization. Secure signed URLs. |
| **Admin Interface** | Built-in data browser. Form generation. Bulk operations. |
| **Multi-Tenant** | Project isolation. Table prefixing. Route scoping. Shared infrastructure. |
| **AI Validation** | Schema safety rails. Breaking change detection. Best practice suggestions. |

---

## Quick Start

### Installation

```bash
pip install forma-runtime
```

### Create Your Schema

Create `schema.json`:

```json
{
  "version": "1.0",
  "name": "my-app",
  "collections": {
    "user": {
      "auth": true,
      "fields": {
        "email": { "type": "email", "required": true, "unique": true },
        "password_hash": { "type": "text", "required": true },
        "name": { "type": "text" },
        "role": { "type": "enum", "options": ["admin", "user"], "default": "user" }
      }
    },
    "post": {
      "timestamps": true,
      "softDelete": true,
      "fields": {
        "title": { "type": "text", "required": true, "maxLength": 200 },
        "slug": { "type": "text", "unique": true },
        "content": { "type": "richtext" },
        "published": { "type": "boolean", "default": false },
        "author": { "type": "relation", "target": "user", "relation": "many-to-one" }
      }
    },
    "comment": {
      "timestamps": true,
      "fields": {
        "body": { "type": "text", "required": true },
        "post": { "type": "relation", "target": "post", "relation": "many-to-one" },
        "user": { "type": "relation", "target": "user", "relation": "many-to-one" }
      }
    }
  }
}
```

### Run the Server

```bash
# Development (auto-migrations enabled)
forma-runtime serve --schema schema.json --port 8000 --debug

# Production
DATABASE_URL=postgresql://... JWT_SECRET=your-secret forma-runtime serve --schema schema.json
```

### Use Your API

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
# Returns: { "access_token": "...", "refresh_token": "...", "user": {...} }

# Create a post (authenticated)
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Hello World","content":"<p>My first post!</p>","author":1}'

# List posts with pagination
curl "http://localhost:8000/api/posts?page=1&limit=10&sort=-created_at"

# Filter posts
curl "http://localhost:8000/api/posts?published=true&author=1"

# GraphQL query
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ posts { id title author { name } comments { body } } }"}'
```

### Explore Your API

- **REST API**: http://localhost:8000/api/
- **GraphQL Playground**: http://localhost:8000/graphql
- **Admin UI**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Schema Reference

### Field Types

| Type | Description | Options |
|------|-------------|---------|
| `text` | String field | `required`, `unique`, `minLength`, `maxLength`, `pattern`, `default` |
| `email` | Email validation | `required`, `unique` |
| `integer` | Integer number | `required`, `min`, `max`, `default` |
| `float` | Decimal number | `required`, `min`, `max`, `precision`, `default` |
| `boolean` | True/false | `default` |
| `datetime` | ISO 8601 timestamp | `required`, `nullable`, `default: "now"` |
| `date` | Date only (YYYY-MM-DD) | `required`, `nullable` |
| `enum` | Predefined choices | `options[]`, `default` |
| `json` | JSON object/array | `default` |
| `richtext` | HTML content | `required`, `maxLength` |
| `file` | File upload | `accept[]`, `maxSize` |
| `image` | Image upload | `accept[]`, `maxSize`, `dimensions` |
| `relation` | Foreign key | `target`, `relation`, `onDelete` |

### Relation Types

| Type | Example | Description |
|------|---------|-------------|
| `many-to-one` | Post → User | Many posts belong to one user |
| `one-to-many` | User → Posts | One user has many posts (reverse of many-to-one) |
| `many-to-many` | Post ↔ Tag | Posts have many tags, tags have many posts |
| `one-to-one` | User → Profile | One user has exactly one profile |

### Collection Options

```json
{
  "post": {
    "displayName": "Blog Post",
    "timestamps": true,
    "softDelete": false,
    "auth": false,
    "fields": { ... },
    "permissions": {
      "create": ["admin", "editor"],
      "read": ["*"],
      "update": ["admin", "editor", "owner"],
      "delete": ["admin"]
    },
    "api": {
      "defaultLimit": 20,
      "maxLimit": 100,
      "searchFields": ["title", "content"]
    }
  }
}
```

### Permission Specifiers

| Value | Meaning |
|-------|---------|
| `"*"` | Anyone (including anonymous) |
| `"authenticated"` | Any logged-in user |
| `"admin"` | Users with role = admin |
| `"owner"` | Record creator only |
| `["admin", "editor"]` | Multiple roles |

---

## API Reference

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Get access + refresh tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Invalidate refresh token |
| `/api/auth/me` | GET | Get current user profile |
| `/api/auth/me` | PUT | Update current user profile |
| `/api/auth/change-password` | POST | Change password |

### OAuth Endpoints (if configured)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/oauth/google/authorize` | GET | Initiate Google OAuth |
| `/api/auth/oauth/google/callback` | GET | Google OAuth callback |
| `/api/auth/oauth/github/authorize` | GET | Initiate GitHub OAuth |
| `/api/auth/oauth/github/callback` | GET | GitHub OAuth callback |
| `/api/auth/oauth/zoom/authorize` | GET | Initiate Zoom OAuth |
| `/api/auth/oauth/zoom/callback` | GET | Zoom OAuth callback |

### CRUD Endpoints (per collection)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/{collection}` | GET | List with pagination, filtering, sorting |
| `/api/{collection}` | POST | Create new record |
| `/api/{collection}/{id}` | GET | Get single record |
| `/api/{collection}/{id}` | PUT | Update record |
| `/api/{collection}/{id}` | DELETE | Delete record (or soft-delete) |

### Query Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `page` | `?page=2` | Page number (1-indexed) |
| `limit` | `?limit=25` | Records per page (max from schema) |
| `sort` | `?sort=-created_at,title` | Sort fields (- for descending) |
| `search` | `?search=hello` | Search across searchFields |
| `{field}` | `?status=active` | Filter by field value |
| `{field}__gt` | `?price__gt=100` | Greater than |
| `{field}__lt` | `?price__lt=500` | Less than |
| `{field}__in` | `?status__in=active,pending` | In list |

### File Upload

```bash
# Upload file
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.png" \
  -F "collection=post" \
  -F "field=cover_image"
# Returns: { "url": "/uploads/abc123.png", "filename": "image.png", ... }

# Use in record
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","cover_image":"/uploads/abc123.png"}'
```

---

## GraphQL

Auto-generated GraphQL schema with queries and mutations for all collections.

### Queries

```graphql
# List with pagination
query {
  posts(page: 1, limit: 10, sort: "-created_at") {
    id
    title
    author {
      id
      name
    }
  }
}

# Single record with relations
query {
  post(id: 1) {
    id
    title
    content
    comments {
      id
      body
      user {
        name
      }
    }
  }
}
```

### Mutations

```graphql
# Create
mutation {
  createPost(input: {
    title: "Hello"
    content: "<p>World</p>"
    author: 1
  }) {
    id
    title
  }
}

# Update
mutation {
  updatePost(id: 1, input: { title: "Updated Title" }) {
    id
    title
  }
}

# Delete
mutation {
  deletePost(id: 1) {
    success
  }
}
```

---

## Multi-Tenant Mode

Run a single Runtime instance serving multiple projects with isolated data.

### Enable Multi-Tenant

```bash
MULTI_TENANT=true forma-runtime serve --port 8000
```

### Register a Project

```bash
curl -X POST http://localhost:8000/internal/register \
  -H "Content-Type: application/json" \
  -H "X-Internal-Key: your-internal-key" \
  -d '{
    "project_id": "my-project",
    "schema": { ... }
  }'
# Returns: { "success": true, "api_base": "/api/p/my-project", "collections": [...] }
```

### Access Project APIs

```bash
# REST
curl http://localhost:8000/api/p/my-project/posts

# GraphQL
curl -X POST http://localhost:8000/graphql/p/my-project \
  -H "Content-Type: application/json" \
  -d '{"query":"{ posts { id title } }"}'

# Admin
# Visit http://localhost:8000/admin → Select project
```

### Table Isolation

Each project gets prefixed tables:
```
p_myproject_users
p_myproject_posts
p_myproject_comments
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./app.db` | Database connection string |
| `JWT_SECRET` | *required* | Secret for JWT signing (32+ chars) |
| `JWT_ACCESS_EXPIRE_MINUTES` | `30` | Access token expiry |
| `JWT_REFRESH_EXPIRE_DAYS` | `7` | Refresh token expiry |
| `DEBUG` | `false` | Enable debug mode (auto-migrations) |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins |
| `MULTI_TENANT` | `false` | Enable multi-tenant mode |
| `INTERNAL_KEY` | `dev-internal-key` | Key for internal endpoints |
| `STORAGE_PROVIDER` | `local` | Storage: `local` or `s3` |
| `UPLOAD_PATH` | `./uploads` | Local upload directory |
| `S3_BUCKET` | - | S3 bucket name |
| `S3_REGION` | - | S3 region |
| `S3_ACCESS_KEY` | - | S3 access key |
| `S3_SECRET_KEY` | - | S3 secret key |
| `AI_VALIDATION_ENABLED` | `true` | Enable AI schema validation |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5-coder:32b` | Ollama model for validation |

### OAuth Configuration

```bash
# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Zoom
ZOOM_CLIENT_ID=your-client-id
ZOOM_CLIENT_SECRET=your-client-secret
```

---

## Docker

### Single Container

```bash
docker run -d \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret-key-minimum-32-characters \
  -v ./schema.json:/app/schema.json \
  -v ./uploads:/app/uploads \
  -p 8000:8000 \
  ghcr.io/axiondeeplabs/forma-runtime:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  runtime:
    image: ghcr.io/axiondeeplabs/forma-runtime:latest
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/forma
      JWT_SECRET: your-secret-key-minimum-32-characters
      DEBUG: "true"
    volumes:
      - ./schema.json:/app/schema.json
      - uploads:/app/uploads
    ports:
      - "8000:8000"
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: forma
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  uploads:
```

---

## Examples

See the `examples/` directory for complete project examples:

| Example | Description |
|---------|-------------|
| `examples/blog/` | Blog with posts, categories, comments, user auth |
| `examples/ecommerce/` | Store with products, orders, inventory, payments |
| `examples/saas/` | Multi-tenant SaaS starter with organizations |

---

## Development

### Setup

```bash
# Clone monorepo
git clone https://github.com/axiondeeplabs/forma.git
cd forma/formabase/runtime

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install with dev dependencies
pip install -e ".[dev]"
```

### Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=forma_runtime --cov-report=html

# Specific test file
pytest tests/test_api.py -v
```

### Code Quality

```bash
# Format
black forma_runtime tests
isort forma_runtime tests

# Lint
ruff check forma_runtime tests

# Type check
mypy forma_runtime
```

### Run Locally

```bash
# With example schema
python -m uvicorn forma_runtime.main:app --reload --port 8000

# With custom schema
SCHEMA_PATH=./my-schema.json python -m uvicorn forma_runtime.main:app --reload
```

---

## Roadmap

Forma is building toward a complete no-code/low-code platform. Here's what's coming:

### Coming Soon

| Feature | Description |
|---------|-------------|
| **Managed Hosting** | One-click publish to Forma Cloud - no config files, no deployment steps |
| **Custom Domains** | Connect your domain with automatic SSL |
| **Forms + Submissions** | Drag-and-drop forms with inbox and email notifications |
| **Payments (Stripe)** | Built-in checkout, subscriptions, and order management |
| **Analytics Dashboard** | Page views, visitors, and conversion tracking |

### Future

| Feature | Description |
|---------|-------------|
| **Team Collaboration** | Invite team members, roles, and permissions |
| **Version History** | Restore previous versions of your project |
| **Email Marketing** | Campaigns and automations |
| **Membership Areas** | Paid content and member-only pages |
| **White-Label** | Remove Forma branding for agencies |

See [CLAUDE.md](../../CLAUDE.md) for the complete roadmap.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## About

<p align="center">
  <strong>Axion Deep Labs</strong><br>
  Building intelligent infrastructure for modern applications.
</p>

<p align="center">
  <a href="https://axiondeep.com">Website</a> &bull;
  <a href="https://github.com/axiondeeplabs">GitHub</a> &bull;
  <a href="https://discord.gg/axiondeep">Discord</a> &bull;
  <a href="https://twitter.com/axiondeeplabs">Twitter</a>
</p>

---

<p align="center">
  <sub>Forma Runtime is part of the Forma platform by Axion Deep Labs.</sub>
</p>
