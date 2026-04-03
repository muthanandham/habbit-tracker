# Agent Design
## Habbit Tracker — AI/Dev Agent Architecture

> **Version:** 1.0 | **Last updated:** March 2026

## Purpose

Define how coding agents and in-app AI features are structured for this project.

## Dev Agent Roles

- Planner: breaks changes into incremental tasks
- Builder: implements scoped changes
- Reviewer: validates behavior and edge cases
- Doc Maintainer: keeps docs in sync with implementation

## Routing Rules

- Product changes begin in `docs/01-product`
- Architecture changes must update ADR + relevant architecture docs
- AI behavior changes must update `docs/03-ai-agent/*`
- No implementation without documented scope

## In-App AI Agent (v1 scope)

AI is optional and focused on setup/support, not autonomous control.

Capabilities:
- Suggest starter habits from user goals
- Rewrite habit wording for clarity
- Provide simple consistency tips from user metrics

Constraints:
- Never execute destructive actions automatically
- Never fabricate user history
- Always allow manual override

## Decision Log Hook

Every AI-relevant product decision should be reflected in:
- ADR (if architectural)
- `docs/03-ai-agent/*` (if behavior/prompt/tooling)

