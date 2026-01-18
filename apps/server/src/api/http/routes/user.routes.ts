import { FastifyInstance } from 'fastify';
import { CreateUserDto, UpdateUserPreferencesDto, AnalyzeUserDto } from '../dto';
import { validateBody, authMiddleware } from '../middleware';
import { userController } from '../controllers';

export async function userRoutes(fastify: FastifyInstance) {
  // Create user
  fastify.post<{
    Body: any;
  }>('/', {
    preHandler: [validateBody(CreateUserDto)]
  }, userController.createUser.bind(userController));

  // Get current user
  fastify.get('/me', {
    preHandler: [authMiddleware]
  }, userController.getMe.bind(userController));

  // Update preferences
  fastify.patch<{
    Params: { id: string };
    Body: any;
  }>('/:id/preferences', {
    preHandler: [authMiddleware, validateBody(UpdateUserPreferencesDto)]
  }, userController.updatePreferences.bind(userController));

  // Analyze user photos
  fastify.post<{
    Params: { id: string };
    Body: any;
  }>('/:id/analyze', {
    preHandler: [authMiddleware, validateBody(AnalyzeUserDto)]
  }, userController.analyzeUser.bind(userController));
}
