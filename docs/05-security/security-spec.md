# Security Spec
## Habbit Tracker — Security Architecture

> **Version:** 1.0 | **Last updated:** March 2026

## Security Principles

1. Standard secure defaults
2. Minimize attack surface
3. Validate all external input
4. Fail safely

## Authentication & Session

- Email/password authentication
- Passwords hashed with argon2/bcrypt
- Session tokens with secure flags and rotation policy
- Logout invalidates active session tokens

## API Security

- Input validation with schema checks
- Auth guard on all user data endpoints
- Per-route rate limiting (strict for auth and AI routes)
- Consistent error envelopes without sensitive internals

## Data Protection

- HTTPS in transit
- Sensitive env vars in secret manager
- Minimal PII stored
- Soft delete policies where applicable

## Logging & Secrets

- Never log password, tokens, secret keys
- Never expose stack traces to clients in production
- Secret scanning in CI

## Dependency & Build Security

- Automated dependency audit in CI
- Lockfile required
- Production build with source map controls

