<p align="center">
  <img src="forma/images/forma-logo.png" alt="Forma Logo" width="200"/>
</p>

<h1 align="center">Forma</h1>

<p align="center">
  <strong>The Full-Stack React Application Platform</strong><br>
  Build, deploy, and scale React applications with visual tools and instant backends.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#products">Products</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#documentation">Documentation</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT%20%2F%20Proprietary-blue" alt="License"/>
  <img src="https://img.shields.io/badge/Python-3.11+-green" alt="Python"/>
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript"/>
</p>

---

## What is Forma?

Forma is a **full-stack React application platform** that combines:

- **Visual Builder** - Drag-and-drop React component design with 100+ pre-built components
- **Data Modeler** - Visual database schema design with instant API generation
- **Runtime Engine** - Schema-driven backend with REST, GraphQL, and authentication

Think **Bubble meets Retool**, but generating real React code you own.

```
  User        Forma Builder        Forma Runtime
   |               |                    |
   |  Design UI    |                    |
   |-------------->|                    |
   |               |   Define Schema    |
   |               |------------------->|
   |               |                    |
   |               |   Deploy Backend   |
   |               |------------------->|
   |               |                    |
   |               |<-- REST/GraphQL ---|
   |               |                    |
   |  Use App      |                    |
   |<--------------|                    |
```

---

## Products

| Product | Description | License | Status |
|---------|-------------|---------|--------|
| **[Forma Runtime](formabase/runtime)** | Open-source backend engine. Schema-driven REST + GraphQL + Auth. | MIT | Stable |
| **[Forma Builder](forma)** | Visual React app builder with 100+ components, AI generation, team collaboration. | Proprietary | Beta |
| **Forma CMS** | Content management interface for Runtime data. | Proprietary | Alpha |

---

## Quick Start

### Option 1: Runtime Only (Open Source)

Build backends without the visual builder:

```bash
# Install
pip install forma-runtime

# Create schema.json
cat > schema.json << 'EOF'
{
  "version": "1.0",
  "name": "my-app",
  "collections": {
    "user": {
      "auth": true,
      "fields": {
        "email": { "type": "email", "required": true, "unique": true },
        "password_hash": { "type": "text", "required": true },
        "name": { "type": "text" }
      }
    },
    "post": {
      "timestamps": true,
      "fields": {
        "title": { "type": "text", "required": true },
        "content": { "type": "richtext" },
        "author": { "type": "relation", "target": "user" }
      }
    }
  }
}
EOF

# Run
forma-runtime serve --schema schema.json --port 8000

# You now have:
# - REST API at http://localhost:8000/api/
# - GraphQL at http://localhost:8000/graphql
# - Admin UI at http://localhost:8000/admin
# - API Docs at http://localhost:8000/docs
```

### Option 2: Full Platform (Builder + Runtime)

```bash
# Clone monorepo
git clone https://github.com/axiondeeplabs/forma.git
cd forma

# Start Runtime (Terminal 1)
cd formabase/runtime
python -m venv venv && source venv/bin/activate
pip install -e ".[dev]"
MULTI_TENANT=true python -m uvicorn forma_runtime.main:app --reload --port 8001

# Start Builder Backend (Terminal 2)
cd forma/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Start Builder Frontend (Terminal 3)
cd forma/frontend
npm install && npm run dev

# Open http://localhost:3000
```

---

## Architecture

```
forma/                          # Monorepo root
├── forma/                      # Builder (Proprietary)
│   ├── frontend/               # Next.js 14 + React + TypeScript
│   │   ├── src/app/            # App Router pages
│   │   ├── src/components/     # React components
│   │   └── src/stores/         # Zustand state
│   └── backend/                # FastAPI + SQLAlchemy
│       ├── app/api/            # REST endpoints
│       ├── app/services/       # Business logic
│       └── app/db/             # Database models
│
├── formabase/                  # Core Platform
│   └── runtime/                # Runtime Engine (MIT)
│       ├── forma_runtime/      # Python package
│       │   ├── api/            # REST router factory
│       │   ├── graphql/        # GraphQL schema factory
│       │   ├── auth/           # JWT + OAuth
│       │   ├── db/             # SQLAlchemy model factory
│       │   ├── admin/          # Admin UI templates
│       │   └── ai/             # Schema validation
│       └── tests/              # Pytest suite
│
└── formacode-training/         # AI Training Data (Internal)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FORMA BUILDER                               │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────────┐ │
│  │ Visual       │    │ Data         │    │ Project               │ │
│  │ Canvas       │    │ Modeler      │    │ Dashboard             │ │
│  │              │    │              │    │                       │ │
│  │ - Drag/drop  │    │ - Schema     │    │ - Pages               │ │
│  │ - 100+ comps │    │ - Relations  │    │ - Settings            │ │
│  │ - Styling    │    │ - Validation │    │ - Team                │ │
│  └──────┬───────┘    └──────┬───────┘    └───────────────────────┘ │
│         │                   │                                       │
│         │    ┌──────────────┴──────────────┐                       │
│         │    │         Export               │                       │
│         │    │  - Next.js zip               │                       │
│         │    │  - Vite zip                  │                       │
│         │    │  - GitHub sync               │                       │
│         │    └──────────────────────────────┘                       │
│         │                                                           │
│         └──────────────────┬────────────────────────────────────────┤
│                            │ Deploy Backend                         │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    /internal/register                           ││
│  │  POST { project_id, schema } → Create tables, mount routes      ││
│  └─────────────────────────────────────────────────────────────────┘│
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FORMA RUNTIME                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Schema Registry                            │  │
│  │  project_abc → { schema, models, routes }                     │  │
│  │  project_xyz → { schema, models, routes }                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐   │
│  │ REST API       │  │ GraphQL API    │  │ Auth API           │   │
│  │                │  │                │  │                    │   │
│  │ /api/p/{id}/   │  │ /graphql/p/{id}│  │ /api/p/{id}/auth/  │   │
│  │ - GET /posts   │  │ - queries      │  │ - register         │   │
│  │ - POST /posts  │  │ - mutations    │  │ - login            │   │
│  │ - PUT /posts/1 │  │ - subscriptions│  │ - refresh          │   │
│  │ - DELETE       │  │                │  │ - oauth/*          │   │
│  └────────────────┘  └────────────────┘  └────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL / SQLite                        │  │
│  │  p_abc_posts, p_abc_users, p_xyz_products, ...               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Runtime (Open Source)

| Category | Features |
|----------|----------|
| **API Generation** | REST endpoints, GraphQL schema, OpenAPI docs |
| **Authentication** | JWT tokens, OAuth (Google, GitHub, Zoom), role-based access |
| **Data Modeling** | Relations, validations, computed fields, soft delete |
| **Storage** | Local filesystem, S3-compatible, file/image uploads |
| **Admin** | Built-in admin UI, data browser, schema explorer |
| **Multi-tenant** | Project isolation, table prefixing, route scoping |
| **AI Validation** | Schema safety rails via Ollama integration |

### Builder (Proprietary)

| Category | Features |
|----------|----------|
| **Visual Design** | Drag-drop canvas, 100+ components, responsive breakpoints |
| **Styling** | Properties panel, theme system, animations, 3D transforms |
| **AI Generation** | Natural language to React components via Claude |
| **Collaboration** | Team invites, roles, real-time cursors |
| **Data Binding** | Connect components to API endpoints |
| **Export** | Next.js, Vite, GitHub sync |
| **Marketplace** | Browse, publish, purchase components |

---

## Documentation

| Resource | Description |
|----------|-------------|
| [Runtime README](formabase/runtime/README.md) | Schema reference, API examples, configuration |
| [Builder README](forma/README.md) | Component library, builder features, tech stack |
| [API Reference](forma/docs/api.md) | Full endpoint documentation |
| [Schema Guide](formabase/runtime/docs/schema.md) | Field types, relations, permissions |

---

## Environment Variables

### Runtime

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/forma

# Security
JWT_SECRET=your-secret-key-minimum-32-characters
INTERNAL_KEY=shared-key-for-builder-communication

# Mode
MULTI_TENANT=true  # Enable project isolation
DEBUG=true         # Auto-migrations, verbose logging

# AI Validation (optional)
AI_VALIDATION_ENABLED=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:32b

# Storage
STORAGE_PROVIDER=local  # or 's3'
UPLOAD_PATH=./uploads
```

### Builder Backend

```bash
# Database
DATABASE_URL=sqlite:///./forma.db

# Security
SECRET_KEY=your-builder-secret-key

# Runtime Connection
RUNTIME_URL=http://localhost:8001
RUNTIME_INTERNAL_KEY=shared-key-for-builder-communication

# AI
ANTHROPIC_API_KEY=sk-ant-...

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
```

---

## Use Cases

### 1. Internal Tools

Build admin dashboards, data management interfaces, and reporting tools without writing backend code.

```json
{
  "collections": {
    "employee": { ... },
    "department": { ... },
    "timesheet": { ... }
  }
}
```

### 2. SaaS MVPs

Prototype full-stack applications with user authentication, data storage, and APIs in hours instead of weeks.

### 3. Content-Heavy Sites

Combine visual page building with dynamic data. Blog posts, product catalogs, event listings.

### 4. Client Projects

Agencies can rapidly build custom applications and hand over maintainable React code.

---

## Roadmap

### Phase 1: Managed Hosting ✅ (90% Complete)
*Make deployment invisible to users*

- [x] One-click publish to forma.app subdomain
- [x] Auto-SSL via Cloudflare
- [x] Custom domain support with DNS verification
- [x] DNS propagation checking
- [x] Deployment history with rollback
- [ ] Background deployment worker
- [ ] Preview deployments
- [ ] Environment variables UI

### Phase 2: Forms & Data Collection ✅ Complete
*No-code forms that actually work*

- [x] Drag-and-drop form builder
- [x] Submissions inbox dashboard
- [x] Email notifications
- [x] Spam protection (reCAPTCHA)
- [x] File uploads in forms
- [x] Conditional logic
- [x] Multi-step wizard forms

### Phase 3: Payments & E-Commerce
*Monetize from day one*

- [ ] Stripe Connect integration
- [ ] Product components (cards, grids)
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order management
- [ ] Subscription billing
- [ ] Discount codes

### Phase 4: Analytics & Insights ✅ Complete
*Know your users*

- [x] Built-in privacy-friendly analytics
- [x] Page views & visitor tracking
- [x] Event tracking
- [x] Conversion funnels
- [x] Real-time dashboard
- [x] Performance monitoring (Core Web Vitals)
- [x] A/B testing (experiments framework)

### Phase 5: Developer Experience ✅ Complete
*Power user capabilities*

- [x] GitHub integration (two-way sync)
- [x] Webhooks system
- [x] API keys management
- [x] Import/Export (ZIP/JSON)
- [x] Code snippets library
- [ ] CLI tool (`forma deploy`)
- [ ] Branch preview deployments

### Phase 6: Collaboration & Teams ✅ (80% Complete)
*Team features*

- [x] Team workspaces
- [x] Role-based access
- [x] Comments & annotations (threaded with mentions)
- [x] Version history with restore
- [x] Activity log (audit trail)
- [x] Notifications system
- [ ] Real-time collaboration (Figma-style cursors)
- [ ] Staging environments

### Phase 7: Builder Power-Ups ✅ (70% Complete)
*Advanced visual building*

- [x] Blog/CMS kit
- [x] Design system (tokens, themes)
- [x] Email templates
- [x] SEO tools
- [x] Scheduled publishing
- [x] Localization/i18n
- [ ] Animation editor
- [ ] E-commerce component kit

### Phase 8: Integrations ✅ Complete
*Connect everything*

- [x] Slack notifications
- [x] Discord notifications
- [x] Webhooks (outgoing)
- [x] Zapier integration
- [x] Zoom (OAuth + transcripts)
- [x] Backup/Restore system
- [ ] Stripe, PayPal
- [ ] Analytics (GA, Plausible)

### Phase 9: AI Superpowers
*AI-native features*

- [x] Component generation from natural language
- [ ] Full page generation
- [ ] Content/copy writer
- [ ] Image generation
- [ ] Design suggestions
- [ ] Accessibility checker
- [ ] SEO optimizer

### Phase 10: Runtime Evolution ✅ (60% Complete)
*Backend power*

- [x] File storage (local + S3)
- [x] Webhooks system
- [x] Scheduled jobs (publishing)
- [x] Media library
- [ ] GraphQL subscriptions (real-time)
- [ ] Edge functions
- [ ] Redis caching

### Phase 11: Monetization
*Revenue features*

- [ ] Usage-based billing
- [ ] Premium domain features
- [ ] White-label for agencies
- [ ] Marketplace revenue share
- [ ] Affiliate program

### Phase 12: Enterprise & Scale
*Enterprise-ready*

- [x] Audit logs (activity tracking)
- [x] SSO/SAML (Okta, Azure AD, Google Workspace)
- [x] Figma Integration (design import)
- [ ] Data residency
- [ ] SLA guarantees
- [ ] Kubernetes Helm charts
- [ ] Multi-region deployment
- [ ] SOC 2, GDPR compliance

---

## Contributing

### Runtime (Open Source)

We welcome contributions to the Runtime engine:

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/forma.git
cd forma/formabase/runtime

# Setup
python -m venv venv && source venv/bin/activate
pip install -e ".[dev]"

# Run tests
pytest

# Submit PR
```

### Builder (Proprietary)

The Builder is proprietary software. For enterprise licensing or partnership inquiries, contact us.

---

## License

| Component | License |
|-----------|---------|
| Forma Runtime | MIT License |
| Forma Builder | Proprietary |
| Forma CMS | Proprietary |

---

## About

<p align="center">
  <strong>Axion Deep Labs</strong><br>
  Building the future of application development.
</p>

<p align="center">
  <a href="https://axiondeep.com">Website</a> &bull;
  <a href="https://github.com/axiondeeplabs">GitHub</a> &bull;
  <a href="https://discord.gg/axiondeep">Discord</a> &bull;
  <a href="https://twitter.com/axiondeeplabs">Twitter</a>
</p>

---

<p align="center">
  <sub>Forma is a product of Axion Deep Labs. Built with care in New Mexico.</sub>
</p>
