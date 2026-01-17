import { z } from 'zod';

export const CreateItemDto = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0),
  size: z.number().min(0).optional(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  images: z.array(z.string().url()).min(1).max(10)
});

export const UpdateItemDto = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  size: z.number().min(0).optional(),
  status: z.enum(['active', 'rented', 'removed']).optional()
});

export type CreateItemInput = z.infer<typeof CreateItemDto>;
export type UpdateItemInput = z.infer<typeof UpdateItemDto>;
