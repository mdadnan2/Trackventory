import { z } from 'zod';

export const createUserSchema = z.object({
  firebaseUid: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'VOLUNTEER'])
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'BLOCKED']).optional()
});
