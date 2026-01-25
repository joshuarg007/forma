# Forma - Full-Stack React Application Platform

> **FOR CLAUDE: Read the SESSION STATE section before doing anything.**

---

## SESSION STATE
**Last Updated:** 2026-01-25

### Where We Left Off:
- ✅ Completed Builder → Runtime bridge (multi-tenant)
- ✅ Tests (126 passing), CI/CD, Docker, examples
- ✅ Builder UI polish: templates, tooltips, toasts, welcome tour
- ✅ In-app data editor
- ✅ Template gallery page (Backend Templates tab)
- ✅ Deployment options (Render/Railway/Docker configs)
- ✅ **Managed Hosting Infrastructure** - Backend APIs, Cloudflare integration
- ✅ **One-Click Publish UI** - PublishModal with subdomain selection
- ✅ **Production Docker Compose** - Multi-tenant Runtime deployment

### Current Sprint: Next-Gen Platform
**Goal:** Beat Wix for non-developers while staying developer-friendly

**NOW BUILDING:**
1. [x] **Managed Hosting** - One-click publish, no deployment steps ✅
2. [ ] Custom domains - Connect domain in 2 clicks (backend ready, needs UI)
3. [ ] Forms with submissions inbox
4. [ ] Payments integration (Stripe)
5. [ ] Analytics dashboard

### Blockers:
- Need to deploy Runtime to production server for real one-click publish

---

## ROADMAP: Next-Gen Full-Stack Platform

### Phase 1: Managed Hosting (CURRENT)
Make deployment invisible to users.

| Feature | Description | Status |
|---------|-------------|--------|
| **Hosted Runtime** | Forma-managed multi-tenant infrastructure | ✅ Complete |
| **One-Click Publish** | Deploy button → Live in seconds | ✅ Complete |
| **Auto-SSL** | HTTPS for all projects automatically | 🔄 Cloudflare |
| **Subdomain Routing** | `{project}.forma.app` URLs | ✅ Complete |
| **Custom Domains** | Connect your own domain | 🔄 Backend Ready |
| **Environment Variables** | Secrets management in UI | Planned |

### Phase 2: Forms & Data Collection
No-code forms that actually work.

| Feature | Description | Status |
|---------|-------------|--------|
| **Form Builder** | Drag-and-drop form component | Planned |
| **Submissions Inbox** | View form responses in dashboard | Planned |
| **Email Notifications** | Get notified on new submissions | Planned |
| **Spam Protection** | reCAPTCHA integration | Planned |
| **File Uploads** | Accept files in forms | Planned |
| **Webhooks** | Send data to external services | Planned |

### Phase 3: Payments & E-Commerce
Monetize from day one.

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe Connect** | One-click Stripe integration | Planned |
| **Product Catalog** | Products with variants | Planned |
| **Checkout Flow** | Hosted checkout pages | Planned |
| **Order Management** | Track orders and fulfillment | Planned |
| **Subscription Billing** | Recurring payments | Planned |
| **Invoices** | Auto-generated invoices | Planned |

### Phase 4: Analytics & Insights
Know your users.

| Feature | Description | Status |
|---------|-------------|--------|
| **Page Views** | Traffic analytics | Planned |
| **Visitor Tracking** | Unique visitors, sessions | Planned |
| **Event Tracking** | Custom events | Planned |
| **Conversion Funnels** | Track user journeys | Planned |
| **Real-time Dashboard** | Live activity view | Planned |
| **Export Data** | Download analytics CSV | Planned |

### Phase 5: Collaboration & Scale
Team features.

| Feature | Description | Status |
|---------|-------------|--------|
| **Team Workspaces** | Invite collaborators | Planned |
| **Role-Based Access** | Editor, Viewer roles | Planned |
| **Comments & Feedback** | Leave notes on designs | Planned |
| **Version History** | Restore previous versions | Planned |
| **Staging Environments** | Preview before publish | Planned |
| **API Rate Limiting** | Protect against abuse | Planned |

### Phase 6: Advanced Features
Power user capabilities.

| Feature | Description | Status |
|---------|-------------|--------|
| **Email Marketing** | Campaigns and automations | Planned |
| **Membership Areas** | Paid/gated content | Planned |
| **Multi-Language** | i18n support | Planned |
| **Mobile App** | iOS/Android management | Planned |
| **White-Label** | Remove Forma branding | Planned |
| **Enterprise SSO** | SAML/OIDC integration | Planned |

---

## The Vision

> **"As easy as Wix to start, but you own everything and can go anywhere."**

Forma differentiators:
- **No lock-in** - Export everything, self-host anytime
- **Developer escape hatch** - Eject to code when needed
- **Open core** - Runtime is MIT, build on top of it
- **AI-native** - Schema generation, code generation, smart suggestions
- **Full-stack** - Not just frontend, real backend with real database

---

## Project Overview

Forma is a **full-stack React application platform** with three main components:

| Component | Location | Description | License |
|-----------|----------|-------------|---------|
| **Runtime** | `formabase/runtime/` | Schema-driven backend (REST + GraphQL + Auth) | MIT |
| **Builder** | `forma/` | Visual React app builder | Proprietary |
| **Training** | `formacode-training/` | AI training data | Internal |

---

## Repository Structure

```
forma/                              # Monorepo root
├── README.md                       # Main documentation
├── CLAUDE.md                       # This file
├── .gitignore                      # Root gitignore
│
├── forma/                          # Builder (Proprietary)
│   ├── frontend/                   # Next.js 14 + React + TypeScript
│   │   ├── src/app/                # App Router pages
│   │   ├── src/components/         # React components
│   │   │   ├── modeler/            # Data modeling UI
│   │   │   └── builder/            # Visual builder components
│   │   ├── src/stores/             # Zustand state management
│   │   └── src/types/              # TypeScript types
│   ├── backend/                    # FastAPI backend
│   │   ├── app/api/                # REST endpoints
│   │   ├── app/services/           # Business logic
│   │   ├── app/db/                 # SQLAlchemy models
│   │   └── app/schemas/            # Pydantic schemas
│   ├── README.md                   # Builder documentation
│   └── CLAUDE.md                   # Builder-specific context
│
├── formabase/                      # Core Platform
│   └── runtime/                    # Runtime Engine (MIT)
│       ├── forma_runtime/          # Python package
│       │   ├── api/                # REST router factory
│       │   ├── graphql/            # GraphQL schema factory
│       │   ├── auth/               # JWT + OAuth providers
│       │   ├── db/                 # Model factory + migrations
│       │   ├── admin/              # Admin UI templates
│       │   ├── ai/                 # Schema validation
│       │   ├── cli/                # CLI commands
│       │   ├── storage/            # File storage (local/S3)
│       │   ├── schema/             # Schema parser
│       │   └── registry.py         # Multi-tenant registry
│       ├── tests/                  # Pytest test suite
│       ├── examples/               # Example projects
│       ├── pyproject.toml          # Package configuration
│       └── README.md               # Runtime documentation
│
└── formacode-training/             # AI Training Data (Internal)
```

---

## Key Files

### Runtime (formabase/runtime/)

| File | Purpose |
|------|---------|
| `forma_runtime/main.py` | FastAPI app, lifespan, multi-tenant endpoints |
| `forma_runtime/registry.py` | Multi-tenant schema registry |
| `forma_runtime/cli/main.py` | CLI commands (serve, dev, migrate, etc.) |
| `forma_runtime/api/router_factory.py` | Generates REST routes from schema |
| `forma_runtime/graphql/schema_factory.py` | Generates GraphQL schema |
| `forma_runtime/db/model_factory.py` | Generates SQLAlchemy models |
| `forma_runtime/auth/router.py` | Auth endpoints (register, login, OAuth) |
| `forma_runtime/admin/router.py` | Admin UI routes |
| `forma_runtime/ai/validator.py` | AI-powered schema validation |
| `pyproject.toml` | Package config, dependencies, CLI entry point |

### Builder (forma/)

| File | Purpose |
|------|---------|
| `frontend/src/stores/schemaStore.ts` | Data model state management |
| `frontend/src/components/modeler/DataModeler.tsx` | Visual schema designer |
| `frontend/src/app/preview/[id]/page.tsx` | Preview with data binding |
| `backend/app/api/projects.py` | Project CRUD + deploy endpoint |
| `backend/app/services/runtime_client.py` | HTTP client for Runtime |

---

## Development Commands

### Runtime

```bash
cd formabase/runtime
source venv/bin/activate

# Development server with hot reload
forma-runtime dev -s schema.json

# Run server
forma-runtime serve -s schema.json --port 8000

# Apply migrations
forma-runtime migrate -s schema.json

# Validate schema
forma-runtime validate -s schema.json

# Initialize new project
forma-runtime init my-app --template blog

# Run tests
pytest

# Type check
mypy forma_runtime

# Lint
ruff check forma_runtime
```

### Builder

```bash
# Backend
cd forma/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd forma/frontend
npm run dev
```

---

## Multi-Tenant Architecture

When `MULTI_TENANT=true`, Runtime supports multiple projects:

```
POST /internal/register
  → Registers project schema
  → Creates prefixed tables (p_{short_id}_{collection})
  → Mounts routes at /api/p/{project_id}/
  → Mounts GraphQL at /graphql/p/{project_id}
  → Returns api_base URL

GET /api/p/{project_id}/{collection}
  → Project-scoped CRUD operations

/admin
  → Lists all registered projects
  → Click project → project-specific admin UI
```

---

## Environment Variables

### Runtime

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/forma
JWT_SECRET=your-secret-key-minimum-32-characters
INTERNAL_KEY=shared-key-for-builder
MULTI_TENANT=true
DEBUG=true
STORAGE_PROVIDER=local  # or 's3'
AI_VALIDATION_ENABLED=true
OLLAMA_HOST=http://localhost:11434
```

### Builder Backend

```bash
DATABASE_URL=sqlite:///./forma.db
SECRET_KEY=your-builder-secret
RUNTIME_URL=http://localhost:8001
RUNTIME_INTERNAL_KEY=shared-key-for-builder
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Testing

### Runtime Tests

```bash
cd formabase/runtime
pytest                          # All tests
pytest tests/test_api.py -v     # Specific file
pytest --cov=forma_runtime      # With coverage
```

### Test Structure (to be implemented)

```
tests/
├── test_schema_parser.py       # Schema parsing
├── test_model_factory.py       # Model generation
├── test_router_factory.py      # Route generation
├── test_auth.py                # Authentication
├── test_multi_tenant.py        # Tenant isolation
├── test_graphql.py             # GraphQL queries
├── test_cli.py                 # CLI commands
└── conftest.py                 # Fixtures
```

---

## Git Workflow

**NEVER push directly to main.** Use feature branches:

```bash
git checkout -b feature/my-feature
# ... make changes ...
git add -A
git commit -m "Add feature"
git push -u origin feature/my-feature
# Create PR on GitHub
```

---

## Code Style

- **Python**: ruff + black + isort + mypy
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)

---

## Important Patterns

### Schema-Driven Everything

Everything flows from `schema.json`:
1. Schema → SQLAlchemy models (ModelFactory)
2. Schema → REST routes (RouterFactory)
3. Schema → GraphQL types (GraphQLSchemaFactory)
4. Schema → Admin UI forms (templates.py)
5. Schema → Pydantic schemas (auto-generated)

### Table Prefixing (Multi-Tenant)

```python
# Single tenant: posts, users, comments
# Multi-tenant: p_abc123_posts, p_abc123_users, p_xyz789_posts
table_prefix = f"p_{short_id}_" if multi_tenant else ""
```

### Auth Collection

Any collection with `"auth": true` becomes the user model:
- Gets password_hash field auto-added
- Auth routes use this collection
- JWT tokens reference this collection

---

## Common Tasks

### Add a New Field Type

1. Add to `forma_runtime/schema/types.py` (FieldType enum)
2. Add SQLAlchemy mapping in `forma_runtime/db/model_factory.py`
3. Add Pydantic mapping in `forma_runtime/api/router_factory.py`
4. Add GraphQL mapping in `forma_runtime/graphql/schema_factory.py`
5. Add admin UI handling in `forma_runtime/admin/templates.py`

### Add OAuth Provider

1. Create provider file in `forma_runtime/auth/oauth/`
2. Register in `forma_runtime/auth/oauth/__init__.py`
3. Add routes in `forma_runtime/auth/router.py`
4. Add env vars to config

### Add CLI Command

1. Add function in `forma_runtime/cli/main.py` with `@app.command()` decorator
2. Use typer for arguments/options
3. Use rich console for output

---

## Debugging Tips

### Multi-Tenant Issues

```python
# Check registered projects
print(app.state.registry.list_projects())

# Check project schema
print(app.state.registry.schemas.get("project_id"))
```

### Database Issues

```bash
# Check tables
sqlite3 app.db ".tables"

# Check schema
sqlite3 app.db ".schema p_abc123_posts"
```

### API Issues

```bash
# Check OpenAPI spec
curl http://localhost:8000/openapi.json | jq

# Check routes
curl http://localhost:8000/docs
```

---

## Links

- **Repository**: https://github.com/axiondeeplabs/forma
- **Runtime PyPI**: (not yet published)
- **Docker Hub**: (not yet published)
- **Documentation**: (not yet created)

---

## Owner

**Axion Deep Labs**
- Website: https://axiondeep.com
- GitHub: https://github.com/axiondeeplabs
- Contact: hello@axiondeep.com

---

*This document ensures session continuity. Future Claude sessions should read this first.*
