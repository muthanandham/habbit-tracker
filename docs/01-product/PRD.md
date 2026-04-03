# Product Requirements Document (PRD)
## Unified Daily Tracker (Life-OS)

> **Version:** 2.0 | **Status:** Active | **Last updated:** March 2026

## Executive Summary

Unified Daily Tracker (Life-OS) is an all-in-one "Mission Control" for solo working professionals to manage their habits, tasks, and wellness. By consolidating these three pillars into a single frictionless interface, the product helps users achieve peak performance, mental clarity, and long-term consistency.

## Target Users

- **Primary:** High-performing solo professionals (developers, creators, freelancers).
- **Secondary:** Multi-faceted individuals balances complex daily routines and wellness goals.

## Problem Statement

Users suffer from "App Fatigue" by switching between separate tools for habits, to-do lists, and wellness logs. This fragmentation leads to lost context, friction in data logging, and a lack of holistic insight into how their health affects their productivity.

## Product Goals (v2)

- **Unify and Simplify:** One place for "day-to-day things."
- **Reduce Friction:** Multi-modal entry (AI Chat + Dashboard) for sub-5 second logging.
- **Holistic Insights:** Identify correlations between wellness (sleep, mood) and consistency.
- **Mental Clarity:** Clear the "mental noise" through a unified daily focus.

## Non-Goals (v2)

- Social networking or community features.
- Complex project management (no Gantt charts or multi-user collaboration).
- Clinical health advice (no medical claims).

## Core Feature Modules

### Module 1 — Unified AI Assistant
- **Natural Language Logging:** "Logged 2L water and finish the PRD" -> System automatically updates wellness and checks off tasks.
- **Intelligent Nudges:** Context-aware reminders based on the user's current day state.
- **Daily Reflection:** AI-driven end-of-day summary and reflection prompt.

### Module 2 — Habit System
- **Check-in Engine:** Frictionless daily habit tracking with streaks and best-streak feedback.
- **Template Library:** Pre-built routine packs (Focus, Energy, Morning Ritual).
- **Flexible Frequency:** Custom rules for daily, weekly, or specific interval habits.

### Module 3 — Task Management (Productivity)
- **Today Checklist:** High-priority "Must-Do" list for the day.
- **Quick-Add tasks:** Fast capture of unexpected to-dos.
- **Focus Mode:** Minimalist view for the current active task.

### Module 4 — Wellness & Reflection
- **Biometric/Mood Tracking:** Simple entry for Mood, Energy, Hydration, and Sleep.
- **Journaling:** Lightweight, one-sentence daily reflection logs.
- **Trend Cards:** Visual representation of wellness metrics over time.

### Module 5 — Unified Mission Control (Dashboard)
- **Time-Phased UI:** Dynamic dashboard that shifts focus based on time (Morning Prep, Deep Work, Evening Wind-down).
- **Status At-a-Glance:** Current habit streaks, pending tasks, and today's wellness summary.

## Primary UX Principles

- **Checklist-First:** Action-oriented landing page.
- **Zero-Friction Logging:** AI Chat or Quick-Tap widgets (no deep menu diving).
- **Premium Editorial Aesthetic:** Clean, typography-focused "Obsidian" style with no-line design.

## Success Metrics (v2)

- **Daily Engagement Rate:** % of users logging at least one habit/task/wellness item daily.
- **Multi-Module Usage:** Average number of modules (Habits/Tasks/Wellness) used per user.
- **Consistency Score:** Streak retention across all daily categories.
- **AI Utility:** % of logs captured via AI Assistant vs. manual entry.

## Functional Requirements

- **MERN Stack:** MongoDB storage, Express API, React Frontend, Node.js logic.
- **Secure Auth:** JWT-based email/password authentication.
- **AI Integration:** LLM-powered parsing for natural language entry.
- **Responsive Web:** Full mobile and desktop support.
- **Real-time Sync:** Instant updates across devices.

## Release Scope

### P0 (Must-Have)
- Auth & Unified Dashboard.
- Habit Tracking (Binary/Numeric).
- Task Checklist (Today list).
- AI Command Bar (Basic parsing for water/tasks).
- Streaks & Fundamental Metrics.

### P1 (Important)
- Wellness logs (Mood, Energy, Hydration).
- Advanced AI Assistant (Multi-turn chat, proactive nudges).
- Template Packs for Routines.
- Weekly Summary Reports.

### P2 (Later)
- AI-driven "Correlation Insights" (e.g., "You stay consistent when you sleep 7+ hours").
- Rich Journaling with media support.
- API integrations with 3rd party health apps.
