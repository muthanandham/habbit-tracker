# Tool Use Spec
## Unified Daily Tracker (Life-OS) — AI Tool Definitions

> **Version:** 2.0 | **Last updated:** March 2026

## Tooling Model

The AI Assistant uses JSON-Schema-based tool calling (function calling) to interact with the MERN backend. All tool calls are validated by the Express middleware (`Zod`) before hitting the MongoDB store.

## Tools (The "Unified Logic" Suite)

### 1. `get_today_status`
- **Purpose:** Retrieve the user's current status for all 3 modules (Habits, Tasks, Wellness).
- **Inputs:** None (uses current `userId` and `checkinDate`).
- **Outputs:** `habits[]`, `tasks[]`, `wellness_log (today)`.

### 2. `log_habit_checkin`
- **Purpose:** Check off a specific habit or update a numeric value/timer.
- **Inputs:**
  - `habitId` (String)
  - `status` (Enum: `done`, `skipped`, `partial`)
  - `value` (Optional: Number for quantity-based habits)
- **Outputs:** `success: boolean`, `currentStreak: integer`.

### 3. `add_task`
- **Purpose:** Create a new "Must-Do" or general task for the day.
- **Inputs:**
  - `title` (String)
  - `isMustDo` (Boolean: default true)
- **Outputs:** `taskId: string`.

### 4. `log_wellness_entry`
- **Purpose:** Log mood, energy, or hydration.
- **Inputs:**
  - `moodScore` (1-5)
  - `energyScore` (1-5)
  - `waterGlasses` (Number)
  - `dailyReflection` (String: one-sentence journal info)
- **Outputs:** `success: boolean`.

### 5. `get_history_insights`
- **Purpose:** Query past trends to answer user questions ("How have my energy levels been this week?").
- **Inputs:**
  - `module` (Enum: `habits`, `tasks`, `wellness`)
  - `days` (Integer: 7 by default)
- **Outputs:** `trendData[]`.

## Safety & Governance

- **Write Confirmation:** The AI may log activities directly, but "Destructive" actions (e.g., `delete_habit` or `delete_task`) require an explicit JSON "Confirmation Request" to the user.
- **Validation:** All inputs must pass `Zod` schemas. If a tool call fails validation, the AI notifies the user with a specific reason ("Title is too long," "Mood must be 1-5").
- **Minimal Privilege:** The AI token has limited scopes and cannot modify sensitive `user` account details.
