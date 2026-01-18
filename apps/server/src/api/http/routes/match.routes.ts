import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware';
import { matchController } from '../controllers';

export async function matchRoutes(fastify: FastifyInstance) {
  // Get user's matches
  fastify.get('/', {
    preHandler: [authMiddleware]
  }, matchController.getMatches.bind(matchController));

  // Accept match
  fastify.post<{
    Params: { matchId: string };
  }>('/:matchId/accept', {
    preHandler: [authMiddleware]
  }, matchController.acceptMatch.bind(matchController));

  // Reject match
  fastify.post<{
    Params: { matchId: string };
  }>('/:matchId/reject', {
    preHandler: [authMiddleware]
  }, matchController.rejectMatch.bind(matchController));
}
