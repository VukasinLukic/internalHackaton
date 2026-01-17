import { FastifyInstance } from 'fastify';
import { SendMessageDto } from '../dto';
import { validateBody, authMiddleware, AuthenticatedRequest } from '../middleware';

export async function messageRoutes(fastify: FastifyInstance) {
  // Send message
  fastify.post('/', {
    preHandler: [authMiddleware, validateBody(SendMessageDto)]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Send message - Legion implements', userId };
  });

  // Get conversation
  fastify.get('/:matchId', {
    preHandler: [authMiddleware]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Get messages - Legion implements' };
  });
}
