# Forma — Full-Stack React Application Platform

> **FOR CLAUDE: Read the SESSION STATE section before doing anything.**

---

## SESSION STATE
**Last Updated:** 2026-02-11

### Where We Left Off
The platform has a large feature set built across the builder and runtime. The critical path to a shippable product runs through the deployment pipeline and real-time collaboration.

### What's Done
- Visual builder (drag-drop canvas, 100+ components, properties panel, live preview)
- Data modeler (schema designer, relations, validation)
- Builder ↔ Runtime bridge (multi-tenant registration, project-scoped routes)
- Forms & data collection (multi-step, conditional logic, submissions inbox, spam protection)
- Analytics & insights (page views, events, funnels, real-time dashboard, Core Web Vitals)
- Blog/CMS (posts, categories, comments)
- E-commerce kit (products, cart, checkout, orders, Stripe endpoints)
- SEO tools (meta tags, sitemaps, social cards)
- Email templates (MJML-based builder)
- Design system (tokens, themes, CSS generation)
- Media library (asset management, transforms)
- Version history (page/component versions with restore)
- Comments system (threaded, mentions, reactions)
- Notifications (in-app with preferences)
- Activity log (full audit trail)
- Scheduled publishing (queue for future publish)
- Localization/i18n (multi-language content)
- Code snippets (reusable library)
- Integrations hub (Slack, Discord, webhooks, Zapier, Zoom)
- Backup/restore (manual and scheduled)
- Import/export (ZIP/JSON project transfer)
- Performance monitoring (Core Web Vitals, budgets, alerts)
- Enterprise SSO (SAML, OIDC, Okta, Azure AD, Google Workspace)
- Figma integration (design import, token extraction)
- Live cursors, selection highlighting, page presence, team chat

### What's In Progress
- **Deployment worker** — Infrastructure exists but not executing actual builds
- **Real-time collaboration** — Cursors/presence/chat work, but canvas integration and CRDT/OT conflict resolution are not done
- **Runtime production deployment** — Code works locally, not deployed to production server

### What's Not Started
- CLI tool (`forma deploy`)
- Preview deployments
- Animation editor / interaction designer
- AI page generation, content writer, image generation, voice commands
- Monetization (billing, white-label, marketplace revenue)
- Enterprise scale (K8s, multi-region, SCIM, compliance)

### Blockers
1. Deployment worker needs to execute actual builds for one-click publish to work end-to-end
2. Runtime needs to be deployed to production for real publish flow
3. Collaboration needs CRDT/OT before it's usable for concurrent editing

---

## THE VISION

> **"As easy as Wix to start, but you own everything and can go anywhere."**

- **No lock-in** — Export everything, self-host anytime
- **Developer escape hatch** — Eject to code when needed
- **Open core** — Runtime is MIT, build on top of it
- **AI-native** — Schema generation, code generation, smart suggestions
- **Full-stack** — Not just frontend, real backend with real database

---

## ROADMAP

### Phase 1: Core Platform — Done
Visual builder, data modeler, runtime engine, multi-tenant bridge, export (Next.js/Vite), AI component generation, team workspaces, roles, OAuth.

### Phase 2: Content & Data — Done
Forms (multi-step, conditional, submissions, spam protection), blog/CMS (posts, categories, comments), analytics (page views, events, funnels, real-time), SEO tools, email templates, design system, localization, code snippets, media library.

### Phase 3: Collaboration & DevEx — Mostly Done
Version history, comments (threaded, mentions, reactions), activity log, notifications, scheduled publishing, import/export, integrations (Slack, Discord, Zapier, Zoom), backups, performance monitoring, Enterprise SSO, Figma integration, live cursors/presence/chat.

**Still needed:** Canvas integration for collaboration, CRDT/OT conflict resolution, staging environments, approval workflows.

### Phase 4: Deployment Pipeline — In Progress
DNS verification, custom domains, Cloudflare integration, deployment history — all working. Deployment worker exists but doesn't execute builds. Runtime not deployed to production.

**Still needed:** Working deployment worker, runtime production deploy, preview deployments, environment variables UI, CLI tool.

### Phase 5: E-Commerce — Partially Built
Product CRUD, cart, checkout, orders, Stripe endpoints exist in code. Not yet integrated with Stripe Connect or tested end-to-end.

**Still needed:** Stripe Connect integration, subscription billing, discount codes, tax calculation, inventory management, digital products.

### Phase 6: AI Superpowers — Minimal
Component generation from natural language works. Everything else planned.

**Still needed:** Page generation, content writer, image generation, design suggestions, accessibility checker, SEO optimizer, voice commands.

### Phase 7: Monetization & Scale — Not Started
Usage-based billing, premium features, white-label, marketplace revenue, K8s, multi-region, compliance.

---

## PROJECT STRUCTURE

| Component | Location | Description | License |
|-----------|----------|-------------|---------|
| **Runtime** | `formabase/runtime/` | Schema-driven backend (REST + GraphQL + Auth) | MIT |
| **Builder** | `forma/` | Visual React app builder | Proprietary |
| **Training** | `formacode-training/` | AI training data | Internal |

```
forma/                              # Monorepo root
├── forma/                          # Builder (Proprietary)
│   ├── frontend/                   # Next.js 14 + React + TypeScript
│   │   ├── src/app/                # App Router pages
│   │   ├── src/components/         # React components
│   │   │   ├── builder/            # Visual builder components
│   │   │   ├── modeler/            # Data modeling UI
│   │   │   └── hosting/            # Domain & hosting management
│   │   ├── src/stores/             # Zustand state management
│   │   └── src/types/              # TypeScript types
│   └── backend/                    # FastAPI backend
│       ├── app/api/                # 40 REST endpoint modules
│       ├── app/services/           # Business logic
│       ├── app/db/                 # SQLAlchemy models (110+)
│       └── app/schemas/            # Pydantic schemas
│
├── formabase/                      # Core Platform
│   └── runtime/                    # Runtime Engine (MIT)
│       ├── forma_runtime/          # Python package
│       │   ├── api/                # REST router factory
│       │   ├── graphql/            # GraphQL schema factory
│       │   ├── auth/               # JWT + OAuth providers
│       │   ├── db/                 # Model factory + migrations
│       │   ├── admin/              # Admin UI templates
│       │   └── registry.py         # Multi-tenant registry
│       └── tests/                  # Pytest test suite
│
└── formacode-training/             # AI Training Data (Internal)
```

---

## KEY FILES

### Runtime
| File | Purpose |
|------|---------|
| `forma_runtime/main.py` | FastAPI app, lifespan, multi-tenant endpoints |
| `forma_runtime/registry.py` | Multi-tenant schema registry |
| `forma_runtime/api/router_factory.py` | Generates REST routes from schema |
| `forma_runtime/graphql/schema_factory.py` | Generates GraphQL schema |
| `forma_runtime/db/model_factory.py` | Generates SQLAlchemy models |
| `forma_runtime/auth/router.py` | Auth endpoints (register, login, OAuth) |

### Builder
| File | Purpose |
|------|---------|
| `frontend/src/stores/schemaStore.ts` | Data model state management |
| `frontend/src/components/modeler/DataModeler.tsx` | Visual schema designer |
| `frontend/src/components/DeployPanel.tsx` | Publish & domains UI |
| `backend/app/api/projects.py` | Project CRUD + deploy endpoint |
| `backend/app/api/hosting.py` | Hosting & domain endpoints |
| `backend/app/services/site_generator.py` | Static/dynamic site generation |
| `backend/app/services/deployment_worker.py` | Background build execution |
| `backend/app/db/models.py` | All database models (110+) |

---

## MULTI-TENANT ARCHITECTURE

When `MULTI_TENANT=true`, Runtime supports multiple projects:

```
POST /internal/register
  → Registers project schema
  → Creates prefixed tables (p_{short_id}_{collection})
  → Mounts routes at /api/p/{project_id}/
  → Mounts GraphQL at /graphql/p/{project_id}
  → Returns api_base URL
```

---

## DEVELOPMENT COMMANDS

### Runtime
```bash
cd formabase/runtime
source venv/bin/activate
forma-runtime dev -s schema.json          # Dev server with hot reload
forma-runtime serve -s schema.json        # Production server
forma-runtime migrate -s schema.json      # Apply migrations
pytest                                     # Run tests
```

### Builder
```bash
# Backend
cd forma/backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd forma/frontend && npm run dev
```

---

## ENVIRONMENT VARIABLES

### Runtime
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/forma
JWT_SECRET=your-secret-key-minimum-32-characters
INTERNAL_KEY=shared-key-for-builder
MULTI_TENANT=true
DEBUG=true
STORAGE_PROVIDER=local  # or 's3'
```

### Builder Backend
```bash
DATABASE_URL=sqlite:///./forma.db
SECRET_KEY=your-builder-secret
RUNTIME_URL=http://localhost:8001
RUNTIME_INTERNAL_KEY=shared-key-for-builder
ANTHROPIC_API_KEY=sk-ant-...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...
```

---

## RULES
- NEVER push directly to main — use feature branches
- NEVER commit secrets or .env files
- All experiments must be reproducible via config
- Update CHANGELOG.md after significant changes
- Code style: ruff + black (Python), ESLint + Prettier (TypeScript)
- Commits: conventional format (feat:, fix:, docs:, etc.)

---

## LINKS
- **Repository**: https://github.com/axiondeeplabs/forma
- **Owner**: Axion Deep Labs (https://axiondeep.com)

---

*This document ensures session continuity. Future Claude sessions should read this first.*
