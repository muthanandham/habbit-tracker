# ADR-001: Adopt MERN Stack with AI Intelligence Layer for Life-OS

- Status: Accepted
- Date: 2026-03-30
- Deciders: Product + Engineering
- Scope: Unified Daily Tracker (Life-OS) v2

## Context

We are evolving the habit tracker into a **Unified Daily Tracker (Life-OS)**. This requires consolidating Habits, Tasks, and Wellness into a single frictionless platform powered by an AI Assistant.

Constraints for v2:
- **Multi-Modal Entry:** AI Chat + Dashboard Widgets.
- **Unified Logic:** Cross-module updates (log water + check habit in one go).
- **Fast Performance:** Sub-200ms "Mission Control" updates.
- **MERN Stack:** MongoDB, Express, React, Node.js.

## Decision

We will use a **MERN-based architecture** with a dedicated **AI Gateway Service**:

- **Frontend:** React + Vite (Fast Dashboard, streaming AI chat).
- **Backend:** Node.js + Express (Handles core business logic and LLM provider integration).
- **Database:** MongoDB Atlas (Flexible schemas for habits, tasks, and wellness logs).
- **AI Model:** Gemini 1.5 Flash (Core logging) and Pro (Advanced insights).

## Rationale

1. **Integrated AI Control:** MERN allows full control over prompt engineering, tool calling (function calling), and the resulting database state transitions without 3rd party middleware limitations.
2. **Unified State Management:** Using TanStack Query and React state, we can synchronize the AI chat response directly with the Dashboard widgets.
3. **Flexible Schema:** MongoDB is ideal for the evolving "Wellness" metrics, which may range from simple mood integers to complex sleep/biometric blobs.
4. **End-to-End JS/TS:** Maintains a "Solo-Maintainer Friendly" profile by using a single language across the entire stack.

## Alternatives Considered

### 1) BaaS (React + Supabase + Edge Functions)
- **Result:** Not selected. While fast for simple CRUD, the complex interaction loop between the AI assistant and multiple domain modules (Habits/Tasks/Wellness) is more maintainable in a unified Express backend.

### 2) AI-Driven No-Code / Low-Code
- **Result:** Not selected. Lacks the "Premium Editorial" UI control (Obsidian style) and specific "Mission Control" performance requirements.

## Consequences

### Positive
- **Deep Integration:** AI can cross-reference habits and wellness logs for unique insights.
- **Micro-logging Speed:** High-performance API responses for rapid daily check-ins.
- **Extensibility:** Easy to add new "Life Tracking" modules in the future.

### Negative
- **Operational Overhead:** Requires managing a custom Node/Express backend instead of a managed service.
- **Prompt Engineering Effort:** Significant time required to tune the "Unified Logging" accuracy.

## Revisit Triggers
- MAU exceeds 10,000.
- Need for complex multi-user collaboration features.
- Performance latency for AI-parsed logs exceeds 1.5s.
