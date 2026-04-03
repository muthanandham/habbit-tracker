# Integration Spec
## Habbit Tracker — External Services

> **Version:** 1.0 | **Last updated:** March 2026

## Core Integrations

### 1) MongoDB Atlas

- Primary data store
- Connection via `MONGODB_URI`
- Enforce IP/network and credential restrictions

### 2) Email Service (Auth-related)

- Use for verification/reset only
- Examples: Resend, Postmark, SendGrid
- Rate limit reset requests

### 3) Optional AI Provider

- Purpose: assist with habit setup from natural-language goals
- Server-side call only (never from browser directly)
- Feature flag controlled

## Environment Variables

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET` or session secret
- `APP_BASE_URL`
- `EMAIL_API_KEY`
- `AI_PROVIDER_API_KEY` (optional)

## Integration Policies

- Fail gracefully if optional AI is unavailable
- Never block core habit tracking due to third-party outages
- Log integration errors without sensitive user content

## Deferred

- `api-spec.yaml` remains deferred until endpoint shapes are finalized.

