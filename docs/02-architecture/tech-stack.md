# Tech Stack
## Unified Daily Tracker (Life-OS) — v2

> **Version:** 2.0 | **Last updated:** March 2026

## Frontend (The "Mission Control")
- **React 19+** (Functional components, Hooks)
- **Vite 6+** (Fast build/HMR)
- **Tailwind CSS v4** (Utility-first styling with modern tokens)
- **Zustand** (Lightweight client-side state for UI toggles)
- **TanStack Query** (Robust server state, caching, and background sync)
- **Lucide React** (Consistent, high-quality iconography)
- **Framer Motion** (Smooth transitions for time-phased UI shifts)

## Backend (The "API Core")
- **Node.js 22+** (LTS stable)
- **Express 5+** (Standard middleware architecture)
- **Zod** (Schema-first request validation for all 3 modules)
- **Passport.js + JWT** (Secure authentication and session management)
- **Rate Limiter** (Protecting AI endpoints from exhaustion)

## Database (The "Unified Store")
- **MongoDB Atlas** (Flexible document store for varied habit/task/wellness data)
- **Mongoose ODM** (Schema enforcement and easy relative queries)

## AI Assistant (The "Parser & Log Engine")
- **LLM Provider:** Gemini 1.5 Flash (Primary recommendation for speed, 1M context, and cost-efficiency)
- **LangChain / Vercel AI SDK:** Streamlined integration for chat streaming and tool calling.
- **Parsing Strategy:** Function calling (tools) to map natural language to Habit, Task, or Wellness schemas.

## Infrastructure & Observability
- **Deployment:** Vercel (Frontend), Railway/Render (Backend), MongoDB Atlas (DB).
- **Error Tracking:** Sentry (Full-stack trace).
- **Analytics:** PostHog (Lightweight, event-based product metrics).

## Why This Stack
- **Unified Language:** JavaScript/TypeScript from DB to UI (MERN).
- **Speed to Value:** High-level abstractions (Vite, Tailwind, Atlas) minimize infra setup.
- **AI-Readiness:** MERN scales well for secondary AI processing and real-time streaming updates.
- **Solo Friendly:** Low maintenance overhead for a single developer.
