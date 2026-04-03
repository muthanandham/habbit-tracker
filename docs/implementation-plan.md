# Implementation Plan
## Unified Daily Tracker (Life-OS) - Repo-Reality Execution Plan

> **Version:** 3.0 | **Updated:** 2026-04-03

## 1. Objective

Replace the previous aspirational roadmap with a single execution plan aligned to the codebase as it exists today.

This document answers three questions:
- What is already implemented
- What is still pending
- What should be built next, in what order

## 2. Current Delivery Position

### Implemented Now
- Monorepo structure exists for `client`, `server`, and `shared`
- React app shell exists with routes for Dashboard, Habits, Tasks, Wellness, Journal, and Assistant
- Express API mounts auth, habits, tasks, wellness, and journal routes
- MongoDB connection and domain models exist
- Backend CRUD exists in meaningful form for habits, tasks, wellness, and journal
- Habit completion/uncompletion and task carryover endpoints already exist
- Shared schema package exists
- Production build currently passes

### Partially Implemented
- Authentication UI and JWT flow exist, but auth persistence and contract consistency are incomplete
- Dashboard exists as a visual shell, but much of it is still based on local mock data
- Habits, Tasks, Wellness, and Journal pages exist, but most frontend state is still local/demo state rather than API-backed state
- AI Assistant page exists, but behavior is still placeholder-level

### Not Implemented Yet
- Real AI logging backend and tool-calling flow
- End-to-end contract alignment between docs, shared schemas, server responses, and client consumers
- Honest release validation (`check`, working lint, real automated test coverage, CI)
- Finalized production hardening and observability

### Verified Repo Status
- `npm run build`: passing
- `npm run lint`: failing because workspace lint scripts target missing `src/` patterns
- `npm test`: effectively placeholder-only; current pass does not indicate meaningful coverage

## 3. Planning Assumptions

- This plan optimizes for a real, shippable web product before expanding scope.
- Delivery sequence is:
  - Wave 1: AI + MVP together
  - Wave 2: Hardening and release readiness
- Existing backend routes are worth preserving and wiring up rather than rebuilding from scratch.
- Missing planned features that are not present in the current app surface stay deferred unless explicitly reintroduced.
- Documentation should reflect repo reality, not preserve outdated aspirational wording.

## 4. Program Sequence

### Wave 1 - AI + MVP Together

Goal: make the current app surface real while building the first useful AI assistant path on top of it.

Wave 1 is complete when:
- auth is real and consistent
- core product pages read/write server state
- dashboard reflects real backend data
- AI assistant can log at least one real action path into the system
- API/shared contract drift is reduced enough that frontend and backend development can move without guesswork

### Wave 2 - Hardening and Release Readiness

Goal: make the system trustworthy to ship and maintain.

Wave 2 is complete when:
- lint and test commands are meaningful and enforced
- CI validates core paths
- auth and AI paths have explicit security checks
- documentation, QA, and release reporting no longer overstate maturity

## 5. Workstreams

### Workstream A - Backend Core

### Current State
- Domain routes exist for auth, habits, tasks, wellness, and journal
- CRUD is already present for the non-auth domains
- Auth logic is still partially mock-driven

### Pending Work
- Replace mock/in-memory auth with Mongo-backed auth using the real user model
- Fix auth contract mismatches between middleware, controllers, and client expectations
- Enforce authentication consistently across domain routes
- Normalize response shapes and error handling across routes
- Verify streak and carryover logic with tests instead of treating current implementation as implicitly correct

### Immediate Blockers
- Mock auth prevents this layer from being considered production-capable
- Inconsistent auth application creates security and correctness ambiguity

### Milestones
- M1: Real auth persistence and profile correctness
- M2: Auth consistently applied across all user-owned domain routes
- M3: Stable domain response contracts for habits, tasks, wellness, and journal

### Exit Criteria
- All user-owned routes depend on real authenticated users
- Client can consume all core domain routes without ad hoc response handling

### Workstream B - Frontend Product Wiring

### Current State
- Routes and page shells exist for the current app surface
- Most pages still use local `useState` demo data
- Only auth performs real API calls today

### Pending Work
- Wire Habits page to real list/create/update/archive/complete flows
- Wire Tasks page to real CRUD, status updates, and carryover flows
- Wire Wellness page to real create/update/reporting flows
- Wire Journal page to real CRUD and stats flows
- Replace dashboard mock cards and activity sections with real aggregated data
- Fix route inconsistencies so all in-app navigation points to valid screens

### Immediate Blockers
- Mock page state hides backend bugs and prevents meaningful QA
- Dashboard cannot serve as mission control until it reflects real state

### Milestones
- M1: Habits and Tasks API-backed
- M2: Wellness and Journal API-backed
- M3: Dashboard powered by backend aggregates instead of hardcoded mock sections

### Exit Criteria
- No core product page depends on seeded local demo state for primary behavior
- User actions persist through the backend and survive refresh/login cycles

### Workstream C - AI Assistant

### Current State
- Assistant page exists in the frontend
- Current assistant behavior is placeholder-only
- No server AI route is wired into the running app surface

### Pending Work
- Define the minimum useful AI logging scope for Wave 1
- Implement server-side AI endpoint and action execution path
- Connect assistant UI to the backend
- Support at least the first real logging actions into existing product modules
- Return clear success/failure feedback that updates the visible product state

### Immediate Blockers
- Placeholder assistant creates false confidence about feature completeness
- No live integration path exists between AI intent parsing and domain updates

### Milestones
- M1: AI endpoint available in server
- M2: Assistant UI connected to backend
- M3: At least one end-to-end logging path is live and reflected in the dashboard or module views

### Exit Criteria
- A user can perform real logging through the assistant without manual fallback for the supported action set
- Assistant outputs are grounded in actual persisted changes

### Workstream D - Shared Contracts and API Alignment

### Current State
- Shared schema package exists
- Docs describe `/api/v2`, while the server currently exposes `/api/...`
- Frontend, backend, and docs are not yet aligned around one contract

### Pending Work
- Decide and document the canonical API shape and prefix
- Align shared schemas with actual request/response usage
- Use shared validation consistently at route boundaries where practical
- Reduce duplication between server types, shared schemas, and frontend assumptions
- Update API docs to match the real running surface

### Immediate Blockers
- Contract drift slows feature wiring and creates avoidable integration bugs
- Documentation currently overstates consistency that the code does not provide

### Milestones
- M1: Canonical API shape chosen
- M2: Shared schemas adopted in the highest-value paths
- M3: API docs updated to match the app

### Exit Criteria
- Frontend, backend, and docs describe the same contract
- New feature work no longer requires rediscovering API behavior from code each time

### Workstream E - QA / Release Engineering

### Current State
- Build passes
- Lint is broken
- Workspace test commands are placeholder-level
- QA/release docs currently describe more maturity than the repo proves

### Pending Work
- Fix lint scripts so they run against real files
- Add a real root `check` command
- Add backend integration tests for auth, habits, tasks, wellness, and journal
- Keep Playwright only for flows that exercise real integrated behavior
- Add CI to enforce build, lint, and test gates
- Rewrite release reporting so it reflects actual automated evidence

### Immediate Blockers
- Current command surface cannot be trusted as a release signal
- Low test coverage makes current business logic difficult to verify safely

### Milestones
- M1: Working lint and `check`
- M2: Core backend integration test coverage
- M3: CI enforcing build/lint/test

### Exit Criteria
- Release readiness is demonstrated by commands and CI, not narrative docs
- Core business paths have automated regression coverage

### Workstream F - Documentation and Decision Hygiene

### Current State
- Architecture, QA, and planning docs exist
- Several documents have drifted from repo reality
- Session memory notes do not match the current implementation status cleanly

### Pending Work
- Keep this implementation plan as the main execution source of truth
- Update supporting docs that materially conflict with current code
- Remove or revise outdated claims about AI readiness, QA maturity, and API shape
- Record major implementation decisions as they are made so the plan stays maintainable

### Immediate Blockers
- Conflicting docs make it easy to plan against the wrong system

### Milestones
- M1: Implementation plan rewritten and accepted as the main execution doc
- M2: Supporting docs aligned on API, AI, and QA status
- M3: Ongoing decision updates kept current during implementation

### Exit Criteria
- Project docs no longer materially overstate progress
- Team members can use docs to understand the current build path without re-auditing the repo

## 6. Immediate Next Actions

These are the next steps that should start first:

1. Fix auth to use real persistence and correct request/user contracts
2. Wire one core frontend page per domain to the backend, starting with Habits and Tasks
3. Define the canonical API contract and align shared schemas/docs around it
4. Implement the first real AI assistant path against existing domain logic
5. Repair lint/test/check so Wave 2 hardening has a real foundation

## 7. Deferred

- Native mobile apps
- Complex calendar integrations
- Team/group challenges
- Advanced correlation engine beyond basic MVP insights
- Premium polish that depends on the core app first being real and testable

## 8. Planning Decisions

- Replaced the previous phase-led plan with a workstream-led plan
- Chosen program sequence: AI + MVP together, then hardening
- Optimized for repo reality instead of preserving outdated roadmap wording
- Kept scope focused on the currently visible web app surface
