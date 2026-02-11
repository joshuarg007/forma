# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added - Real-time Collaboration
- **Live Cursors** - See other users' cursors on the canvas in real-time
- **Selection Highlighting** - Visual indicators when others select components
- **Page Presence** - See who's viewing which page
- **Team Chat** - In-app messaging with collaborators
- **Color-coded Users** - Each user gets a consistent color for identification
- **Typing Indicators** - See when others are editing
- **WebSocket Infrastructure** - Robust connection handling with auto-reconnect

### Added - Figma Integration
- **Figma Connect** - Link your Figma account to projects
- **Design Import** - Import frames and components from Figma files
- **Auto-conversion** - Figma nodes converted to React components
- **Design Tokens** - Extract colors, typography, and spacing from Figma
- **Asset Export** - Automatically export vectors and images
- **Background Processing** - Large file imports run asynchronously
- **Import History** - Track all imports with status and results

### Added - Enterprise SSO
- **SAML 2.0** - Support for enterprise SAML identity providers
- **OIDC** - OpenID Connect integration
- **Okta** - Pre-configured Okta integration
- **Azure AD** - Microsoft Azure Active Directory support
- **Google Workspace** - Google SSO for organizations
- **Domain Verification** - Restrict SSO to verified email domains
- **Auto-provisioning** - Automatic user creation on first login
- **Team Membership** - Auto-join team on SSO login

---

## [0.4.0] - 2026-01-25

### Added - Platform Features (12 New Systems)

**Collaboration & Teams**
- **Version History** - Page and component version tracking with restore and diff capabilities
- **Comments System** - Threaded comments with @mentions, reactions (👍❤️🎉😄🤔👎), and resolution workflow
- **Activity Log** - Full audit trail of all project changes with user, action, and timestamp
- **Notifications System** - In-app notifications with preferences (email, in-app, push toggles)

**Content Management**
- **Scheduled Publishing** - Queue pages/components for future publish with status tracking
- **Localization/i18n** - Multi-language content management with translation import/export
- **Design System** - Design tokens, themes, and component styles with CSS variable generation
- **Code Snippets Library** - Reusable code snippets with folders, sharing, and multiple languages

**Developer Experience**
- **Import/Export** - Full project export (ZIP/JSON) and import with template creation
- **Integrations Hub** - Connect Slack, Discord, webhooks, and Zapier for notifications
- **Backup/Restore** - Manual and scheduled backups with restore functionality
- **Performance Monitoring** - Core Web Vitals tracking, budgets, alerts, and RUM endpoint

### Added - DNS & Hosting
- Real DNS verification with dnspython (CNAME, A, TXT records)
- DNS propagation checking across 4 public servers (Google, Cloudflare, Quad9, OpenDNS)
- Enhanced domains management UI with step-by-step instructions
- Copy-to-clipboard for DNS records with visual feedback
- DomainsManager and HostingSettings components

---

## [0.3.0] - 2026-01-25

### Added - Managed Hosting Infrastructure
- **One-Click Publish** - Deploy button publishes to forma.app subdomain instantly
- **PublishModal** - Combined frontend + backend deployment flow
- **Subdomain selection** - Auto-generate or customize your subdomain
- **Cloudflare Pages integration** - DNS management via Cloudflare API
- **SSL auto-provisioning** - HTTPS for all sites automatically
- **Deployment history** - Track all deployments with rollback capability
- **Custom domains backend** - Add and verify custom domains (DNS verification)
- **Production Docker Compose** - Multi-tenant Runtime deployment config

### Added - Builder UI Polish
- Template gallery with search and categories
- Welcome tour for new users
- Tooltips throughout the interface
- Toast notifications for actions
- In-app data editor for collections

---

## [0.2.0] - 2026-01-20

### Added - Builder ↔ Runtime Bridge
- **Schema sync** - Save DataModeler schema to project
- **Deploy Backend** - One-click deployment to shared Runtime
- **Multi-tenant Runtime** - Table prefixing (p_{id}_{collection})
- **Project-scoped routes** - /api/p/{project_id}/{collection}
- **Internal register endpoint** - POST /internal/register
- **Runtime client service** - HTTP client for Runtime communication

### Added - Runtime Features
- GraphQL API generation
- Zoom OAuth integration
- AI-powered schema validation with Ollama
- File storage (local + S3)
- Admin UI improvements

---

## [0.1.0] - 2026-01-15

### Added - Initial Release
- **Visual Builder** - Drag-and-drop React component design
- **100+ Components** - Heroes, navbars, features, pricing, etc.
- **Data Modeler** - Visual schema designer
- **AI Generation** - Natural language to React components
- **Export** - Next.js and Vite project downloads
- **Runtime Engine** - Schema-driven REST + GraphQL + Auth
- **OAuth** - Google, GitHub integration
- **Team Collaboration** - Invite members, roles
- **Marketplace** - Browse and purchase components

---

## Roadmap

See [CLAUDE.md](./CLAUDE.md) for the full product roadmap.
