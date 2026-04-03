import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).default('todo'),
  dueDate: z.string().datetime().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1).max(200),
    completed: z.boolean().default(false),
  })).default([]),
  linkedHabits: z.array(z.string()).default([]),
  linkedJournal: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const taskCreateSchema = taskSchema.omit({
  id: true,
  userId: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const taskUpdateSchema = taskCreateSchema.partial();

export type Task = z.infer<typeof taskSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
