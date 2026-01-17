import { FastifyInstance } from 'fastify';
import { authMiddleware, AuthenticatedRequest } from '../middleware';

export async function matchRoutes(fastify: FastifyInstance) {
  // Get user's matches
  fastify.get('/', {
    preHandler: [authMiddleware]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Get matches - Legion implements', userId };
  });

  // Accept match
  fastify.post('/:matchId/accept', {
    preHandler: [authMiddleware]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Accept match - Legion implements' };
  });

  // Reject match
  fastify.post('/:matchId/reject', {
    preHandler: [authMiddleware]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Reject match - Legion implements' };
  });
}
