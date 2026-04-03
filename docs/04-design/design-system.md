# Design System
## Unified Daily Tracker (Life-OS) — Web UI Reference

> **Version:** 2.0 | **Last updated:** March 2026

## Brand Direction (The "Obsidian Archive" Aesthetic)

- **Premium & Editorial:** High-density information presented with breathable whitespace.
- **Dark-First:** Minimalist dark mode with subtle glassmorphism and deep accent colors.
- **The "No-Line" Rule:** Rely on spacing and subtle background shifts (elevations) rather than explicit borders.

## Design Principles

1. **Mission Control:** The Dashboard is the single source of truth for Habits, Tasks, and Wellness.
2. **Sub-Second Feedback:** Every interaction (tap/chat) triggers an immediate visual "Success Glow."
3. **Tabular Precision:** Use monospaced fonts for all metrics and times to ensure scannability.
4. **Focused Context:** Time-phased UI shifts (Morning/Noon/Night) to show only what's relevant *now*.

## Theme Architecture (MERN Semantic Layer)

We use a "Deep Dark" base with vibrant highlights for different modules.

### Semantic Highlights
- `accent.habit`: `#3B82F6` (Habit Blue)
- `accent.task`: `#8B5CF6` (Task Purple)
- `accent.wellness`: `#10B981` (Wellness Green)
- `accent.assistant`: `#EC4899` (Assistant Pink)

### Dark Theme (Primary)
- `bg.app`: `#09090B` (Rich Black)
- `bg.surface`: `#18181B` (Zinc-900)
- `bg.elevated`: `#27272A` (Zinc-800)
- `text.primary`: `#FAFAFA`
- `text.secondary`: `#A1A1AA`
- `border.subtle`: `#27272A` (Used sparingly - prefer gap/elevation)

## Typography

### Font Families
- **Editorial Headings:** `Inter Tight`, `Outfit`, or `Sora` (Weight 600+)
- **Functional Body:** `Inter`, `Manrope` (Weight 400)
- **Data/Metrics:** `IBM Plex Mono` (Tabular figures)

### Type Scale
- **Display:** 40/48 (Hero metrics)
- **H1:** 32/40 (Screen titles)
- **Body L:** 18/28 (AI chat text)
- **Caption Mono:** 12/16 (Metric labels)

## App Structure (IA) — The Dashboard

### 1. Global AI Command Bar
- Fixed at the bottom or top.
- Minimal text input for "Multi-modal logging."
- Subtle glow animations when parsing.

### 2. Today's "All-in-One" Board
- **Must-Do Tasks:** Focused 3-task limit view.
- **Active Habits:** Current day's routine icons/rows.
- **Wellness Pulse:** Current Mood/Energy/Hydration status.

### 3. Progressive Metrics
- **7-Day Consistency:** Progress ring or sparkline.
- **Streak Status:** Compact badges with best-streak markers.

## Core Components

- `AIAssistantBar`: The multi-modal entry point.
- `UnifiedChecklistRow`: Polymorphic row for both Habits and Tasks.
- `WellnessMetricWidget`: Minimalist card for mood/energy tracking.
- `InsightCorrelationCard`: AI-driven text card with sparkline visualization.
- `GlassButton`: Primary action buttons with `backdrop-blur-md`.

## Motion & Interaction

- **Dashboard Shift:** 300ms ease-in-out transition when the UI updates from "Morning" to "Evening" mode.
- **Success Glow:** 400ms CSS pulse on a widget after a successful AI log.
- **Chat Streaming:** Smooth, character-by-character "type-in" effect for AI responses.
