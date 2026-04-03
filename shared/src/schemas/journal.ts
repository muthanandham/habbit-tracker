import { z } from 'zod';

export const journalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
  mood: z.number().min(1).max(10).optional(),
  tags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(true),
  linkedHabits: z.array(z.string()).default([]),
  linkedTasks: z.array(z.string()).default([]),
  aiSummary: z.string().max(500).optional(),
  aiInsights: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const journalCreateSchema = journalSchema.omit({
  id: true,
  userId: true,
  aiSummary: true,
  aiInsights: true,
  createdAt: true,
  updatedAt: true,
});

export const journalUpdateSchema = journalCreateSchema.partial();

export type Journal = z.infer<typeof journalSchema>;
export type JournalCreate = z.infer<typeof journalCreateSchema>;
export type JournalUpdate = z.infer<typeof journalUpdateSchema>;
