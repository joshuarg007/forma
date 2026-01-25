<p align="center">
  <img src="images/forma-logo.png" alt="Forma Builder" width="150"/>
</p>

<h1 align="center">Forma Builder</h1>

<p align="center">
  <strong>Visual React Application Builder</strong><br>
  Build complete React applications with drag-and-drop, AI generation, and instant deployment.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18-blue" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/FastAPI-0.109+-teal" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License"/>
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#api-reference">API Reference</a> &bull;
  <a href="#component-library">Components</a>
</p>

---

## What is Forma Builder?

Forma Builder is a **full-stack visual development platform** that lets you:

1. **Design** - Drag-and-drop React components onto a visual canvas
2. **Model** - Create database schemas with a visual data modeler
3. **Connect** - Bind components to data with automatic API integration
4. **Deploy** - Export to Next.js/Vite or deploy to Forma Runtime
5. **Collaborate** - Real-time team editing with role-based access

Think **Webflow + Retool + Supabase** in one integrated platform.

---

## Features

### Visual Canvas

| Feature | Description |
|---------|-------------|
| **Drag-Drop Building** | Place 100+ components with visual guides and snapping |
| **Multi-Page Projects** | Create, rename, duplicate, reorder pages |
| **Device Preview** | Toggle desktop, tablet, mobile viewports |
| **Component Toolbar** | Move, align, duplicate, delete, lock, hide |
| **Undo/Redo** | Full history management with keyboard shortcuts |
| **Zoom Controls** | Canvas zoom in/out for precision work |

### Styling & Design

| Feature | Description |
|---------|-------------|
| **Properties Panel** | Typography, colors, spacing, borders, shadows |
| **Responsive Styles** | Different styles per breakpoint |
| **Animations** | Entrance, hover, scroll, loop animations |
| **3D Transforms** | RotateX/Y/Z, translate, scale, perspective |
| **Theme System** | Design tokens, color palettes, font management |
| **Style Presets** | Pre-built style combinations |

### Data Modeling

| Feature | Description |
|---------|-------------|
| **Visual Schema Designer** | Create collections, fields, relations graphically |
| **Field Types** | 15+ types including relations, files, enums |
| **One-Click Deploy** | Deploy backend to Forma Runtime instantly |
| **Data Binding** | Connect components to API endpoints |
| **Live Preview** | See real data in preview mode |

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

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the monorepo
git clone https://github.com/axiondeeplabs/forma.git
cd forma/forma

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

# Open http://localhost:3000
```

### Running with Runtime (Full Stack)

```bash
# Terminal 1 - Forma Runtime (port 8001)
cd ../formabase/runtime
source venv/bin/activate
MULTI_TENANT=true uvicorn forma_runtime.main:app --reload --port 8001

# Terminal 2 - Builder Backend (port 8000)
cd forma/backend
source venv/bin/activate
RUNTIME_URL=http://localhost:8001 uvicorn app.main:app --reload --port 8000

# Terminal 3 - Builder Frontend (port 3000)
cd forma/frontend
npm run dev
```

---

## Architecture

```
forma/
├── frontend/                    # Next.js 14 Application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── auth/            # Login/Register
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── builder/[id]/    # Visual builder
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
│   │   │   ├── modeler/               # Data modeling UI
│   │   │   │   ├── DataModeler.tsx    # Schema designer
│   │   │   │   └── CollectionPanel.tsx
│   │   │   └── ...
│   │   ├── stores/              # Zustand state
│   │   │   ├── projectStore.ts  # Projects, pages, components
│   │   │   ├── authStore.ts     # Authentication
│   │   │   ├── schemaStore.ts   # Data model schema
│   │   │   └── themeStore.ts    # Theme tokens
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   └── types/
│   │       ├── index.ts         # Core interfaces
│   │       └── components.ts    # Component types
│   └── package.json
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── api/                 # Route handlers
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── projects.py      # Project CRUD
│   │   │   ├── pages.py         # Page management
│   │   │   ├── components.py    # Component CRUD
│   │   │   ├── ai.py            # Claude AI integration
│   │   │   ├── teams.py         # Team collaboration
│   │   │   ├── marketplace.py   # Component marketplace
│   │   │   └── github.py        # GitHub sync
│   │   ├── services/
│   │   │   ├── forma_ai.py      # Claude API wrapper
│   │   │   ├── export.py        # Next.js/Vite export
│   │   │   ├── github_sync.py   # GitHub integration
│   │   │   └── runtime_client.py # Runtime API client
│   │   ├── db/
│   │   │   └── models.py        # SQLAlchemy models
│   │   └── main.py              # FastAPI application
│   └── requirements.txt
│
└── docs/                        # Documentation
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | App Router, SSR, API routes |
| **React 18** | Component framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility styling |
| **Zustand** | State management |
| **Framer Motion** | Animations |
| **Monaco Editor** | Code editing |
| **Radix UI** | Accessible primitives |
| **Lucide React** | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI** | REST API framework |
| **SQLAlchemy 2.0** | ORM |
| **Alembic** | Migrations |
| **Anthropic Claude** | AI generation |
| **Stripe** | Payments |
| **Celery** | Background tasks |
| **WebSockets** | Real-time collaboration |
| **SendGrid** | Email |
| **JWT + bcrypt** | Authentication |

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
| `/api/projects` | POST | Create project |
| `/api/projects/{id}` | GET | Get project details |
| `/api/projects/{id}` | PUT | Update project |
| `/api/projects/{id}` | DELETE | Delete project |
| `/api/projects/{id}/schema` | PUT | Save data model schema |
| `/api/projects/{id}/deploy-backend` | POST | Deploy to Runtime |

### Pages

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/{id}/pages` | GET | List pages |
| `/api/projects/{id}/pages` | POST | Create page |
| `/api/projects/{id}/pages/{page_id}` | PUT | Update page |
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

### Export

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/{id}/export/nextjs` | GET | Export as Next.js zip |
| `/api/projects/{id}/export/vite` | GET | Export as Vite zip |

---

## Component Library

100+ pre-built components organized by category:

### Layout
- Container, Grid, Flex, Spacer, Divider

### Navigation
- Navbar, Sidebar, Footer, Breadcrumb, Tabs

### Content
- Hero, Features, Pricing, Testimonials, FAQ, CTA, Stats

### Data Display
- Card, Table, List, Gallery, Avatar, Badge

### Forms
- Input, Textarea, Select, Checkbox, Radio, Switch, DatePicker

### Feedback
- Alert, Toast, Modal, Drawer, Popover, Tooltip

### Data-Bound
- DataTable, DataList, DataForm, DataGrid

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

# Runtime Connection
RUNTIME_URL=http://localhost:8001
RUNTIME_INTERNAL_KEY=shared-secret-key

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
├── schema_json         # DataModeler schema
├── runtime_api_url     # Deployed backend URL
├── design_system (JSON)
└── settings (JSON)

Page
├── id, project_id, name, slug
├── canvas_components (JSON array)
├── is_homepage, position
└── meta_title, meta_description

Component (AI-generated)
├── id, project_id, name
├── code (React component)
└── intent (generation prompt)

ProjectMember
├── id, project_id, user_id
└── role (owner/admin/editor/viewer)
```

---

## Design Decisions

1. **Canvas State as JSON**: Stored in `Page.canvas_components`, not separate records. Simplifies undo/redo and duplication.

2. **Component Library Inline**: Pre-built components defined in `ComponentLibrary.tsx`. Preview renderers in `preview/[id]/page.tsx`.

3. **JWT Authentication**: Access (30min) + refresh (7 days) tokens. Stored in localStorage via Zustand persist.

4. **AI Components**: Generated code stored in `Component.code`. Intent history tracked in `Intention` table.

5. **Preview via localStorage**: Canvas state passed from builder to preview tab using `forma-preview-{projectId}` key.

6. **Runtime Integration**: Builder saves schema to project, then calls `/deploy-backend` which registers with Runtime.

---

## Gotchas

1. **Drag-drop icons**: ComponentLibrary items have React icons that can't be serialized. Only pass `{ id, name }` to drag handlers.

2. **Animation defaults**: VisualCanvas animation objects need full defaults or TypeScript complains.

3. **API status codes**: POST returns 201, DELETE returns 204.

4. **CORS**: Backend allows `http://localhost:3000`. Change in config for production.

5. **Preview data format**: Can be legacy (array) or new format (object with pages). Preview page handles both.

---

## License

Proprietary - All Rights Reserved

The Forma Builder is proprietary software. For licensing inquiries, contact Axion Deep Labs.

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
  <sub>Forma Builder is part of the Forma platform by Axion Deep Labs.</sub>
</p>
