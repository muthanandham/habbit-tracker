# Prompt Library
## Unified Daily Tracker (Life-OS) — Prompt Templates

> **Version:** 2.0 | **Last updated:** March 2026

## Prompt Rules (All)
- Keep outputs concise and actionable.
- Support multi-module parsing (Habits, Tasks, Wellness).
- Avoid clinical or medical claims.
- Preserve user intent and specific phrasing.

## PROMPT-001: Unified Activity Logging (Primary)
**Use:** Convert natural language into structured tool calls.

Input:
- User prompt ("Drank 2L water and did 50 pushups")
- Today's Context (Current Habits, Tasks, and Wellness logs)

Goal:
- Identify if the input maps to a Habit (log_habit_checkin), a Task (add_task/update_task), or Wellness (log_wellness_entry).
- Call multiple tools if applicable.

## PROMPT-002: Dynamic Insight Generation
**Use:** Generate a single, actionable insight from cross-module data.

Input:
- 7-day Habit metrics.
- 7-day Wellness logs (Mood/Sleep/Energy).
- Task completion rates.

Output:
- One 1-2 sentence "Correlation Insight" (e.g., "Your task completion is 20% higher on days you log 2L+ water").
- One "Small Win" suggestion for the next 24h.

## PROMPT-003: Daily Reflection Wrap-up
**Use:** Summarize the day's achievements and prompt for reflection.

Input:
- Completed habits/tasks.
- Wellness logs.

Output:
- A brief (3-4 bullet) "EOD Report."
- One open-ended "Reflection Question" based on the day's pattern.

## PROMPT-004: Proactive Nudge (Context-Aware)
**Use:** Generate a gentle nudge based on the time of day and status.

Input:
- Current Time (Morning/Noon/Night).
- Pending high-priority items.
- Recent mood/energy state.

Output:
- One encouraging, sub-10 word nudge.
