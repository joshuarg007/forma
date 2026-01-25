# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Forma Runtime, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please send an email to: **security@axiondeep.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt within 48 hours.
2. **Assessment**: We will assess the vulnerability and determine its severity.
3. **Fix Timeline**: We aim to release fixes within 90 days of confirmed vulnerabilities.
4. **Disclosure**: We will coordinate with you on public disclosure timing.

### Bug Bounty

We currently do not have a formal bug bounty program, but we appreciate and acknowledge security researchers who report vulnerabilities responsibly.

## Security Features

### Authentication

- **JWT Tokens**: HS256/HS512 algorithm with configurable secrets
- **Password Hashing**: bcrypt with automatic salting
- **Access/Refresh Tokens**: Short-lived access tokens (15 min default), long-lived refresh tokens (7 days default)
- **OAuth Integration**: Secure OAuth 2.0 flow with state parameter validation

### Authorization

- **Role-Based Access Control**: Per-collection permissions (read, create, update, delete)
- **Owner-Based Access**: Support for "owner" and "self" permission rules

### Schema Validation

- **AI-Powered Safety Rails**: Automatic detection of:
  - Dangerous field names (password, ssn, credit_card without proper handling)
  - Missing security fields on auth collections
  - Breaking changes that could cause data loss

### Data Protection

- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy
- **Input Validation**: Pydantic validation on all inputs
- **CORS Configuration**: Configurable allowed origins

## Security Best Practices

When deploying Forma Runtime:

### Environment Variables

```bash
# Generate a strong JWT secret (32+ characters)
JWT_SECRET=$(openssl rand -hex 32)

# Use secure database credentials
DATABASE_URL=postgresql://user:strong-password@host/db

# Set environment to production
ENVIRONMENT=production
DEBUG=false
```

### Production Checklist

- [ ] Use HTTPS (TLS termination via reverse proxy)
- [ ] Set strong, unique JWT_SECRET
- [ ] Restrict CORS_ORIGINS to your domain
- [ ] Enable rate limiting at the reverse proxy level
- [ ] Use PostgreSQL instead of SQLite
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Configuration Recommendations

```python
# cors - restrict to your domains
CORS_ORIGINS=["https://yourdomain.com"]

# tokens - adjust based on security needs
ACCESS_TOKEN_EXPIRE_MINUTES=15  # Keep short
REFRESH_TOKEN_EXPIRE_DAYS=7     # Adjust as needed

# disable debug in production
DEBUG=false
```

## Known Security Considerations

### Rate Limiting

Forma Runtime does not include built-in rate limiting. Implement rate limiting at the reverse proxy level (nginx, Cloudflare, etc.).

### File Uploads

When using file uploads:
- Validate file types
- Scan for malware if accepting user uploads
- Use S3 or similar with proper IAM policies

### Multi-Tenant Mode

In multi-tenant mode:
- Table prefixing provides isolation at the database level
- Internal API endpoints require `X-Internal-Key` header
- Ensure `INTERNAL_KEY` is unique and secure

## Changelog

Security-related changes are documented in [CHANGELOG.md](CHANGELOG.md) under the "Security" section.
