# Frontend Handoff
## Theme, Fonts, and App Structure Implementation

> **Version:** 1.0 | **Last updated:** March 2026

## Files to Use

- `docs/04-design/theme-tokens.css`
- `docs/04-design/tailwind-theme-snippet.ts`

## Implementation Steps

1. Import `theme-tokens.css` in your global stylesheet entry.
2. Add the Tailwind theme extension from `tailwind-theme-snippet.ts`.
3. Set `<html data-theme="light">` by default.
4. Implement a theme toggle in the top bar:
   - `light -> dark`
   - persist in local storage
5. On app bootstrap, hydrate theme from local storage.

## Font Loading

Preferred web font loading:

- Sora (headings)
- Source Sans 3 (body)
- IBM Plex Mono (metrics)

Use `font-display: swap` and preload only the weights in use.

## App Shell Structure

- Header: date, theme toggle, quick add
- Primary content: today checklist
- Secondary content: progress cards, reminders, insights
- Navigation tabs: Home, Habits, Reminders, Insights, Settings

## Accessibility Checklist

- Contrast meets WCAG 2.2 AA in both themes
- Focus-visible ring shown on all controls
- Keyboard navigation supports all major actions
- Minimum hit target 48x48 for interactive controls

## QA Notes

- Verify no layout shift when switching themes
- Verify all metrics use monospaced numeric font
- Verify dark theme card borders remain distinguishable

