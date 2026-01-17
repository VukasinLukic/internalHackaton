import { z } from 'zod';

export const SwipeDto = z.object({
  itemId: z.string().uuid(),
  action: z.enum(['like', 'dislike', 'super_like'])
});

export type SwipeInput = z.infer<typeof SwipeDto>;
