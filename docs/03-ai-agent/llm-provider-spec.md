# LLM Provider Spec
## Unified Daily Tracker (Life-OS) — AI Integration Details

> **Version:** 2.0 | **Last updated:** March 2026

## Scope

In v2, the AI Assistant is a **Core Pillar** of the Unified Daily Tracker. It handles:
- **Unified Logging:** Multi-module parsing for Habits, Tasks, Wellness.
- **Dynamic Summaries:** Daily wrap-ups and reflections.
- **Cross-Module Insights:** Finding correlations in tracking data.

## Provider Strategy

Unified focus on speed and multimodal-readiness.

### Primary Provider (Gemini 1.5 Flash)
- **Why:** Best-in-class performance/latency for "Flash" workloads.
- **Capabilities:** Massive 1M token context window (allows for deep historical tracking context).
- **Cost:** High efficiency for frequent "micro-logging" requests.

### Fallback Provider (Gemini 1.5 Pro)
- **Why:** Used for complex "Reasoning" tasks (e.g., Deep Insight generation across months of data).
- **Graceful Degradation:** If primary is rate-limited, Pro takes over or uses simple template-based fallback.

## Implementation Details

- **MERN API Middleware:** All AI requests go through Node/Express with `Zod` validation.
- **Privacy:** Anonymized user strings sent to LLM where possible.
- **Streaming:** Support for streaming text responses via Server-Sent Events (SSE) or WebSockets.

## Rate Limit & Budget Management

- **User Quota:** Standard "Micro-Log" quota (e.g., 50 logs/day).
- **System Guard:** Global hourly cap to prevent API cost spikes.
- **Exponential Backoff:** Standard retry logic for 429/503 errors.

## Model Configuration

- `TEMPERATURE`: 0.1 (Precision for logging) / 0.7 (Creativity for reflections).
- `MAX_TOKENS`: 300 (Small logs) / 1,000 (Weekly summaries).
- `TOOLS`: JSON schemas for habits, tasks, wellness updates.
