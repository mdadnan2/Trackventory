import { z } from 'zod';

export const createDistributionSchema = z.object({
  volunteerId: z.string().optional(),
  state: z.string().min(1),
  city: z.string().min(1),
  pinCode: z.string().min(1),
  area: z.string().min(1),
  campaignId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).default([]),
  packages: z.array(z.object({
    packageId: z.string(),
    quantity: z.number().min(1)
  })).default([]),
  requestId: z.string()
}).refine(data => data.items.length > 0 || data.packages.length > 0, {
  message: 'At least one item or package must be provided'
});

export const reportDamageSchema = z.object({
  volunteerId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  requestId: z.string()
});
