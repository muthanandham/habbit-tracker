# QA Test Plan
## Habbit Tracker — Test Strategy

> **Version:** 1.0 | **Last updated:** March 2026

## Test Layers

- Unit tests: domain logic and helpers
- API integration tests: auth, habits, check-ins, reminders
- UI tests: critical flows in responsive layouts
- E2E smoke tests: auth -> create habit -> check-in -> streak update

## Core Test Scenarios

### Auth

- Sign up, login, logout
- Invalid credentials handling
- Password reset flow

### Habit Management

- Create/edit/archive/reactivate habit
- Frequency validation
- Tracking type validation

### Daily Tracking

- Binary check-in
- Quantity/time check-in
- Undo immediate check-in action

### Metrics

- Current streak correctness
- Best streak correctness
- Weekly completion calculation

### Reminder Center

- Due reminder rendering
- Dismiss/complete behavior

## Quality Gates

- Unit + integration tests must pass on PR
- No critical regression in E2E smoke suite
- Accessibility spot checks on core pages

