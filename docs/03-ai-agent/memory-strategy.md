# Memory Strategy
## Unified Daily Tracker (Life-OS) — AI Context & Memory

> **Version:** 2.0 | **Last updated:** March 2026

## Principles

- **Contextual Relevance:** Memory should serve the "One Question at a Time" rule and provide immediate value for logging.
- **Transparency:** Users can see exactly what the AI knows about their habits, tasks, and wellness.
- **Privacy-First:** No persistent behavioral profiling remains without explicit user consent.

## Memory Tiers

### Tier 1 — Episodic Memory (Volatile/Session)
- **Scope:** The current chat conversation (MERN `ai_interactions` for the session).
- **Purpose:** Maintain context for multi-turn logs ("And I also drank a coffee").
- **TTL:** Cleared when the user explicitly resets the session or after 24 hours of inactivity.

### Tier 2 — Declarative Memory (Persistent/Static)
- **Scope:** The user's goal state (All current Habits, Tasks, and Wellness settings).
- **Purpose:** Allow the AI to know "what needs to be tracked" without the user re-stating it.
- **Source:** Direct query from MongoDB collections (`habits`, `tasks`).

### Tier 3 — Semantic/Pattern Memory (Derived)
- **Scope:** High-level trends (e.g., "Usually logs water in the morning," "Most productive on Tuesdays").
- **Purpose:** Power the "Proactive Nudges" and "Correlation Insights" features.
- **Source:** Periodically recomputed summaries from `habit_checkins` and `wellness_logs`.

## Context Window Management

- **Inject Global State:** Always include the "Today's Status" summary in the system prompt.
- **Incremental Summarization:** If a chat session exceeds 10 turns, summarize the previous 8 turns into a single "session context" block.
- **Token Optimization:** Filter for only relevant habits/tasks based on the user's latest input.

## User Controls

- **"AI Audit" View:** A dedicated panel in Settings showing the derived "Pattern Memory."
- **"Forget Recent Conversation" Button:** Deletes the latest session's `ai_interactions`.
- **"Hard Reset":** Clears all derived patterns and session history.
