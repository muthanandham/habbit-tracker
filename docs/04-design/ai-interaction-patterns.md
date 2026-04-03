# AI Interaction Patterns
## Unified Daily Tracker (Life-OS) — AI UX

> **Version:** 2.0 | **Last updated:** March 2026

## Core UX Rules

- **AI is the "Fast Lane":** It handles multi-module logging in one sentence, but manual dashboard controls remain 100% functional.
- **Micro-Validation:** Every AI action (Log Water, Complete Task) is immediately visible on the dashboard with a "Success Glow."
- **One Task at a Time:** If the AI is unsure, it asks a single clarifying question ("Did you mean the Project-X task or the Project-Y one?") rather than guessing.

## The "Command Bar" Pattern (Universal Entry)
- **Input:** A global search-like bar labeled "What's up for today?"
- **Behavior:** Parses inputs like "Add task: Call Mom," "Did 100 pushups," or "Mood is 5/5."
- **Direct Update:** The dashboard modules (Habits/Tasks/Wellness) update instantly via React state after the AI parses the command.

## The "Nudge & Feedback" Pattern
- **Feedback:** "Logged 500ml of water. Total today: 1.5L. Great job!"
- **Nudge:** "Your energy is low today. Should we move 'Workout' to tomorrow and focus on 'Email Cleanup'?" (AI suggests re-planning based on wellness).

## The "Reflection" Pattern
- **Morning:** "Welcome back! You have 3 'Must-Do' tasks. Which one are we tackling first?"
- **Evening:** "You're 88% consistent today. How are you feeling after finishing that big task?" (Prompt for Wellness Logging).

## Transparency & Control
- **"Logged via AI" Tag:** Every entry made through chat is marked in the history to allow auditing.
- **Undo Path:** A 5-second "Undo Log" button appears after every AI-driven dashboard update.
- **AI "Confidence" Check:** If confidence is < 70%, the AI creates a "Draft Entry" that the user must tap to confirm.
