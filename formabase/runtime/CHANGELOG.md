# Changelog

All notable changes to Forma Runtime will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Managed Hosting Infrastructure**
  - One-click Publish modal with subdomain selection
  - Automatic subdomain availability checking
  - Combined frontend + backend deployment flow
  - Cloudflare Pages integration for static hosting
  - Production Docker Compose for multi-tenant Runtime
  - Custom domain support with DNS verification
  - Deployment history and rollback capability
- **Builder UI Polish** (forma/frontend)
  - Template selector with Blog, SaaS, E-Commerce schemas
  - Tooltips and field type descriptions for non-developers
  - Toast notification system for user feedback
  - Welcome tour for first-time users (5-step onboarding)
  - In-app data editor (CRUD without leaving the Builder)
  - Backend templates gallery in dashboard
  - Deployment options modal (Render, Railway, Docker configs)
- Multi-tenant mode with project isolation via table prefixing
- AI-powered schema validation with Ollama integration
- GraphQL API generation from schema definitions
- OAuth support (Google, GitHub, custom providers)
- File upload with local and S3 storage backends
- Hook system for customizing CRUD operations
- CLI with project scaffolding templates (blank, blog, saas, ecommerce)
- Soft delete support for collections
- Comprehensive test suite (126 tests)
- GitHub Actions CI/CD workflows
- Docker multi-stage build with multi-platform support

### Security
- JWT authentication with access/refresh tokens
- Password hashing with bcrypt
- Schema validation to detect security issues (dangerous fields, etc.)
- Role-based access control per collection

## [0.1.0] - 2024-01-24

### Added
- Initial release
- Schema-driven REST API generation
- SQLAlchemy model generation from schema
- Basic CRUD operations with pagination and filtering
- Timestamp and soft delete support
- Relation handling (many-to-one, many-to-many)
- Enum field support
- Development server with hot reload
- CLI commands: serve, dev, migrate, check, info, init, version

[Unreleased]: https://github.com/axiondeeplabs/forma/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/axiondeeplabs/forma/releases/tag/v0.1.0
