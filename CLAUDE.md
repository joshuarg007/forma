# Formabase - Full-Stack React App Builder

> **FOR CLAUDE: This project has PIVOTED. Read `FORMABASE_ROADMAP.md` FIRST - it contains the complete architecture, build order, and implementation details.**

---

## PROJECT PIVOT (December 2024)

**OLD**: Forma was a visual page builder (like Elementor)
**NEW**: Formabase is a full-stack React app builder (like Bubble/Retool but for React)

### Key Decisions Made:
1. **Three products**: Runtime (open source), Builder (SaaS), CMS (SaaS)
2. **Runtime language**: Python/FastAPI (standalone service)
3. **Open source strategy**: Runtime is MIT licensed, Builder is proprietary
4. **GitHub org**: `formabase`
5. **Both REST and GraphQL APIs**

### Read These Files:
1. **`FORMABASE_ROADMAP.md`** - Complete technical roadmap, architecture, schema spec, implementation checklist
2. **This file** - Quick reference for existing Builder code

---

## SESSION STATE (Update before ending each session)
**Last Updated:** 2026-01-22

### Where We Left Off:
- **COMPLETED**: Phase B, C, D (Templates, Infrastructure, Theme System)
- **COMPLETED**: Component AI System (TensorFlow.js + Collaborative Filtering)
- **COMPLETED**: Nested component support (drop into grid columns/sections)
- **COMPLETED**: Smart + buttons with AI-powered suggestions
- **TOTAL**: 57 components (54 modules + 3 templates) + 11 theme presets
- Full theme system with contrast checker and breakpoints

### Current Running Services:
| Service | Port | Location |
|---------|------|----------|
| Forma Frontend | 3000 | ~/forma/frontend |
| Forma Backend | 8000 | ~/forma/backend |
| **Formabase Runtime** | 8001 | ~/formabase/runtime |

### Module Tiers Completed:
| Tier | Modules | Status |
|------|---------|--------|
| Tier 1 | 17 | COMPLETE |
| Tier 2 | 19 | COMPLETE |
| Tier 3 | 18 | COMPLETE |
| Templates | 3 | COMPLETE |
| **Total** | **57** | **COMPLETE** |

### Theme System (Phase D):
| Theme | Style |
|-------|-------|
| Light | Clean, modern (default) |
| Dark | Sleek dark mode |
| Minimal | Maximum whitespace |
| Corporate | Professional blue |
| Creative | Bold fuchsia/orange |
| Bold | High contrast red |
| Elegant | Refined gold |
| Ocean | Cool cyan/teal |
| Forest | Natural green |
| Sunset | Warm orange/pink |
| Neon | Cyberpunk green/pink |

### Phase Status:
| Phase | Description | Status |
|-------|-------------|--------|
| Phase B | Page Templates | ✅ COMPLETE |
| Phase C | Builder Infrastructure | ✅ COMPLETE |
| Phase D | Theme System | ✅ COMPLETE |
| Phase A | Tier 4 Specialized Modules | NEXT |

### Next Steps:
1. **Phase A**: Tier 4 Specialized Modules - Blog, Portfolio, Dashboard
2. Google Fonts integration
3. Backend OAuth integration (Google, GitHub)

### Current Blockers:
- None

---

## What Exists Now (Original Forma Builder)

The existing codebase is a working visual page builder. It will become the `formabase/forma` repo (Builder + CMS).

**Current capabilities:**
- Visual drag-drop canvas with 100+ components
- **Nested components** - Drop items into grid columns, sections, flexbox
- **Smart + buttons** - AI-powered contextual suggestions in empty slots
- **Component AI** - TensorFlow.js model that learns from your choices
- Multi-page projects
- AI component generation (Claude API)
- Team collaboration
- Marketplace
- Export to Next.js/Vite

**What needs to be added:**
- Data model designer UI
- Dynamic components (DataList, DataForm, etc.)
- Connection to Runtime API
- See `FORMABASE_ROADMAP.md` Phase 5-7

---

## Original Project Overview
Forma is a visual page builder similar to Elementor/Webflow. Users can drag-and-drop components to build multi-page React websites without coding. Features AI-powered component generation, team collaboration, and a component marketplace.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: FastAPI (Python 3.12), SQLite (SQLAlchemy ORM), Anthropic Claude API
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Ports**: Frontend on 3000, Backend on 8000

---

## Project Structure

### Frontend (`/frontend`)

#### Pages (App Router)
| File | Description |
|------|-------------|
| `src/app/page.tsx` | Landing page with hero, features, pricing |
| `src/app/auth/page.tsx` | Login/Register with mode switching |
| `src/app/dashboard/page.tsx` | User's projects list |
| `src/app/builder/[id]/page.tsx` | **Main builder** - visual canvas, component library, AI assistant |
| `src/app/preview/[id]/page.tsx` | Full-page site preview (opens in new tab) |
| `src/app/marketplace/page.tsx` | Browse published components |
| `src/app/marketplace/[id]/page.tsx` | Component detail page |
| `src/app/settings/page.tsx` | User account settings |

#### Components
| File | Description | Status |
|------|-------------|--------|
| `VisualCanvas.tsx` | Drag-drop canvas, component rendering, animations | Working |
| `ComponentLibrary.tsx` | Left sidebar with 100+ draggable components | Working |
| `PagesSidebar.tsx` | Multi-page management (create, rename, delete, duplicate) | Working |
| `PropertiesPanel.tsx` | Full component styling (typography, colors, spacing, animations) | Working |
| `ThemePanel.tsx` | Design tokens, color palettes, font management | Working |
| `FigmaImportModal.tsx` | Import designs from Figma JSON | Working |
| `PerformanceScore.tsx` | Page performance metrics display | Working |
| `TutorialModal.tsx` | Interactive onboarding walkthrough | Working |
| `DataBindingPanel.tsx` | Connect components to API data sources | Working |
| `CodeInjectionPanel.tsx` | Custom CSS/JS injection per component | Working |
| `Transform3DPanel.tsx` | 3D transforms, perspective, rotation | Working |
| `LivePreview.tsx` | In-builder preview iframe | Working |
| `TeamPanel.tsx` | Team collaboration UI | Working |
| `TemplatePicker.tsx` | Pre-built page templates | Working |
| `CollaboratorPresence.tsx` | Real-time collaboration cursors | Working |
| `AdminLayout.tsx` | Admin dashboard layout | Working |
| `Tooltip.tsx` | Reusable tooltip component | Working |

#### Stores (Zustand)
| File | Description |
|------|-------------|
| `projectStore.ts` | Projects, pages, components, AI state management |
| `authStore.ts` | User authentication state |
| `themeStore.ts` | Theme/design token state |

#### Types
| File | Description |
|------|-------------|
| `types/index.ts` | Core TypeScript interfaces (Project, User, Component, Page, etc.) |
| `types/components.ts` | Enhanced component types with styling, animations, responsive |

#### API Client
| File | Description |
|------|-------------|
| `lib/api.ts` | Full API client with auth, projects, pages, components, AI, etc. |

#### Component AI (`lib/componentAI/`)
TensorFlow.js-based recommendation system that suggests components based on context.

| File | Description |
|------|-------------|
| `types.ts` | 60+ component types, interfaces, lookup maps |
| `registry.ts` | Component metadata, UI patterns, page flow patterns, sibling patterns |
| `model.ts` | Two-tower neural network architecture (TF.js) |
| `training.ts` | Synthetic training data generation from UI patterns |
| `inference.ts` | Predictions, personalization, user learning |
| `index.ts` | Main exports |

**Architecture:**
- Input: Context (parent type, existing children, siblings, page components)
- Model: 4 embedding layers → concat → hidden(32) → dropout → softmax
- Output: Probability distribution over ~60 component types
- Size: ~200KB, runs entirely in browser

**How it works:**
1. Pre-trains on synthetic data from UI patterns on first load
2. When user clicks + button, model predicts best components (~10ms)
3. Blends: 60% neural network + 25% rule-based + 15% user history
4. Records every selection for personalization
5. Fine-tunes model on each interaction
6. Saves model and history to localStorage

**No external dependencies** - works offline, no API calls.

---

### Backend (`/backend`)

#### API Routes (`app/api/`)
| File | Endpoints | Description |
|------|-----------|-------------|
| `auth.py` | `/api/auth/*` | Register, login, refresh, logout, me |
| `projects.py` | `/api/projects/*` | CRUD projects, auto-creates home page |
| `pages.py` | `/api/projects/{id}/pages/*` | CRUD pages, duplicate, reorder, by-slug |
| `components.py` | `/api/projects/{id}/components/*` | CRUD AI-generated components |
| `ai.py` | `/api/ai/*` | Generate, edit, explain components via Claude |
| `teams.py` | `/api/projects/{id}/team/*` | Invite members, manage roles, accept invites |
| `marketplace.py` | `/api/marketplace/*` | Browse, publish, purchase components |
| `templates.py` | `/api/templates/*` | Pre-built page/component templates |
| `github.py` | `/api/github/*` | OAuth, repo sync, push/pull components |
| `uploads.py` | `/api/uploads/*` | Image/file uploads to local storage |
| `billing.py` | `/api/billing/*` | Stripe subscriptions, usage tracking |
| `websocket.py` | `/api/ws/*` | Real-time collaboration WebSocket |

#### Database Models (`app/db/models.py`)
| Model | Description |
|-------|-------------|
| `User` | Auth, profile, plan, Stripe, GitHub integration |
| `Project` | User's projects with design system settings |
| `Page` | Multi-page support with canvas_components JSON |
| `Component` | AI-generated React components with code |
| `Intention` | Version history by natural language intent |
| `AIUsage` | Track tokens/cost for billing |
| `Subscription` | Stripe subscription tracking |
| `MarketplaceListing` | Published components for sale/free |
| `Purchase` | Marketplace purchase records |
| `Payout` | Creator payout tracking |
| `ProjectMember` | Team member associations with roles |
| `ProjectInvite` | Pending team invitations |
| `GitHubSync` | GitHub repo sync configuration |

#### Services (`app/services/`)
| File | Description |
|------|-------------|
| `forma_ai.py` | Claude API integration for component generation |
| `export.py` | Export projects to Next.js/Vite zip files |
| `github_sync.py` | GitHub API integration for repo sync |
| `email.py` | Email sending (invites, notifications) |
| `uploads.py` | File upload handling |
| `billing.py` | Stripe integration |
| `websocket.py` | WebSocket connection management |

#### Background Tasks (`app/worker/`)
| File | Description |
|------|-------------|
| `celery_app.py` | Celery configuration |
| `tasks.py` | Async tasks (email, GitHub sync, exports) |

---

## Current Features (All Working)

### Builder
1. **Visual Canvas** - Drag components from library, drop on canvas
2. **Component Library** - 100+ pre-built components organized by category
3. **Click or Drag to Add** - Both methods work
4. **Component Toolbar** - Move up/down, alignment, duplicate, delete, lock, hide
5. **Alignment/Position** - Full-width or aligned left/center/right
6. **Multi-Page Projects** - Create, rename, duplicate, delete, reorder pages
7. **Preview in New Tab** - Full site preview with page navigation
8. **Device Preview** - Desktop/tablet/mobile viewport toggles
9. **Undo/Redo** - Full history management
10. **Zoom Controls** - Canvas zoom in/out

### Styling & Design
11. **Properties Panel** - Typography, colors, spacing, borders, shadows
12. **Responsive Styles** - Different styles per breakpoint
13. **Animations** - Entrance, hover, scroll, loop animations
14. **3D Transforms** - RotateX/Y/Z, translate, scale, perspective
15. **Theme System** - Design tokens, color palettes
16. **Style Presets** - Pre-built style combinations

### AI Features
17. **AI Component Generation** - Describe in natural language, get React code
18. **AI Component Editing** - Modify existing components via prompts
19. **Intent History** - Version control by natural language

### Collaboration
20. **Team Invites** - Invite by email with role selection
21. **Role Permissions** - Owner, Admin, Editor, Viewer
22. **Real-time Presence** - See collaborators' cursors (WebSocket)

### Import/Export
23. **Figma Import** - Parse Figma JSON, convert to components
24. **Export to Next.js** - Full Next.js project zip
25. **Export to Vite** - Standalone Vite + React zip
26. **GitHub Sync** - Push/pull components to repo

### Marketplace
27. **Browse Components** - Search, filter by category
28. **Publish Components** - Free or paid listings
29. **Purchase Flow** - Stripe integration for paid components
30. **Creator Payouts** - Stripe Connect for creators

### Other
31. **Data Binding** - Connect components to API endpoints
32. **Code Injection** - Custom CSS/JS per component
33. **SEO Metadata** - Per-page meta title, description, OG image
34. **Performance Score** - Page metrics display
35. **Tutorial System** - Interactive onboarding

---

## Component Interface

```typescript
interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>

  // Styling
  styles?: ComponentStyles
  responsiveStyles?: ResponsiveStyles
  animation?: AnimationConfig

  // Nesting
  children?: CanvasComponent[]
  parentId?: string

  // Layout
  alignment?: 'left' | 'center' | 'right'
  layoutRole?: 'header' | 'sidebar' | 'main' | 'footer'

  // Content
  content?: Record<string, string | number | boolean>

  // State
  locked?: boolean
  hidden?: boolean
  collapsed?: boolean

  // AI
  code?: string

  // Data Binding
  dataBinding?: {
    source?: string
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    mapping?: Record<string, string>
    refreshInterval?: number
    cache?: boolean
  }

  // Custom Code
  customCode?: {
    css?: string
    cssScope?: 'component' | 'global'
    js?: string
    jsEvent?: 'mount' | 'click' | 'hover' | 'scroll'
    htmlBefore?: string
    htmlAfter?: string
  }

  // Interactions
  interactions?: {
    onClick?: { action: string; target?: string; value?: string }
    onHover?: { action: string; target?: string }
  }
}
```

---

## Running the Project

```bash
# Backend
cd ~/forma/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd ~/forma/frontend
npm run dev

# Run tests
cd ~/forma/backend && source venv/bin/activate && pytest
cd ~/forma/frontend && npm run build  # Type checking
```

---

## Environment Variables

### Backend (`/backend/.env`)
```
DATABASE_URL=sqlite:///./forma.db
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Test Status
- Backend: **35/35 tests passing**
- Frontend: **Build succeeds** (TypeScript validation)

---

## Known Issues Fixed
1. Drag-and-drop circular reference: Fixed by passing only `{ id, name }` instead of full component with React icons
2. TypeScript errors in FigmaImportModal.tsx: Added explicit type annotations
3. TypeScript errors in VisualCanvas.tsx: Fixed animation defaults with proper typing
4. Test assertions: Updated to expect proper REST status codes (201, 204)

---

## Git Status
- Repo: `~/forma`
- Branch: `main`
- Last commit: `462552c` - "Add missing features: GitHub OAuth, uploads, email, WebSocket, Celery, tests"
- Status: Many uncommitted changes from recent feature additions

---

## External References
- Linked from Axion Deep website at `/projects/forma`
- Project page: `www.axiondeep.com/projects/forma`

---

## Quick Reference (Read This First)

### Common Commands
```bash
# Start servers (do this first)
cd ~/forma/backend && source venv/bin/activate && uvicorn app.main:app --port 8000 &
cd ~/forma/frontend && npm run dev &

# Run tests
cd ~/forma/backend && source venv/bin/activate && pytest
cd ~/forma/frontend && npm run build  # TypeScript check

# Check server health
curl http://localhost:8000/health
curl http://localhost:3000

# Database location
~/forma/backend/forma.db  # SQLite file

# Logs
# Backend logs appear in terminal where uvicorn runs
# Frontend logs appear in terminal where npm run dev runs
```

### Where To Edit For Common Tasks

| Task | File(s) |
|------|---------|
| Add new component to library | `frontend/src/components/ComponentLibrary.tsx` |
| Add component preview renderer | `frontend/src/app/preview/[id]/page.tsx` (componentRenderers object) |
| Add new API endpoint | `backend/app/api/` + register in `backend/app/main.py` |
| Add database model | `backend/app/db/models.py` + create schema in `backend/app/schemas/` |
| Modify canvas behavior | `frontend/src/components/VisualCanvas.tsx` |
| Change AI generation | `backend/app/services/forma_ai.py` |
| Add frontend page | `frontend/src/app/{route}/page.tsx` |
| Modify auth flow | `backend/app/api/auth.py` + `frontend/src/stores/authStore.ts` |
| Add export format | `backend/app/services/export.py` |

### Architecture Decisions

1. **Canvas State**: Stored as JSON array in `Page.canvas_components` column, not as separate component records. This simplifies undo/redo and page duplication.

2. **Component Library**: Pre-built components are defined inline in `ComponentLibrary.tsx` with React icons. Preview renderers are separate in `preview/[id]/page.tsx`.

3. **Auth**: JWT with access (30min) + refresh (7 days) tokens. Stored in localStorage via Zustand persist.

4. **AI Components**: Generated code stored in `Component.code` field. Intent history tracked in `Intention` table for version control.

5. **Multi-page**: Each Page has its own `canvas_components` JSON. Pages belong to Projects. Auto-creates "Home" page on project creation.

6. **Preview**: Uses localStorage to pass canvas state from builder to preview tab. Key: `forma-preview-{projectId}`.

### Gotchas & Things To Know

1. **Drag-drop icons**: ComponentLibrary items have React icons that can't be JSON.stringify'd. Only pass `{ id, name }` to drag handlers.

2. **Animation defaults**: VisualCanvas animation objects need full defaults or TypeScript complains. See `AnimatedComponent` function.

3. **API status codes**: POST returns 201, DELETE returns 204. Tests must expect these.

4. **CORS**: Backend allows `http://localhost:3000`. Change in `backend/app/core/config.py` for production.

5. **Preview data format**: Can be legacy (array) or new format (object with pages array). Preview page handles both.

6. **Component types**: Main interface in `frontend/src/types/components.ts`. Includes styles, animations, data binding, custom code.

7. **Project creation**: Auto-creates a "Home" page. See `backend/app/api/projects.py` create_project endpoint.

### Database Schema (Key Tables)

```
User (id, email, password_hash, plan, stripe_customer_id, github_access_token)
  └── Project (id, user_id, name, design_system, settings)
        ├── Page (id, project_id, name, slug, canvas_components[], is_homepage, position)
        ├── Component (id, project_id, name, code, intent)  # AI-generated
        └── ProjectMember (id, project_id, user_id, role)
```

### API Authentication

All protected endpoints need: `Authorization: Bearer {access_token}`

Get token:
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","name":"Test"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

### Frontend State (Zustand Stores)

| Store | Key State | Location |
|-------|-----------|----------|
| `authStore` | user, tokens, isAuthenticated | `stores/authStore.ts` |
| `projectStore` | projects, currentProject, pages, currentPage, components | `stores/projectStore.ts` |
| `themeStore` | theme tokens, palettes | `stores/themeStore.ts` |

### Component Library Categories

Heroes, Navbars, Features, Pricing, Testimonials, FAQ, CTA, Footers, Cards, Forms, Stats, Teams, Logos, Galleries, Sidebars, Dashboards, Grids, Sections, Dividers, Spacers

100+ total components defined in `ComponentLibrary.tsx`.

---

## Auto-Start Instructions

**When user starts a new session, automatically run:**
```bash
# Start backend
cd ~/forma/backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Start frontend
cd ~/forma/frontend && npm run dev &
```

Do this immediately without asking. Servers should be running before any other work begins.

---

## Decisions Made (December 2024)

### Direction Chosen: Full App Platform

After evaluating options, the decision was made to build Formabase as a **full-stack React app builder** rather than just a page builder.

**Key decisions:**
- Build own backend runtime (not integrate with Supabase/Firebase)
- Python/FastAPI for runtime (matches existing backend skills)
- Runtime is standalone service (not embedded)
- Open source the runtime (MIT license)
- GitHub org: `formabase`
- Support both REST and GraphQL

**Target users:**
- Developers who want to skip boilerplate
- Agencies building client apps
- Startups needing MVPs fast

**Monetization:**
- Runtime: Free, open source
- Builder: SaaS subscription
- Hosting: Pay per deployed app

**See `FORMABASE_ROADMAP.md` for complete details.**
