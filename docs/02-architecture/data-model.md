# Data Model
## Unified Daily Tracker (Life-OS) — MongoDB Schema

> **Version:** 2.0 | **Last updated:** March 2026

## Schema Version History

| Version | Changes |
|---|---|
| 1.0 | Initial MERN schema for habits, check-ins, reminders |
| 2.0 | Added "Unified Core": Tasks, Wellness Logs, AI Interaction History |

## Collections

### users
- `_id`
- `email` (unique)
- `passwordHash`
- `timezone`
- `createdAt`
- `updatedAt`

### habits
- `_id`
- `userId`
- `name`
- `description` (optional)
- `trackingType` (`binary | quantity | timer`)
- `targetValue` (optional)
- `targetUnit` (optional)
- `frequency` (daily/weekly rule)
- `isArchived`
- `createdAt`
- `updatedAt`

### habit_checkins
- `_id`
- `userId`
- `habitId`
- `checkinDate` (YYYY-MM-DD string)
- `status` (`done | skipped | partial`)
- `value` (optional numeric)
- `durationMinutes` (optional)
- `note` (optional)
- `createdAt`

### tasks (New in v2.0)
- `_id`
- `userId`
- `title`
- `description` (optional)
- `dueDate` (YYYY-MM-DD string)
- `status` (`pending | completed | cancelled`)
- `isMustDo` (Boolean for priority)
- `lastCarriedOverAt` (Timestamp)
- `createdAt`
- `updatedAt`

### wellness_logs (New in v2.0)
- `_id`
- `userId`
- `logDate` (YYYY-MM-DD string)
- `moodScore` (1-5 integer)
- `energyScore` (1-5 integer)
- `waterGlasses` (decimal volume or glass count)
- `dailyReflection` (text/markdown)
- `createdAt`
- `updatedAt`

### ai_interactions (New in v2.0)
- `_id`
- `userId`
- `sessionID` (grouping chat interactions)
- `prompt` (un-parsed user input)
- `parsedModelAction` (JSON describing what was logged: habits/tasks/wellness)
- `response` (AI friendly reply)
- `createdAt`

### reminders
- `_id`
- `userId`
- `refId` (Reference ID to habit or task)
- `refType` (`habit | task`)
- `timeOfDay`
- `daysOfWeek`
- `isEnabled`
- `createdAt`
- `updatedAt`

## Derived Metrics & Indices

### Indices
- `users`: unique index on `email`.
- `habits`: `{ userId: 1, isArchived: 1 }`.
- `habit_checkins`: unique index on `{ userId: 1, habitId: 1, checkinDate: 1 }`.
- `tasks`: `{ userId: 1, dueDate: 1, status: 1 }`.
- `wellness_logs`: `{ userId: 1, logDate: -1 }`.
- `ai_interactions`: `{ userId: 1, createdAt: -1 }`.

### Derived Metrics (Computed at Query-Time or Cached)
- **Unified Consistency Score:** Weighted average of habit completion and task completion.
- **Wellness Correlation:** Finding patterns between `moodScore`/`energyScore` and `habit_checkins` frequency.
- **Micro-Insight engine:** "You stayed 100% consistent on hydration after logging a mood > 4."
