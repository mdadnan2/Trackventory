import { z } from 'zod';

export const createDistributionSchema = z.object({
  state: z.string().min(1),
  city: z.string().min(1),
  pinCode: z.string().min(1),
  area: z.string().min(1),
  campaignId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  requestId: z.string()
});

export const reportDamageSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  requestId: z.string()
});
