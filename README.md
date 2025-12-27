# Formabase

**Full-Stack React App Builder** - Build complete React applications visually with a no-code builder, data modeling, and instant deployment.

---

## Overview

Formabase started as Forma, a visual page builder similar to Elementor/Webflow. It has evolved into a **full-stack React application builder** — think Bubble or Retool, but generating real React code.

Users can drag-and-drop components to build multi-page React websites, connect to data sources, design database schemas visually, and export production-ready code.

## Product Suite

| Product | Description | License |
|---------|-------------|---------|
| **Runtime** | Standalone backend service for data management | MIT (Open Source) |
| **Builder** | Visual app builder with 100+ components | Proprietary (SaaS) |
| **CMS** | Content management for dynamic data | Proprietary (SaaS) |

---

## Features

### Visual Builder

| Feature | Description |
|---------|-------------|
| **Drag-Drop Canvas** | Visual component placement with alignment guides |
| **100+ Components** | Heroes, navbars, forms, cards, dashboards, and more |
| **Click or Drag** | Both methods for adding components |
| **Component Toolbar** | Move, align, duplicate, delete, lock, hide |
| **Multi-Page Projects** | Create, rename, duplicate, delete, reorder pages |
| **Device Preview** | Desktop, tablet, mobile viewport toggles |
| **Undo/Redo** | Full history management |
| **Zoom Controls** | Canvas zoom in/out |

### Styling & Design

| Feature | Description |
|---------|-------------|
| **Properties Panel** | Typography, colors, spacing, borders, shadows |
| **Responsive Styles** | Different styles per breakpoint |
| **Animations** | Entrance, hover, scroll, loop animations |
| **3D Transforms** | RotateX/Y/Z, translate, scale, perspective |
| **Theme System** | Design tokens, color palettes, font management |
| **Style Presets** | Pre-built style combinations |

### AI-Powered

| Feature | Description |
|---------|-------------|
| **Component Generation** | Describe in natural language, get React code |
| **Component Editing** | Modify existing components via prompts |
| **Intent History** | Version control by natural language intent |

### Team Collaboration

| Feature | Description |
|---------|-------------|
| **Team Invites** | Invite by email with role selection |
| **Role Permissions** | Owner, Admin, Editor, Viewer |
| **Real-time Presence** | See collaborators' cursors via WebSocket |

### Import/Export

| Feature | Description |
|---------|-------------|
| **Figma Import** | Parse Figma JSON, convert to components |
| **Export to Next.js** | Full Next.js project as zip |
| **Export to Vite** | Standalone Vite + React zip |
| **GitHub Sync** | Push/pull components to repository |

### Marketplace

| Feature | Description |
|---------|-------------|
| **Browse Components** | Search, filter by category |
| **Publish Components** | Free or paid listings |
| **Purchase Flow** | Stripe integration for paid components |
| **Creator Payouts** | Stripe Connect for creators |

### Data & Integrations

| Feature | Description |
|---------|-------------|
| **Data Binding** | Connect components to API endpoints |
| **Code Injection** | Custom CSS/JS per component |
| **SEO Metadata** | Per-page meta title, description, OG image |
| **Performance Score** | Page metrics display |

---

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 3.4** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **Monaco Editor** for code editing
- **Radix UI** for accessible primitives
- **Lucide React** for icons

### Backend
- **Python 3.12** with FastAPI
- **SQLAlchemy 2.0** ORM with SQLite/PostgreSQL
- **Alembic** for migrations
- **Anthropic Claude** for AI generation
- **Stripe** for payments
- **Celery** for background tasks
- **WebSockets** for real-time collaboration
- **SendGrid** for email
- **JWT** authentication with bcrypt

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/formabase/forma.git
cd forma

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URL
```

### Running Locally

```bash
# Terminal 1 - Backend (port 8000)
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate
pytest

# Frontend type checking
cd frontend
npm run build
```

---

## Project Structure

```
forma/
├── backend/
│   ├── app/
│   │   ├── api/                 # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── projects.py      # Project CRUD
│   │   │   ├── pages.py         # Page management
│   │   │   ├── components.py    # Component CRUD
│   │   │   ├── ai.py            # Claude AI integration
│   │   │   ├── teams.py         # Team collaboration
│   │   │   ├── marketplace.py   # Component marketplace
│   │   │   ├── templates.py     # Pre-built templates
│   │   │   ├── github.py        # GitHub OAuth & sync
│   │   │   ├── uploads.py       # File uploads
│   │   │   ├── billing.py       # Stripe subscriptions
│   │   │   └── websocket.py     # Real-time collaboration
│   │   ├── core/                # Configuration
│   │   ├── db/
│   │   │   └── models.py        # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/
│   │   │   ├── forma_ai.py      # Claude API integration
│   │   │   ├── export.py        # Next.js/Vite export
│   │   │   ├── github_sync.py   # GitHub integration
│   │   │   ├── email.py         # Email service
│   │   │   ├── uploads.py       # File handling
│   │   │   ├── billing.py       # Stripe service
│   │   │   └── websocket.py     # WebSocket manager
│   │   ├── templates/           # Export templates
│   │   ├── worker/
│   │   │   ├── celery_app.py    # Celery config
│   │   │   └── tasks.py         # Background tasks
│   │   └── main.py              # FastAPI application
│   ├── tests/                   # Backend tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── auth/            # Login/Register
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── builder/[id]/    # Main visual builder
│   │   │   ├── preview/[id]/    # Full-page preview
│   │   │   ├── marketplace/     # Component marketplace
│   │   │   └── settings/        # User settings
│   │   ├── components/
│   │   │   ├── VisualCanvas.tsx       # Drag-drop canvas
│   │   │   ├── ComponentLibrary.tsx   # Component sidebar
│   │   │   ├── PropertiesPanel.tsx    # Styling panel
│   │   │   ├── PagesSidebar.tsx       # Page management
│   │   │   ├── ThemePanel.tsx         # Design tokens
│   │   │   ├── DataBindingPanel.tsx   # API connections
│   │   │   ├── CodeInjectionPanel.tsx # Custom CSS/JS
│   │   │   ├── Transform3DPanel.tsx   # 3D transforms
│   │   │   ├── TeamPanel.tsx          # Collaboration
│   │   │   └── ...
│   │   ├── stores/
│   │   │   ├── projectStore.ts  # Projects, pages, components
│   │   │   ├── authStore.ts     # Authentication
│   │   │   └── themeStore.ts    # Theme tokens
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   └── types/
│   │       ├── index.ts         # Core interfaces
│   │       └── components.ts    # Component types
│   ├── package.json
│   └── .env.example
├── docs/                        # Documentation
├── CLAUDE.md                    # Session continuity
├── FORMABASE_ROADMAP.md         # Technical roadmap
└── README.md
```

---

## Environment Variables

### Backend (`.env`)

```bash
# Database
DATABASE_URL=sqlite:///./forma.db

# Security
SECRET_KEY=your-secret-key-min-32-chars

# AI (required for component generation)
ANTHROPIC_API_KEY=sk-ant-...

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get access + refresh tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Invalidate tokens |
| `/api/auth/me` | GET | Get current user |

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List user's projects |
| `/api/projects` | POST | Create project (auto-creates home page) |
| `/api/projects/{id}` | GET | Get project details |
| `/api/projects/{id}` | PUT | Update project |
| `/api/projects/{id}` | DELETE | Delete project |

### Pages

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/{id}/pages` | GET | List pages |
| `/api/projects/{id}/pages` | POST | Create page |
| `/api/projects/{id}/pages/{page_id}` | PUT | Update page (canvas, meta) |
| `/api/projects/{id}/pages/{page_id}` | DELETE | Delete page |
| `/api/projects/{id}/pages/{page_id}/duplicate` | POST | Duplicate page |

### AI

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate` | POST | Generate component from prompt |
| `/api/ai/edit` | POST | Edit existing component |
| `/api/ai/explain` | POST | Explain component code |

### Teams

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/{id}/team` | GET | List team members |
| `/api/projects/{id}/team/invite` | POST | Invite member |
| `/api/projects/{id}/team/{member_id}` | DELETE | Remove member |
| `/api/projects/{id}/team/accept` | POST | Accept invite |

### Marketplace

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/marketplace` | GET | Browse listings |
| `/api/marketplace/{id}` | GET | Get listing details |
| `/api/marketplace/publish` | POST | Publish component |
| `/api/marketplace/{id}/purchase` | POST | Purchase component |

---

## Database Schema

### Core Models

```
User
├── id, email, password_hash, name
├── plan (free/pro/enterprise)
├── stripe_customer_id
└── github_access_token

Project
├── id, user_id, name
├── design_system (JSON)
└── settings (JSON)

Page
├── id, project_id, name, slug
├── canvas_components (JSON array)
├── is_homepage, position
└── meta_title, meta_description, og_image

Component (AI-generated)
├── id, project_id, name
├── code (React component)
└── intent (generation prompt)

ProjectMember
├── id, project_id, user_id
└── role (owner/admin/editor/viewer)

MarketplaceListing
├── id, component_id, user_id
├── title, description, category
├── price, is_free
└── downloads, rating
```

---

## Component Categories

The component library includes 100+ pre-built components:

- **Heroes** - Full-width landing sections
- **Navbars** - Navigation headers
- **Features** - Feature grids and lists
- **Pricing** - Pricing tables and cards
- **Testimonials** - Customer quotes
- **FAQ** - Accordion FAQ sections
- **CTA** - Call-to-action blocks
- **Footers** - Page footers
- **Cards** - Content cards
- **Forms** - Input forms
- **Stats** - Statistics displays
- **Teams** - Team member grids
- **Logos** - Logo clouds
- **Galleries** - Image galleries
- **Sidebars** - Navigation sidebars
- **Dashboards** - Dashboard widgets
- **Grids** - Layout grids
- **Sections** - Generic sections
- **Dividers** - Visual separators
- **Spacers** - Vertical spacing

---

## Architecture Decisions

1. **Canvas State**: Stored as JSON in `Page.canvas_components`, not as separate records. Simplifies undo/redo and page duplication.

2. **Component Library**: Pre-built components defined inline in `ComponentLibrary.tsx`. Preview renderers separate in `preview/[id]/page.tsx`.

3. **Authentication**: JWT with access (30min) + refresh (7 days) tokens. Stored in localStorage via Zustand persist.

4. **AI Components**: Generated code stored in `Component.code`. Intent history tracked in `Intention` table.

5. **Multi-page**: Each Page has its own `canvas_components` JSON. Auto-creates "Home" page on project creation.

6. **Preview**: Uses localStorage to pass canvas state from builder to preview tab. Key: `forma-preview-{projectId}`.

---

## Known Gotchas

1. **Drag-drop icons**: ComponentLibrary items have React icons that can't be serialized. Only pass `{ id, name }` to drag handlers.

2. **Animation defaults**: VisualCanvas animation objects need full defaults or TypeScript complains.

3. **API status codes**: POST returns 201, DELETE returns 204. Tests must expect these.

4. **CORS**: Backend allows `http://localhost:3000`. Change in `backend/app/core/config.py` for production.

5. **Preview data format**: Can be legacy (array) or new format (object with pages). Preview page handles both.

---

## Roadmap

### Phase 1-4 (Complete)
- Visual canvas with drag-drop
- 100+ component library
- Multi-page projects
- AI component generation
- Team collaboration
- Marketplace
- Export to Next.js/Vite

### Phase 5-7 (In Progress)
- Data model designer UI
- Dynamic components (DataList, DataForm)
- Connection to Runtime API
- Database schema management
- Real-time data preview

### Future
- Custom component creation
- Plugin system
- Self-hosted deployment
- Mobile app builder
- A/B testing
- Analytics integration

---

## Contributing

This is a private project. For internal team members, see `CLAUDE.md` for development guidelines and session continuity.

---

## License

- **Runtime**: MIT License (Open Source)
- **Builder & CMS**: Proprietary (All Rights Reserved)

---

## Links

- **GitHub Organization**: [github.com/formabase](https://github.com/formabase)
- **Documentation**: See `FORMABASE_ROADMAP.md` for technical details
- **Project Page**: [axiondeep.com/projects/forma](https://www.axiondeep.com/projects/forma)
