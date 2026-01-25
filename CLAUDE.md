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
- ✅ **Custom Domains** - Real DNS verification, propagation checking, enhanced UI

### Current Sprint: Full-Service Platform
**Goal:** Complete hosting platform that rivals Vercel/Netlify + Wix combined

### Blockers:
- Need to deploy Runtime to production server for real one-click publish
- Deployment worker not yet executing actual builds

---

## THE VISION

> **"As easy as Wix to start, but you own everything and can go anywhere."**

Forma differentiators:
- **No lock-in** - Export everything, self-host anytime
- **Developer escape hatch** - Eject to code when needed
- **Open core** - Runtime is MIT, build on top of it
- **AI-native** - Schema generation, code generation, smart suggestions
- **Full-stack** - Not just frontend, real backend with real database

---

## MASTER ROADMAP

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: SHIPPING & POLISH ✅ (90% Complete)
*Make deployment invisible to users*

| Feature | Description | Status |
|---------|-------------|--------|
| **Hosted Runtime** | Forma-managed multi-tenant infrastructure | ✅ Complete |
| **One-Click Publish** | Deploy button → Live in seconds | ✅ Complete |
| **Auto-SSL** | HTTPS for all projects automatically | ✅ Cloudflare |
| **Subdomain Routing** | `{project}.forma.app` URLs | ✅ Complete |
| **Custom Domains** | Connect your own domain with DNS verification | ✅ Complete |
| **DNS Propagation Check** | Check status across DNS servers | ✅ Complete |
| **Deployment Worker** | Background task that executes builds | 🔄 In Progress |
| **Preview Deployments** | Temporary URLs for testing | Planned |
| **Custom Error Pages** | Branded 404, 500 pages | Planned |
| **Environment Variables** | Secrets management in UI | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 2: FORMS & DATA COLLECTION
*No-code forms that actually work*

| Feature | Description | Status |
|---------|-------------|--------|
| **Form Builder** | Drag-and-drop form component | Planned |
| **Form Fields** | Text, email, phone, select, checkbox, file upload | Planned |
| **Submissions Inbox** | View form responses in dashboard | Planned |
| **Email Notifications** | Get notified on new submissions | Planned |
| **Spam Protection** | reCAPTCHA / hCaptcha integration | Planned |
| **File Uploads** | Accept files in forms with size limits | Planned |
| **Conditional Logic** | Show/hide fields based on inputs | Planned |
| **Multi-step Forms** | Wizard-style form progression | Planned |
| **Form Analytics** | Completion rates, drop-off points | Planned |
| **Export Submissions** | CSV, JSON export | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 3: PAYMENTS & E-COMMERCE
*Monetize from day one*

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe Connect** | One-click Stripe integration | Planned |
| **Product Components** | Product cards, grids, carousels | Planned |
| **Shopping Cart** | Add to cart, cart drawer/page | Planned |
| **Checkout Flow** | Hosted checkout pages | Planned |
| **Order Management** | Track orders and fulfillment | Planned |
| **Subscription Billing** | Recurring payments, plan management | Planned |
| **Invoices** | Auto-generated invoices | Planned |
| **Discount Codes** | Promo codes, percentage/fixed discounts | Planned |
| **Tax Calculation** | Automatic tax via Stripe Tax | Planned |
| **Inventory Management** | Stock tracking, low stock alerts | Planned |
| **Digital Products** | Downloadable files after purchase | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 4: ANALYTICS & INSIGHTS
*Know your users*

| Feature | Description | Status |
|---------|-------------|--------|
| **Built-in Analytics** | Privacy-friendly, no cookies | Planned |
| **Page Views** | Traffic analytics per page | Planned |
| **Visitor Tracking** | Unique visitors, sessions, bounce rate | Planned |
| **Geographic Data** | Visitor locations (country/city) | Planned |
| **Device/Browser** | Device types, browsers, OS | Planned |
| **Referrer Tracking** | Where traffic comes from | Planned |
| **Event Tracking** | Custom events via data attributes | Planned |
| **Conversion Funnels** | Track user journeys through steps | Planned |
| **Goal Tracking** | Define and track conversion goals | Planned |
| **Real-time Dashboard** | Live activity view | Planned |
| **Heatmaps** | Click and scroll heatmaps | Planned |
| **Session Recordings** | Replay user sessions (opt-in) | Planned |
| **A/B Testing** | Test different page versions | Planned |
| **Export Data** | Download analytics CSV/JSON | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 5: DEVELOPER EXPERIENCE
*Power user capabilities*

| Feature | Description | Status |
|---------|-------------|--------|
| **CLI Tool** | `forma deploy` from terminal | Planned |
| **Git Integration** | Auto-deploy on push to main | Planned |
| **GitHub Sync** | Two-way sync with GitHub repo | Planned |
| **Branch Previews** | Preview deployments per branch | Planned |
| **Environment Variables** | Per-environment secrets | Planned |
| **Build Logs** | Real-time streaming build logs | Planned |
| **Runtime Logs** | Access server logs | Planned |
| **Custom Build Commands** | Override build process | Planned |
| **Monorepo Support** | Deploy from subdirectory | Planned |
| **Webhooks** | Trigger external services on events | Planned |
| **API Keys** | Generate API keys for external access | Planned |
| **GraphQL Playground** | In-app GraphQL explorer | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 6: COLLABORATION & TEAMS
*Team features*

| Feature | Description | Status |
|---------|-------------|--------|
| **Team Workspaces** | Organization-level projects | Planned |
| **Role-Based Access** | Owner, Admin, Editor, Viewer | Planned |
| **Real-time Collaboration** | Figma-style live cursors | Planned |
| **Comments & Annotations** | Leave notes on components | Planned |
| **Version History** | Visual diffs, restore versions | Planned |
| **Staging Environments** | Preview before publish | Planned |
| **Approval Workflows** | Require approval before deploy | Planned |
| **Activity Log** | Audit trail of all changes | Planned |
| **Guest Access** | Share preview with clients | Planned |
| **Handoff Mode** | Export specs for developers | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 7: BUILDER POWER-UPS
*Advanced visual building*

| Feature | Description | Status |
|---------|-------------|--------|
| **E-commerce Kit** | Product cards, cart, checkout components | Planned |
| **Auth Components** | Login, signup, password reset forms | Planned |
| **Blog/CMS Kit** | Post editor, categories, tags | Planned |
| **Dashboard Kit** | Charts, tables, stats components | Planned |
| **Form Builder Kit** | Multi-step, conditional, validation | Planned |
| **Animation Editor** | Visual keyframe animations | Planned |
| **Interaction Designer** | Click, hover, scroll triggers | Planned |
| **Global Styles** | Design tokens, theme variables | Planned |
| **Custom Components** | Create reusable components | Planned |
| **Component Variants** | Multiple states per component | Planned |
| **Responsive Editor** | Per-breakpoint styling | Planned |
| **Symbol Overrides** | Localized content in instances | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 8: INTEGRATIONS
*Connect everything*

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe** | Payments, subscriptions | Planned |
| **Google Analytics** | GA4 integration | Planned |
| **Plausible** | Privacy-first analytics | Planned |
| **Mailchimp** | Email list management | Planned |
| **SendGrid** | Transactional emails | Planned |
| **Resend** | Modern email API | Planned |
| **Slack** | Notifications to Slack | Planned |
| **Discord** | Notifications to Discord | Planned |
| **Zapier** | 5000+ app connections | Planned |
| **Make (Integromat)** | Automation workflows | Planned |
| **Airtable** | Database sync | Planned |
| **Notion** | Content sync | Planned |
| **Google Sheets** | Spreadsheet as database | Planned |
| **Algolia** | Search integration | Planned |
| **Meilisearch** | Self-hosted search | Planned |
| **Cloudinary** | Image optimization | Planned |
| **Uploadcare** | File uploads | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 9: AI SUPERPOWERS
*AI-native features*

| Feature | Description | Status |
|---------|-------------|--------|
| **Page Generation** | "Build me a landing page for X" | Planned |
| **Component Generation** | Natural language to component | ✅ Complete |
| **Content Writer** | Generate copy for sections | Planned |
| **Image Generation** | AI placeholders and hero images | Planned |
| **Design Suggestions** | "This page needs a CTA" | Planned |
| **Accessibility Checker** | AI-powered a11y audit | Planned |
| **SEO Optimizer** | Auto-generate meta, titles | Planned |
| **Code Explainer** | Understand exported code | Planned |
| **Smart Fill** | Auto-populate from context | Planned |
| **Design to Code** | Screenshot/Figma to components | Planned |
| **Voice Commands** | "Add a pricing section" | Planned |
| **Auto-Layout** | AI arranges components | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 10: RUNTIME EVOLUTION
*Backend power*

| Feature | Description | Status |
|---------|-------------|--------|
| **GraphQL Subscriptions** | Real-time data | Planned |
| **Webhooks System** | Outgoing webhooks on events | Planned |
| **Scheduled Jobs** | Cron-like functionality | Planned |
| **Edge Functions** | Custom server logic | Planned |
| **Background Jobs** | Async task processing | Planned |
| **File Storage** | Image/file uploads with CDN | ✅ Complete |
| **Email Sending** | Transactional emails from Runtime | Planned |
| **Push Notifications** | Web push support | Planned |
| **Rate Limiting** | Per-user/endpoint limits | Planned |
| **Caching Layer** | Redis caching for queries | Planned |
| **Database Branching** | Preview environments with data | Planned |
| **Query Builder** | Visual query construction | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 11: MONETIZATION & REVENUE
*Make money with Forma*

| Feature | Description | Status |
|---------|-------------|--------|
| **Usage-Based Billing** | Bandwidth, builds, API calls | Planned |
| **Premium Domains** | Multiple custom domains | Planned |
| **Remove Branding** | No "Built with Forma" badge | Planned |
| **Priority Builds** | Faster build queue | Planned |
| **Priority Support** | Dedicated support | Planned |
| **White-Label** | Resell Forma to clients | Planned |
| **Agency Dashboard** | Manage multiple clients | Planned |
| **Affiliate Program** | Earn commission on referrals | Planned |
| **Marketplace Revenue** | Sell components/templates | Planned |

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 12: ENTERPRISE & SCALE
*Enterprise-ready*

| Feature | Description | Status |
|---------|-------------|--------|
| **SSO/SAML** | Enterprise single sign-on | Planned |
| **SCIM Provisioning** | Auto user management | Planned |
| **Audit Logs** | Compliance-ready logging | Planned |
| **Data Residency** | Choose data location | Planned |
| **SLA Guarantees** | Uptime commitments | Planned |
| **Dedicated Infrastructure** | Isolated deployment | Planned |
| **Custom Contracts** | Enterprise agreements | Planned |
| **Kubernetes Helm** | K8s deployment charts | Planned |
| **Horizontal Scaling** | Auto-scaling infrastructure | Planned |
| **Multi-Region** | Global edge deployment | Planned |
| **Compliance** | SOC 2, GDPR, HIPAA | Planned |

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
├── CHANGELOG.md                    # Version history
├── .gitignore                      # Root gitignore
│
├── forma/                          # Builder (Proprietary)
│   ├── frontend/                   # Next.js 14 + React + TypeScript
│   │   ├── src/app/                # App Router pages
│   │   ├── src/components/         # React components
│   │   │   ├── modeler/            # Data modeling UI
│   │   │   ├── builder/            # Visual builder components
│   │   │   └── hosting/            # Domain & hosting management
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
| `frontend/src/components/DeployPanel.tsx` | Publish & domains UI |
| `frontend/src/components/hosting/` | Domain & hosting management |
| `frontend/src/app/preview/[id]/page.tsx` | Preview with data binding |
| `backend/app/api/projects.py` | Project CRUD + deploy endpoint |
| `backend/app/api/hosting.py` | Hosting & domain endpoints |
| `backend/app/services/runtime_client.py` | HTTP client for Runtime |
| `backend/app/services/dns_verification.py` | DNS record verification |

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
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...
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
