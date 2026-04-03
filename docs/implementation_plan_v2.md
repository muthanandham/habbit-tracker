# Life-OS: Next Phase Execution Plan

## Current Status — What's Built

| Layer | Status | Details |
|---|---|---|
| **Project Structure** | ✅ Done | Monorepo: `client/`, `server/`, `shared/` |
| **Auth (Backend)** | ⚠️ Partial | JWT + User model exists, contract inconsistencies remain |
| **Auth (Frontend)** | ⚠️ Partial | Login/Register pages work, persistence needs fixing |
| **Habits** | ⚠️ UI Shell | Page exists with demo data, not wired to API |
| **Tasks** | ⚠️ UI Shell | Page exists with demo data, not wired to API |
| **Wellness** | ⚠️ UI Shell | Page exists with demo data, not wired to API |
| **Journal** | ⚠️ UI Shell | Page exists with demo data, not wired to API |
| **Dashboard** | ⚠️ UI Shell | Visual shell with mock cards, not reading real data |
| **AI Assistant** | ⚠️ Partial | UI + backend route + Gemini 2.5 Flash gateway ready, not fully tested |
| **API Routes** | ✅ Done | Auth, Habits, Tasks, Wellness, Journal, AI — all exist |
| **Models** | ✅ Done | User, Habit, Task, Wellness, Journal — all exist |
| **Tests** | ❌ Placeholder | 3 spec files exist but coverage is minimal |
| **Lint/CI** | ❌ Broken | Lint scripts reference missing targets |

---

## Proposed Next Phase: "Make It Real" (Wave 1)

The app has all the shells — pages, routes, models. The critical gap is that **frontend pages still use local demo state instead of real API data.** This phase wires everything together into a real, working product.

### Step 1: Fix Auth Flow (Foundation)
**Why first:** Everything depends on a stable auth token.

- [ ] Verify auth controller handles register/login with real MongoDB persistence
- [ ] Ensure JWT token is stored and sent on every API request
- [ ] Auto-logout on 401 responses
- [ ] Test login → dashboard → refresh cycle works end-to-end

### Step 2: Wire Habits Page to Backend
- [ ] Fetch habit list from `GET /api/habits` on page load
- [ ] Create habits via `POST /api/habits`
- [ ] Complete/uncomplete habits via `PATCH /api/habits/:id/complete`
- [ ] Delete/archive habits
- [ ] Show real streak data

### Step 3: Wire Tasks Page to Backend
- [ ] Fetch tasks from `GET /api/tasks`
- [ ] Create tasks via `POST /api/tasks`
- [ ] Update task status (todo → in-progress → done)
- [ ] Task priority and due date support
- [ ] Carryover overdue tasks

### Step 4: Wire Wellness Page to Backend
- [ ] Log wellness entries via `POST /api/wellness`
- [ ] Fetch wellness history from `GET /api/wellness`
- [ ] Mood, sleep, water, exercise tracking

### Step 5: Wire Journal Page to Backend
- [ ] Create journal entries via `POST /api/journal`
- [ ] Fetch entries from `GET /api/journal`
- [ ] Reflection and mood tagging

### Step 6: Real Dashboard
- [ ] Replace mock cards with real aggregated data from backend
- [ ] Today's habits completion %, active tasks count, latest wellness
- [ ] Activity feed from real user actions

### Step 7: AI Assistant — End-to-End Path
- [ ] Verify Gemini 2.5 Flash connection works on local machine
- [ ] Test: user says "Add a habit to drink water daily" → AI parses → user commits → habit appears in Habits page
- [ ] Test: user asks "How am I doing?" → AI reads real habit/task data and responds with insights

---

## Wave 2 (After Wave 1): Hardening

- Fix lint scripts
- Add meaningful backend integration tests
- Set up CI pipeline (build + lint + test)
- Security review (rate limiting, input sanitization, CORS)
- Documentation cleanup
- Production deployment prep

---

## Open Questions

> [!IMPORTANT]
> **Which step would you like to start with?**
> 1. **Auth fix** — ensures everything downstream works
> 2. **Wire a specific page** (Habits, Tasks, etc.) — if you want to see a feature come alive first
> 3. **Full Wave 1 in sequence** — I'll execute all steps 1-7 in order
> 4. **Something else** — settings page, profile page, onboarding flow, etc.

## Verification Plan

### Automated Tests
- Run the server and test each API endpoint with real MongoDB
- Run Playwright E2E tests for login → create habit → verify it persists

### Manual Verification
- Browser testing via the dev server to validate UI ↔ API integration
- AI Assistant chat test once Gemini connectivity is confirmed locally
