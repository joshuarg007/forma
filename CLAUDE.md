# Forma - Visual Page Builder

## Project Overview
Forma is a visual page builder similar to Elementor/Webflow. Users can drag-and-drop components to build web pages without coding.

## Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: FastAPI (Python), SQLite, Anthropic Claude API for AI generation
- **Port**: Frontend on 3000, Backend on 8000

## Key Files

### Frontend (`/frontend`)
- `src/app/builder/[id]/page.tsx` - Main builder page with visual canvas
- `src/components/VisualCanvas.tsx` - The drag-drop canvas where components are arranged
- `src/components/ComponentLibrary.tsx` - Left sidebar with 100+ draggable components
- `src/app/preview/[id]/page.tsx` - Full-page preview (opens in new tab)
- `src/stores/projectStore.ts` - Zustand store for project/component state
- `src/stores/authStore.ts` - Auth state management
- `src/lib/api.ts` - API client for backend

### Backend (`/backend`)
- `app/main.py` - FastAPI entry point
- `app/services/forma_ai.py` - AI component generation using Claude
- `app/api/` - API routes (auth, projects, components, ai, etc.)
- `.env` - Contains ANTHROPIC_API_KEY (already configured)

## Current Features
1. **Visual Canvas** - Drag components from library, drop on canvas
2. **Component Library** - 100+ pre-built components (heroes, navbars, features, pricing, testimonials, FAQ, CTA, footer, cards, forms, etc.)
3. **Click or Drag to Add** - Both work (drag had a JSON.stringify circular reference bug that was fixed)
4. **Component Toolbar** - Hover/select shows: move up/down, alignment (left/center/right), duplicate, delete
5. **Alignment/Position** - Components can be full-width or 75% width aligned left/right (sidebar style)
6. **Preview in New Tab** - Green "Preview Site" button opens full-page preview
7. **Device Preview** - Desktop/tablet/mobile viewport toggles
8. **Undo/Redo** - History management for canvas changes
9. **AI Assistant** - Right panel has AI prompt input for generating components
10. **Properties Panel** - Right sidebar shows selected component properties, position controls

## Known Issues Fixed
- Drag-and-drop wasn't working: The `item` object contained React icon components which can't be JSON.stringify'd. Fixed by only passing `{ id, name }`.
- Globe icon not defined: Was used but not imported in LivePreview.tsx.
- API key was placeholder: Updated backend `.env` with real Anthropic key.

## Running the Project
```bash
# Backend
cd ~/forma/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd ~/forma/frontend
npm run dev
```

## Git Status
- Repo initialized locally at `~/forma`
- Initial commit made with 67 files
- Branch: main
- Not yet pushed to GitHub (gh CLI not installed)

## Component Interface
```typescript
interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  children?: CanvasComponent[]
  alignment?: 'left' | 'center' | 'right'
}
```

## What User Wants Next (Potential)
- Push to GitHub (needs gh CLI or manual remote setup)
- More component customization
- Export functionality improvements
- AI-powered component editing
