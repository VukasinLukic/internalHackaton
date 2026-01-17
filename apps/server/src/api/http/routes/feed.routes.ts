import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, validateQuery, AuthenticatedRequest } from '../middleware';

const FeedQueryDto = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0)
});

export async function feedRoutes(fastify: FastifyInstance) {
  // Get personalized feed
  fastify.get('/', {
    preHandler: [authMiddleware, validateQuery(FeedQueryDto)]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = request.query as z.infer<typeof FeedQueryDto>;

    // TODO: Legion implements matching algorithm
    return {
      message: 'Get feed - Legion implements',
      userId,
      limit,
      offset
    };
  });
}
