# Deployment Runbook
## Habbit Tracker — Build, Deploy, Release

> **Version:** 1.0 | **Last updated:** March 2026

## Environments

- `dev`
- `staging`
- `production`

## Required Secrets

- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_API_KEY`
- `AI_PROVIDER_API_KEY` (optional)
- `APP_BASE_URL`

## CI Pipeline

On every PR:
- install dependencies
- lint
- unit tests
- build frontend and backend

On merge to main:
- deploy staging
- run smoke checks
- promote to production

## Deployment Order

1. Deploy backend API
2. Run connectivity + health checks
3. Deploy frontend
4. Run E2E smoke tests

## Rollback

- Roll back frontend to previous stable deployment
- Roll back backend to previous image/release
- Confirm DB compatibility before rollback completion

