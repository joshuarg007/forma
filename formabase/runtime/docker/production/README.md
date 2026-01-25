# Forma Runtime - Production Deployment

This directory contains production deployment configurations for the Forma Runtime shared hosting infrastructure.

## Overview

The managed hosting architecture runs a single multi-tenant Runtime instance that serves all user projects. Each project gets:

- Isolated database tables with project ID prefix (`p_{project_id}_{collection}`)
- Isolated API routes at `/api/p/{project_id}/`
- Isolated GraphQL endpoint at `/graphql/p/{project_id}`
- Shared authentication infrastructure

## Quick Start

### 1. Set up environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Generate secrets

```bash
# Generate INTERNAL_KEY
echo "INTERNAL_KEY=$(openssl rand -hex 32)" >> .env

# Generate JWT_SECRET
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# Generate POSTGRES_PASSWORD
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" >> .env
```

### 3. Deploy

```bash
docker compose up -d
```

### 4. Verify

```bash
curl http://localhost:8080/health
# {"status":"healthy","version":"0.1.0","multi_tenant":true}
```

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              Load Balancer                  │
                    │         (Cloudflare / AWS ALB)              │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │              Forma Runtime                  │
                    │           (Multi-Tenant Mode)               │
                    │                                             │
                    │  ┌─────────────────────────────────────┐   │
                    │  │         Schema Registry              │   │
                    │  │  project_a -> models, routes         │   │
                    │  │  project_b -> models, routes         │   │
                    │  │  project_c -> models, routes         │   │
                    │  └─────────────────────────────────────┘   │
                    │                                             │
                    │  /api/p/project_a/posts                    │
                    │  /api/p/project_b/users                    │
                    │  /graphql/p/project_c                      │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │              PostgreSQL                     │
                    │                                             │
                    │  p_project_a_posts                         │
                    │  p_project_a_users                         │
                    │  p_project_b_posts                         │
                    │  p_project_c_orders                        │
                    └─────────────────────────────────────────────┘
```

## Scaling

### Horizontal Scaling

For high traffic, run multiple Runtime instances behind a load balancer:

```yaml
services:
  runtime:
    deploy:
      replicas: 3
```

The Runtime is stateless - all state is in PostgreSQL and Redis.

### Database Scaling

For large deployments:
1. Use a managed PostgreSQL service (AWS RDS, GCP Cloud SQL, etc.)
2. Set up read replicas for query scaling
3. Use connection pooling (PgBouncer)

## SSL/TLS

For production, always use HTTPS. Options:

1. **Cloudflare Proxy** (recommended): Full SSL termination with DDoS protection
2. **Traefik**: Auto-generates Let's Encrypt certificates
3. **AWS ALB**: Managed certificates with ACM

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INTERNAL_KEY` | Yes | Secret key for Builder <-> Runtime communication |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `DATABASE_URL` | No | PostgreSQL connection string (default: uses `db` service) |
| `POSTGRES_PASSWORD` | Yes | Password for PostgreSQL (when using included db) |
| `AI_VALIDATION_ENABLED` | No | Enable AI-powered schema validation (default: false) |
| `STORAGE_PROVIDER` | No | File storage: `local` or `s3` (default: local) |
| `S3_BUCKET` | No | S3 bucket for file uploads |
| `AWS_ACCESS_KEY_ID` | No | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | No | AWS credentials for S3 |

## Monitoring

The Runtime exposes several endpoints for monitoring:

- `/health` - Basic health check
- `/schema` - Lists registered projects (in multi-tenant mode)
- `/docs` - OpenAPI documentation

For production monitoring, we recommend:
- Prometheus + Grafana for metrics
- Sentry for error tracking
- CloudWatch/Datadog for logs

## Backup

Back up the PostgreSQL database regularly:

```bash
# Create backup
docker compose exec db pg_dump -U forma forma_runtime > backup.sql

# Restore backup
docker compose exec -T db psql -U forma forma_runtime < backup.sql
```

## Troubleshooting

### Runtime not starting

Check logs:
```bash
docker compose logs runtime
```

### Database connection issues

Verify database is healthy:
```bash
docker compose exec db pg_isready -U forma -d forma_runtime
```

### Project registration failing

1. Check INTERNAL_KEY matches in Builder and Runtime
2. Verify database migrations ran successfully
3. Check Runtime logs for validation errors

## Support

For issues, please open a GitHub issue at https://github.com/axiondeeplabs/forma/issues
