import { z } from 'zod';

export const wellnessSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleep: z.object({
    bedtime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    wakeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    duration: z.number().positive().optional(),
    quality: z.number().min(1).max(10).optional(),
  }).default({}),
  mood: z.object({
    score: z.number().min(1).max(10),
    emotions: z.array(z.string()).default([]),
    notes: z.string().max(500).optional(),
  }),
  energy: z.object({
    morning: z.number().min(1).max(10).optional(),
    afternoon: z.number().min(1).max(10).optional(),
    evening: z.number().min(1).max(10).optional(),
  }).default({}),
  exercise: z.object({
    type: z.string().optional(),
    duration: z.number().int().positive().optional(),
    intensity: z.enum(['low', 'moderate', 'high']).optional(),
    caloriesBurned: z.number().int().positive().optional(),
  }).default({}),
  nutrition: z.object({
    waterIntake: z.number().int().positive().optional(),
    meals: z.array(z.object({
      type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      notes: z.string().max(200).optional(),
    })).default([]),
  }).default({}),
  notes: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const wellnessCreateSchema = wellnessSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const wellnessUpdateSchema = wellnessCreateSchema.partial();

export type Wellness = z.infer<typeof wellnessSchema>;
export type WellnessCreate = z.infer<typeof wellnessCreateSchema>;
export type WellnessUpdate = z.infer<typeof wellnessUpdateSchema>;
