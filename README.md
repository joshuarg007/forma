<p align="center">
  <img src="forma/images/forma-logo.png" alt="Forma Logo" width="200"/>
</p>

<h1 align="center">Forma</h1>

<p align="center">
  <strong>Build full-stack React apps visually. Own everything.</strong><br>
  A visual application builder with a schema-driven backend engine.
</p>

<p align="center">
  <a href="#what-is-forma">What is Forma?</a> &bull;
  <a href="#current-status">Status</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#getting-started">Getting Started</a> &bull;
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT%20%2F%20Proprietary-blue" alt="License"/>
  <img src="https://img.shields.io/badge/Python-3.11+-green" alt="Python"/>
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Status-In%20Development-orange" alt="Status"/>
</p>

---

## What is Forma?

Forma is a **full-stack React application platform** for building, deploying, and managing web applications without writing boilerplate. It combines three things:

1. **Visual Builder** — Drag-and-drop React component design with 100+ pre-built components, styling, data binding, and export to real code (Next.js or Vite).

2. **Data Modeler** — Visual database schema design that auto-generates REST APIs, GraphQL endpoints, and authentication.

3. **Runtime Engine** — An open-source (MIT) schema-driven backend that turns a JSON schema into a working API server with auth, storage, and admin UI.

The goal: **as easy as Wix to start, but you own everything and can go anywhere.** No lock-in. Export your project as real code. Self-host the runtime. Eject whenever you want.

```
  Designer        Forma Builder        Forma Runtime
     |                 |                     |
     |   Design pages  |                     |
     |  (drag & drop)  |                     |
     |---------------->|                     |
     |                 |   Define schema     |
     |                 |  (data modeler)     |
     |                 |-------------------->|
     |                 |                     |
     |                 |   Auto-generates:   |
     |                 |   REST + GraphQL    |
     |                 |   + Auth + Admin    |
     |                 |<--------------------|
     |                 |                     |
     |   Live app      |                     |
     |<----------------|                     |
```

---

## Current Status

**Forma is in active development.** The core platform works — you can design pages, model data, generate backends, and export projects. Many advanced features (analytics, forms, blog, e-commerce, integrations) are built. The deployment pipeline and real-time collaboration are in progress.

### What works today

| Area | Status | Details |
|------|--------|---------|
| **Visual Builder** | Working | 100+ components, drag-drop canvas, styling, responsive breakpoints, live preview |
| **Data Modeler** | Working | Schema designer, relations, validation, auto-API generation |
| **Runtime Engine** | Working | REST + GraphQL + Auth from JSON schema, multi-tenant support |
| **Export** | Working | Next.js and Vite project downloads, GitHub sync |
| **Forms** | Working | Multi-step, conditional logic, submissions inbox, spam protection |
| **Analytics** | Working | Page views, events, funnels, real-time dashboard, Core Web Vitals |
| **Blog/CMS** | Working | Posts, categories, comments |
| **E-Commerce** | Built, untested E2E | Products, cart, checkout, orders (Stripe Connect not yet integrated) |
| **Collaboration** | Partial | Live cursors, presence, team chat work; conflict resolution not done |
| **Deployment** | Partial | DNS/domains/Cloudflare work; build worker not executing yet |
| **AI Features** | Minimal | Component generation works; page gen, content writer planned |

### What's not ready yet
- One-click publish (deployment worker needs to execute builds)
- Real-time collaborative editing (needs CRDT/OT)
- Stripe payments integration (endpoints exist, Connect not wired up)
- AI page generation, content writer, image generation
- CLI tool, monetization, enterprise scale features

---

## Architecture

| Component | Location | Description | License |
|-----------|----------|-------------|---------|
| **Runtime** | `formabase/runtime/` | Schema-driven backend engine | MIT |
| **Builder** | `forma/` | Visual app builder (Next.js 14 + FastAPI) | Proprietary |
| **Training** | `formacode-training/` | AI training data | Internal |

```
forma/                              # Monorepo root
├── forma/                          # Builder
│   ├── frontend/                   # Next.js 14 + React 18 + TypeScript
│   │   ├── src/app/                # App Router pages
│   │   ├── src/components/         # 194 React components
│   │   │   ├── builder/            # Visual builder (91 components)
│   │   │   ├── modeler/            # Data modeling UI
│   │   │   └── hosting/            # Domain management
│   │   └── src/stores/             # Zustand state
│   └── backend/                    # FastAPI + SQLAlchemy
│       ├── app/api/                # 40 API modules
│       ├── app/services/           # Business logic
│       └── app/db/                 # 110+ database models
│
├── formabase/                      # Core Platform
│   └── runtime/                    # Runtime Engine (MIT)
│       ├── forma_runtime/          # Python package
│       │   ├── api/                # REST router factory
│       │   ├── graphql/            # GraphQL schema factory
│       │   ├── auth/               # JWT + OAuth
│       │   ├── db/                 # Model factory
│       │   └── admin/              # Admin UI
│       └── tests/
│
└── formacode-training/             # AI Training Data
```

### How the Runtime works

Define a JSON schema, get a full backend:

```json
{
  "version": "1.0",
  "name": "my-app",
  "collections": {
    "user": {
      "auth": true,
      "fields": {
        "email": { "type": "email", "required": true, "unique": true },
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
```

```bash
forma-runtime serve --schema schema.json --port 8000

# You get:
# REST API    → http://localhost:8000/api/
# GraphQL     → http://localhost:8000/graphql
# Admin UI    → http://localhost:8000/admin
# API Docs    → http://localhost:8000/docs
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for development)

### Full Platform (Builder + Runtime)

```bash
# Clone
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

### Runtime Only (Open Source)

```bash
cd formabase/runtime
python -m venv venv && source venv/bin/activate
pip install -e ".[dev]"
forma-runtime serve --schema schema.json --port 8000
```

---

## Roadmap

### Done
- **Core platform** — Visual builder, data modeler, runtime engine, multi-tenant bridge, export, team workspaces, OAuth
- **Content & data** — Forms, blog/CMS, analytics, SEO tools, email templates, design system, localization, media library
- **Collaboration & DevEx** — Version history, comments, activity log, notifications, integrations (Slack, Discord, Zapier), backups, performance monitoring, Enterprise SSO, Figma import

### In Progress
- **Deployment pipeline** — DNS and domains work, but the build worker doesn't execute yet and the runtime isn't deployed to production
- **Real-time collaboration** — Cursors and presence work, but canvas integration and conflict resolution (CRDT/OT) are not done
- **E-Commerce** — API endpoints exist, Stripe Connect integration not wired up

### Planned
- CLI tool (`forma deploy`)
- Preview deployments
- AI page generation, content writer, image generation
- Animation editor, interaction designer
- Monetization (usage-based billing, white-label, marketplace)
- Enterprise scale (K8s, multi-region, compliance)

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

## Contributing

### Runtime (Open Source)

Contributions to the Runtime engine are welcome:

```bash
cd formabase/runtime
python -m venv venv && source venv/bin/activate
pip install -e ".[dev]"
pytest
```

### Builder (Proprietary)

The Builder is proprietary software. For licensing or partnership inquiries, contact us.

---

## License

| Component | License |
|-----------|---------|
| Forma Runtime | MIT |
| Forma Builder | Proprietary |

---

<p align="center">
  <strong>Axion Deep Labs</strong><br>
  <a href="https://axiondeep.com">Website</a> &bull;
  <a href="https://github.com/axiondeeplabs">GitHub</a>
</p>

<p align="center">
  <sub>Built with care in New Mexico.</sub>
</p>
