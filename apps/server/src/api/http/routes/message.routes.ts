import { FastifyInstance } from 'fastify';
import { SendMessageDto } from '../dto';
import { validateBody, authMiddleware } from '../middleware';
import { messageController } from '../controllers';

export async function messageRoutes(fastify: FastifyInstance) {
  // Send message
  fastify.post<{
    Body: any;
  }>('/', {
    preHandler: [authMiddleware, validateBody(SendMessageDto)]
  }, messageController.sendMessage.bind(messageController));

  // Get conversation
  fastify.get<{
    Params: { matchId: string };
    Querystring: { limit?: number; offset?: number };
  }>('/:matchId', {
    preHandler: [authMiddleware]
  }, messageController.getMessages.bind(messageController));

  // Mark message as read
  fastify.patch<{
    Params: { messageId: string };
  }>('/:messageId/read', {
    preHandler: [authMiddleware]
  }, messageController.markAsRead.bind(messageController));
}
