import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1)
});

export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1).optional(),
  isActive: z.boolean().optional()
});

export const assignPackageSchema = z.object({
  packageId: z.string(),
  volunteerId: z.string(),
  quantity: z.number().int().min(1),
  requestId: z.string().uuid()
});

export const distributePackageSchema = z.object({
  packageId: z.string(),
  quantity: z.number().int().min(1),
  distributionDate: z.string().datetime(),
  location: z.object({
    cityId: z.string(),
    areaId: z.string(),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }),
  beneficiaryInfo: z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    familySize: z.number().int().positive().optional(),
    idProof: z.string().optional()
  }),
  campaignId: z.string().optional(),
  requestId: z.string().uuid()
});
