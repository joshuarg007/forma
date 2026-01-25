# SaaS Example

A complete SaaS backend with multi-tenancy, team management, and subscription handling.

## Features

- Multi-tenant organizations
- Team invitations and role-based access
- Project management within organizations
- API key management
- Audit logging
- Subscription tiers (free, starter, pro, enterprise)

## Quick Start

```bash
# Start the development server
forma-runtime dev -s schema.json

# Or start in production mode
forma-runtime serve -s schema.json --port 8000
```

## Data Model

```
User (auth)
  └── OrganizationMember
        └── Organization
              ├── Project
              ├── ApiKey
              ├── AuditLog
              └── Invitation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Organizations
- `GET /api/organization` - List user's organizations
- `POST /api/organization` - Create organization
- `GET /api/organization/{id}` - Get organization
- `PUT /api/organization/{id}` - Update organization

### Team Management
- `GET /api/organization_member?organization={id}` - List members
- `POST /api/invitation` - Send invitation
- `POST /api/invitation/{token}/accept` - Accept invitation

### Projects
- `GET /api/project?organization={id}` - List projects
- `POST /api/project` - Create project
- `PUT /api/project/{id}` - Update project

### API Keys
- `GET /api/api_key?organization={id}` - List API keys
- `POST /api/api_key` - Create API key
- `DELETE /api/api_key/{id}` - Revoke API key

## Example Usage

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "founder@startup.com", "password": "secret123", "name": "Jane Founder"}'

# Create an organization
curl -X POST http://localhost:8000/api/organization \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Acme Inc", "plan": "starter"}'

# Invite a team member
curl -X POST http://localhost:8000/api/invitation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "developer@example.com",
    "organization": 1,
    "role": "member"
  }'
```

## Subscription Tiers

| Plan | Features |
|------|----------|
| free | 1 project, 3 members |
| starter | 10 projects, 10 members |
| pro | Unlimited projects, 50 members |
| enterprise | Unlimited everything, SSO |
