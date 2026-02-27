import { z } from 'zod';

export const addStockSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1)
});

export const assignStockSchema = z.object({
  volunteerId: z.string(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1)
});

export const returnStockSchema = z.object({
  volunteerId: z.string(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  notes: z.string().optional()
});

export const transferStockSchema = z.object({
  fromVolunteerId: z.string(),
  toVolunteerId: z.string(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  notes: z.string().optional()
});

export const selfAssignStockSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  notes: z.string().optional()
});
