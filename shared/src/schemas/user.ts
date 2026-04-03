import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      reminders: z.boolean().default(true),
    }).default({}),
  }).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userLoginSchema = userSchema.pick({
  email: true,
  password: true,
});

export const userRegisterSchema = userSchema.pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const userUpdateSchema = userSchema
  .omit({ id: true, email: true, createdAt: true, updatedAt: true })
  .partial();

export type User = z.infer<typeof userSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
