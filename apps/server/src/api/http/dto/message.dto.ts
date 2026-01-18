import { z } from 'zod';

export const SendMessageDto = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1).max(2000)
});

export type SendMessageInput = z.infer<typeof SendMessageDto>;
