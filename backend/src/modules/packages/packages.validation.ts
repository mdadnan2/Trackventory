import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(1),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1)
});

export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1).optional(),
  isActive: z.boolean().optional()
});
