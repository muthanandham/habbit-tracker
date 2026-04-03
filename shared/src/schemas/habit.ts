import { z } from 'zod';

export const habitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['health', 'fitness', 'mindfulness', 'productivity', 'learning', 'social', 'creative', 'other']).default('other'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetDays: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  targetCount: z.number().int().positive().default(1),
  unit: z.string().optional(),
  reminder: z.object({
    enabled: z.boolean().default(false),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }).default({}),
  streak: z.object({
    current: z.number().int().min(0).default(0),
    best: z.number().int().min(0).default(0),
    lastCompletedDate: z.string().datetime().optional(),
  }).default({}),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  archived: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const habitCompletionSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean().default(true),
  count: z.number().int().positive().default(1),
  notes: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});

export const habitCreateSchema = habitSchema.omit({
  id: true,
  userId: true,
  streak: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
});

export const habitUpdateSchema = habitCreateSchema.partial();

export type Habit = z.infer<typeof habitSchema>;
export type HabitCompletion = z.infer<typeof habitCompletionSchema>;
export type HabitCreate = z.infer<typeof habitCreateSchema>;
export type HabitUpdate = z.infer<typeof habitUpdateSchema>;
