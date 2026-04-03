# Incident Response
## Habbit Tracker — Outage & Failure Runbook

> **Version:** 1.0 | **Last updated:** March 2026

## Severity Levels

| Level | Description | Target Response |
|---|---|---|
| P0 | Full service outage or auth failure for all users | Immediate |
| P1 | Core check-in or data write failures | < 4 hours |
| P2 | Non-critical degradation (AI insights, minor UI issues) | < 24 hours |

## Common Incidents

### P0: API unavailable

- Verify hosting status and health endpoint
- Check recent deploy rollback if needed
- Confirm DB connectivity

### P1: Check-ins failing

- Inspect write path logs
- Validate schema changes and indexes
- Run targeted patch and re-test

### P2: AI setup unavailable

- Confirm provider quota/errors
- Force template fallback mode
- Keep core habit functions fully available

## Communication

- Record incident start, impact, actions, resolution
- Publish concise post-incident note

