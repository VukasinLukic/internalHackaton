import { FastifyInstance } from 'fastify';
import { CreateUserDto, UpdateUserPreferencesDto, AnalyzeUserDto } from '../dto';
import { validateBody } from '../middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware';

export async function userRoutes(fastify: FastifyInstance) {
  // Create user
  fastify.post('/', {
    preHandler: [validateBody(CreateUserDto)]
  }, async (_request, _reply) => {
    // TODO: Legion implements controller
    return { message: 'Create user - Legion implements' };
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [authMiddleware]
  }, async (request, _reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { userId };
  });

  // Update preferences
  fastify.patch('/:id/preferences', {
    preHandler: [authMiddleware, validateBody(UpdateUserPreferencesDto)]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Update preferences - Legion implements' };
  });

  // Analyze user photos
  fastify.post('/:id/analyze', {
    preHandler: [authMiddleware, validateBody(AnalyzeUserDto)]
  }, async (_request, _reply) => {
    // TODO: Legion implements AI
    return { message: 'Analyze user - Legion implements' };
  });
}
