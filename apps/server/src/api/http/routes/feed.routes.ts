import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, validateQuery } from '../middleware';
import { feedController } from '../controllers';

const FeedQueryDto = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0)
});

export async function feedRoutes(fastify: FastifyInstance) {
  // Get personalized feed
  fastify.get<{
    Querystring: { limit?: number; offset?: number };
  }>('/', {
    preHandler: [authMiddleware, validateQuery(FeedQueryDto)]
  }, feedController.getFeed.bind(feedController));
}
