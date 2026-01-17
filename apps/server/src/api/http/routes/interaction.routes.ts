import { FastifyInstance } from 'fastify';
import { SwipeDto } from '../dto';
import { validateBody, authMiddleware, AuthenticatedRequest } from '../middleware';

export async function interactionRoutes(fastify: FastifyInstance) {
  // Record swipe
  fastify.post('/swipe', {
    preHandler: [authMiddleware, validateBody(SwipeDto)]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Swipe - Legion implements', userId };
  });

  // Get swipe history
  fastify.get('/history', {
    preHandler: [authMiddleware]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'History - Legion implements', userId };
  });
}
