# Observability Plan
## Habbit Tracker — Monitoring & Alerts

> **Version:** 1.0 | **Last updated:** March 2026

## What We Monitor

### Reliability

- API uptime
- Error rate (5xx)
- P95 response time for core endpoints

### Product Metrics

- Daily check-in events
- Habit completion rate
- 7+ day streak continuation rate

### AI Feature Health (optional)

- AI request success/failure rate
- Fallback activation count
- Avg AI latency

## Alerts

- API uptime drop
- 5xx error spike
- Auth failure spike
- Check-in endpoint latency degradation

## Logging Policy

- Structured logs with correlation IDs
- Never log secrets/passwords/tokens
- Keep user-generated text logs minimal

