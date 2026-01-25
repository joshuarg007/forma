# Forma Runtime

> The open-source backend for React apps. Define your schema, get REST + GraphQL + Auth instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)

## Features

- **Schema-driven** - Define your data model in JSON, get a full API
- **REST + GraphQL** - Both APIs generated automatically
- **Authentication** - JWT auth with registration, login, refresh tokens
- **RBAC** - Role-based access control
- **Relations** - Support for one-to-one, one-to-many, many-to-many
- **File uploads** - S3-compatible storage support
- **Soft delete** - Optional soft delete for any collection
- **Timestamps** - Automatic created_at/updated_at

## Quick Start

### Installation

```bash
pip install forma-runtime
```

### Create a schema

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
      "fields": {
        "title": { "type": "text", "required": true },
        "content": { "type": "richtext" },
        "author": { "type": "relation", "target": "user", "relation": "many-to-one" }
      }
    }
  }
}
```

### Run the server

```bash
# Apply migrations
forma-runtime migrate --schema schema.json

# Start server
forma-runtime serve --schema schema.json --port 8000
```

### Use the API

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret","name":"User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'

# Create a post
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Hello World","content":"My first post","author":1}'

# List posts
curl http://localhost:8000/api/posts

# GraphQL
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ posts { id title content } }"}'
```

## Schema Reference

### Field Types

| Type | Description | Options |
|------|-------------|---------|
| `text` | String | `required`, `unique`, `minLength`, `maxLength`, `pattern` |
| `email` | Email string | `required`, `unique` |
| `integer` | Integer | `required`, `min`, `max`, `default` |
| `float` | Decimal | `required`, `min`, `max`, `precision` |
| `boolean` | True/false | `default` |
| `datetime` | ISO datetime | `required`, `nullable` |
| `date` | Date only | `required`, `nullable` |
| `enum` | Predefined options | `options[]`, `default` |
| `json` | JSON object | `default` |
| `richtext` | HTML content | `required`, `maxLength` |
| `file` | File upload | `accept[]`, `maxSize` |
| `relation` | Foreign key | `target`, `relation`, `onDelete` |

### Relation Types

| Type | Description |
|------|-------------|
| `many-to-one` | e.g., Post belongs to User |
| `one-to-many` | e.g., User has many Posts |
| `many-to-many` | e.g., Post has many Tags |
| `one-to-one` | e.g., User has one Profile |

### Collection Options

```json
{
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
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./app.db` | Database connection URL |
| `JWT_SECRET` | (required) | Secret for JWT signing |
| `DEBUG` | `false` | Enable debug mode |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins |
| `STORAGE_PROVIDER` | `local` | Storage: `local` or `s3` |
| `S3_BUCKET` | - | S3 bucket name |
| `S3_REGION` | - | S3 region |

## Docker

```bash
docker run -d \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -v ./schema.json:/app/schema.json \
  -p 8000:8000 \
  ghcr.io/formabase/runtime:latest
```

## Examples

See the `examples/` directory:

- `examples/blog/` - Blog with posts, categories, comments
- `examples/ecommerce/` - Store with products, orders, users
- `examples/saas/` - Multi-tenant SaaS starter

## Development

```bash
# Clone
git clone https://github.com/formabase/runtime.git
cd runtime

# Setup
python -m venv venv
source venv/bin/activate
pip install -e ".[dev]"

# Run tests
pytest

# Run example
python -m forma_runtime.cli serve --schema examples/blog/schema.json --reload
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Documentation](https://docs.formabase.dev)
- [GitHub](https://github.com/formabase/runtime)
- [Discord](https://discord.gg/formabase)
