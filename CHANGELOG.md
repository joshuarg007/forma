# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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
