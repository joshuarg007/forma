# FORMA Architecture Documentation

## System Overview

FORMA is a white-label AI-powered React component builder. Users describe components in natural language, and the system generates production-ready React code.

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (Next.js 14)"]
        UI[Builder UI]
        Auth[Auth Pages]
        Dash[Dashboard]
    end

    subgraph Server["Backend (FastAPI)"]
        API[REST API]
        WS[WebSocket]
        Workers[Celery Workers]
    end

    subgraph AI["AI Layer"]
        Engine[FormaAI Engine]
        Parser[Code Parser]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        Redis[(Redis)]
        S3[(S3 Storage)]
    end

    subgraph External["External Services"]
        Claude[Anthropic API]
        Stripe[Stripe]
        Email[SendGrid]
    end

    UI --> API
    UI --> WS
    API --> Engine
    Engine --> Claude
    API --> PG
    API --> Redis
    Workers --> PG
    Workers --> S3
    API --> Stripe
    Workers --> Email
```

---

## Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        enum plan
        varchar stripe_customer_id
        jsonb ai_preferences
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        uuid user_id FK
        varchar name
        text description
        jsonb design_system
        jsonb settings
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    COMPONENTS {
        uuid id PK
        uuid project_id FK
        varchar name
        text intent
        text code
        jsonb props_schema
        uuid parent_id
        integer position
        timestamp created_at
    }

    INTENTIONS {
        uuid id PK
        uuid project_id FK
        uuid component_id FK
        text intent_text
        integer version
        jsonb snapshot
        timestamp created_at
    }

    AI_USAGE {
        uuid id PK
        uuid user_id FK
        varchar operation_type
        integer tokens_input
        integer tokens_output
        decimal cost_usd
        timestamp created_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        varchar stripe_subscription_id
        enum plan
        varchar status
        timestamp period_start
        timestamp period_end
    }

    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ AI_USAGE : tracks
    USERS ||--|| SUBSCRIPTIONS : has
    PROJECTS ||--o{ COMPONENTS : contains
    PROJECTS ||--o{ INTENTIONS : versions
    COMPONENTS ||--o{ INTENTIONS : history
    COMPONENTS ||--o{ COMPONENTS : children
```

---

## Component Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Builder UI
    participant API as FastAPI
    participant Usage as Usage Tracker
    participant AI as FormaAI
    participant Claude as Anthropic API
    participant DB as PostgreSQL

    U->>UI: Enter intent: "Create pricing card"
    UI->>API: POST /api/ai/generate
    API->>Usage: Check monthly limit
    Usage->>DB: Query usage stats
    DB-->>Usage: {used: 45, limit: 100}
    Usage-->>API: {allowed: true}

    API->>AI: generate_component(intent, context)
    AI->>AI: Build prompt with design system
    AI->>Claude: POST /messages
    Claude-->>AI: Generated code
    AI->>AI: Parse & validate code
    AI-->>API: ComponentResult

    API->>Usage: Record usage (tokens)
    Usage->>DB: INSERT ai_usage
    API->>DB: INSERT component
    API-->>UI: {component, code}
    UI-->>U: Show in canvas
```

---

## Billing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Settings
    participant API as FastAPI
    participant Billing as Billing Service
    participant Stripe as Stripe API
    participant DB as PostgreSQL

    U->>UI: Click "Upgrade to Pro"
    UI->>API: POST /billing/checkout
    API->>Billing: create_checkout_session()
    Billing->>Stripe: Create Session
    Stripe-->>Billing: checkout_url
    Billing-->>API: {url}
    API-->>UI: Redirect URL
    UI->>U: Redirect to Stripe

    U->>Stripe: Complete payment
    Stripe->>API: Webhook: checkout.completed
    API->>Billing: handle_webhook()
    Billing->>DB: UPDATE subscription
    Billing->>DB: UPDATE user.plan
    Stripe-->>U: Success page
```

---

## State Management

```mermaid
flowchart LR
    subgraph Stores["Zustand Stores"]
        PS[projectStore]
        US[uiStore]
        AS[aiStore]
        UserS[userStore]
    end

    subgraph Components
        Canvas[VisualCanvas]
        Tree[ComponentTree]
        Props[PropertiesPanel]
        Intent[IntentBar]
        Code[CodeEditor]
    end

    PS --> Canvas
    PS --> Tree
    PS --> Code
    US --> Canvas
    AS --> Intent
    UserS --> Props

    Intent -->|dispatch| AS
    Tree -->|select| PS
    Props -->|update| PS
    Code -->|update| PS
```

---

## Project State Machine

```mermaid
stateDiagram-v2
    [*] --> Created: Create project
    Created --> Designing: Add component
    Created --> [*]: Delete

    Designing --> Designing: Edit/Generate
    Designing --> Previewing: Open preview
    Previewing --> Designing: Close preview

    Designing --> Exporting: Export
    Exporting --> Exported: Complete
    Exported --> Designing: Continue

    Designing --> Published: Publish
    Published --> Designing: Unpublish
    Published --> Forked: User forks

    Designing --> [*]: Delete

    state Designing {
        [*] --> Idle
        Idle --> Processing: Submit intent
        Processing --> Reviewing: AI responds
        Reviewing --> Idle: Accept/Reject
    }
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get tokens |
| POST | `/api/auth/logout` | Invalidate tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| GET | `/api/projects/{id}/export/nextjs` | Export as Next.js |
| GET | `/api/projects/{id}/export/vite` | Export as Vite |

### Components
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{id}/components` | List components |
| POST | `/api/projects/{id}/components` | Create component |
| PUT | `/api/projects/{id}/components/{cid}` | Update component |
| DELETE | `/api/projects/{id}/components/{cid}` | Delete component |
| GET | `/api/projects/{id}/components/{cid}/intentions` | Get version history |
| POST | `/api/projects/{id}/components/{cid}/rollback` | Rollback to version |

### AI Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate component from intent |
| POST | `/api/ai/edit` | Edit component with intent |
| POST | `/api/ai/explain` | Explain code |
| POST | `/api/ai/refactor` | Suggest refactoring |
| POST | `/api/ai/debug` | Debug component |
| GET | `/api/ai/usage` | Get usage stats |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/subscription` | Get subscription info |
| POST | `/api/billing/checkout` | Create checkout session |
| POST | `/api/billing/portal` | Create customer portal |
| POST | `/api/billing/webhook` | Stripe webhooks |

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Vercel["Vercel Edge Network"]
        Next[Next.js Frontend]
        BFF[API Routes]
    end

    subgraph Railway["Railway"]
        FastAPI[FastAPI Backend]
        Celery[Celery Workers]
    end

    subgraph AWS["AWS"]
        RDS[(RDS PostgreSQL)]
        S3[(S3 Bucket)]
        CF[CloudFront CDN]
    end

    subgraph Redis["Redis Cloud"]
        Cache[(Redis)]
    end

    subgraph External["External"]
        Anthropic[Anthropic API]
        Stripe[Stripe]
    end

    Next --> BFF
    BFF --> FastAPI
    FastAPI --> RDS
    FastAPI --> Cache
    FastAPI --> S3
    FastAPI --> Anthropic
    FastAPI --> Stripe
    Celery --> Cache
    Celery --> RDS
    S3 --> CF
    CF --> Next
```

---

## Pricing Tiers

| Feature | Starter ($29/mo) | Pro ($79/mo) | Team ($199/mo) |
|---------|------------------|--------------|----------------|
| AI Operations | 100/mo | 500/mo | 2,000/mo |
| Projects | 3 | Unlimited | Unlimited |
| Export Code | ✓ | ✓ | ✓ |
| Custom Domain | - | ✓ | ✓ |
| Design System | Basic | Full | Full |
| Collaboration | - | - | ✓ |
| SSO/SAML | - | - | ✓ |
| API Access | - | - | ✓ |
| Priority Support | - | ✓ | ✓ |

**Overage Rate:** $0.05 per AI operation after limit

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 19, TailwindCSS |
| State | Zustand |
| UI Components | Radix UI, Framer Motion |
| Code Editor | Monaco Editor |
| Visual Builder | React Flow |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Task Queue | Celery |
| AI | Anthropic Claude API |
| Payments | Stripe |
| Storage | AWS S3 |
| CDN | CloudFront |
| Hosting | Vercel (Frontend), Railway (Backend) |
