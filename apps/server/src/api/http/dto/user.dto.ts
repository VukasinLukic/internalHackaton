import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['provider', 'seeker']),
  clerkId: z.string().optional(),
  bio: z.string().max(500).optional(),
  images: z.array(z.string().url()).max(5).optional()
});

export const UpdateUserPreferencesDto = z.object({
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.max >= data.min, {
    message: 'Max budget must be >= min budget'
  }),
  location: z.object({
    city: z.string(),
    radius: z.number().min(1).max(50),
    lat: z.number().optional(),
    lng: z.number().optional()
  }),
  moveInDate: z.string().datetime().optional(),
  lifestyle: z.object({
    smoker: z.boolean(),
    pets: z.boolean(),
    earlyBird: z.boolean(),
    cleanliness: z.number().min(1).max(5)
  })
});

export const AnalyzeUserDto = z.object({
  images: z.array(z.string().url()).min(1).max(5),
  bio: z.string().optional()
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesDto>;
export type AnalyzeUserInput = z.infer<typeof AnalyzeUserDto>;
