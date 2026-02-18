import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'VOLUNTEER']).default('VOLUNTEER')
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'BLOCKED']).optional()
});
