# Red Team Document
## Habbit Tracker — Adversarial Testing

> **Version:** 1.0 | **Last updated:** March 2026

## Threat Scenarios

### 1) Auth Brute Force

- Attack: repeated login attempts
- Defense: rate limit + lockout/backoff

### 2) Token Abuse

- Attack: replay/forged token usage
- Defense: token validation, expiry checks, signature verification

### 3) Input Injection

- Attack: malformed payloads in habit/check-in fields
- Defense: strict schema validation + sanitization

### 4) IDOR on Habit Resources

- Attack: access another user’s habit by ID manipulation
- Defense: user-scoped ownership checks on all resource operations

### 5) AI Prompt Injection (optional feature)

- Attack: goal text attempts to override model/tool policy
- Defense: instruction hierarchy + schema guard + no destructive tools

## Validation Checklist

- No cross-user data access
- No secret leakage in logs
- No auth bypass via edge-case routes

