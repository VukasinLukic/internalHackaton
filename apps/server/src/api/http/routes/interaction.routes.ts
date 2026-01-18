import { FastifyInstance } from 'fastify';
import { SwipeDto } from '../dto';
import { validateBody, authMiddleware } from '../middleware';
import { interactionController } from '../controllers';

export async function interactionRoutes(fastify: FastifyInstance) {
  // Record swipe
  fastify.post<{
    Body: any;
  }>('/swipe', {
    preHandler: [authMiddleware, validateBody(SwipeDto)]
  }, interactionController.recordSwipe.bind(interactionController));

  // Get swipe history
  fastify.get('/history', {
    preHandler: [authMiddleware]
  }, interactionController.getHistory.bind(interactionController));
}
