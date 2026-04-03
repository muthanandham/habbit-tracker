# UI/UX Implementation Plan v2
## Habbit Tracker Web Application

> Version: 2.0 | Date: March 29, 2026

## Goal
Elevate the current product UI to a production-grade, accessibility-first, mobile-resilient experience while preserving the existing feature scope.

## Guiding References
- `ui-ux-pro-max` design-system + UX rules
- Existing project docs in `docs/04-design/`

## Target Design Direction
- Style: Flat / clean productivity UI with minimal visual noise
- Typography: Plus Jakarta Sans + IBM Plex Mono for metrics
- Theme behavior: persistent light/dark without layout shift
- Interaction model: touch-first controls (44px+), clear active/disabled/focus states

## Scope
### In Scope
- Structure, spacing, alignment, hierarchy
- Button hierarchy and placement consistency
- Color/token refinements and contrast improvements
- Responsive behavior (375, 768, 1024, 1440)
- Form UX and feedback consistency

### Out of Scope
- New backend features
- Brand rewrite beyond UI token and component level
- New product modules not defined in PRD

## Workstreams

### WS-1 Accessibility (Critical)
1. Ensure visible focus ring on every interactive element
2. Maintain minimum 44x44 touch targets
3. Keep semantic elements for nav, forms, and buttons
4. Validate color contrast >= 4.5:1 for text

**Acceptance Criteria**
- Keyboard-only flow works for auth, setup, checklist, reminder actions
- No icon-only control without label/title/aria

### WS-2 Interaction & Buttons (Critical)
1. Standardize button variants: `primary`, `ghost`, `danger`
2. Consistent placement:
   - Primary action right side in section headers
   - Destructive actions isolated from primary save actions
3. Add active and disabled visual states

**Acceptance Criteria**
- All major screens use consistent button hierarchy
- Disabled/loading interactions are visually clear

### WS-3 Layout & Responsiveness (High)
1. Normalize section spacing and panel rhythm on 4px scale
2. Keep top bar, tabs, forms, and cards legible on mobile
3. Prevent horizontal overflow and cramped action groups

**Acceptance Criteria**
- No horizontal scroll at 375px viewport
- Forms collapse to 1-column on mobile

### WS-4 Theme & Typography (Medium)
1. Adopt improved typography pairings for clarity and modern tone
2. Refine accent usage for stronger action affordance
3. Keep metric typography monospaced for quick scanning

**Acceptance Criteria**
- Theme remains stable during toggle (no content jump)
- Visual hierarchy remains clear in both light and dark

### WS-5 Motion & Performance (Medium)
1. Keep transitions in 150-300ms range
2. Respect `prefers-reduced-motion`
3. Avoid layout-shifting hover animations

**Acceptance Criteria**
- No non-essential infinite animations
- Reduced-motion users receive minimal motion

## Execution Plan

### Phase 1 (Completed in current pass)
- Base theme/token refinement
- Button hierarchy upgrades across screens
- Touch/active/disabled state polish
- Responsive and spacing improvements in global styles

### Phase 2 (Completed)
- Added skeleton loading states to checklist/reminders/insights
- Introduced icon set consistency (SVG-only)
- Added fine-grained validation/error messaging patterns per form field

### Phase 3 (Completed)
- Manual QA across breakpoints and themes
- Accessibility pass (keyboard and focus checks)
- UX signoff checklist against docs and `ui-ux-pro-max`

## QA Checklist
- [x] 375px mobile usability pass
- [x] 768px tablet layout pass
- [x] 1024px desktop layout pass
- [x] Light/dark contrast check
- [x] Keyboard navigation + focus visibility
- [x] Button hierarchy consistency

## File-Level Implementation Map
- Theme tokens: `src/styles/tokens.css`
- Global layout and interaction styles: `src/styles/global.css`
- Primary shell/navigation: `src/components/AppShell.tsx`, `src/components/TopBar.tsx`, `src/components/NavTabs.tsx`
- Screen implementation: `src/screens/*`
- App orchestration and flow control: `src/App.tsx`
