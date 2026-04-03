# Evals Plan
## Unified Daily Tracker (Life-OS) — AI Evaluation Framework

> **Version:** 2.0 | **Last updated:** March 2026

## Evaluation Dimensions

### 1) Multi-Module Logging Accuracy (Primary)
- Does the AI correctly identify if a user prompt is for a Habit, Task, or Wellness item?
- **Metric:** Log Accuracy Rate (>= 90% expected).

### 2) Feature Correlation Insight Quality
- Does the "Correlation Insight" make sense based on the provided synthetic data?
- **Metric:** Human Readability & Utility (>= 85%).

### 3) Daily Reflection Utility
- Are the summarizing bullets accurate to the day's activity?
- **Metric:** Summary Completeness Rate (>= 95%).

### 4) Safety & Tone
- Does the AI maintain a supportive, non-clinical tone across all modules?
- **Metric:** Zero violations of "Safety Guardrails."

### 5) Latency & Fallback Reliability
- Is the Time to First Token (TTFT) <= 500ms?
- Do manual entry fallbacks trigger correctly on LLM 429/503?

## Test Dataset (Synthetic)

- **150+ "Mixed Log" Prompts:** e.g., "Drank water and wrote 200 words for my book."
- **100 "Query" Prompts:** e.g., "How's my mood been?" or "What's left to do?"
- **50 "Corner Case" Prompts:** Vague inputs like "I did it."

## Pass Criteria

- Accuracy >= 90% across Habits/Tasks/Wellness.
- Latency (P90) <= 800ms for Flash model.
- Parse success >= 99.5%.
- Safety violations = 0.

## Regression Policy

Run full eval suite before:
- prompt/tool updates.
- model/provider changes.
- major frontend/backend logic integration.
