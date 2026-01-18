import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { SendMessageInput } from '../dto';
import { AuthenticatedRequest } from '../middleware';
import { socketManager } from '../../../infrastructure/websocket';

export class MessageController {
  async sendMessage(
    request: FastifyRequest<{ Body: SendMessageInput }>,
    reply: FastifyReply
  ) {
    const { userId } = request as AuthenticatedRequest;
    const { matchId, content } = request.body;

    const messageRepository = container.messageRepository;

    const message = await messageRepository.create({
      matchId,
      senderId: userId,
      content,
      createdAt: new Date()
    });

    // Emit message via Socket.io
    socketManager.emitNewMessage(matchId, message);

    return reply.status(201).send({
      success: true,
      data: message
    });
  }

  async getMessages(
    request: FastifyRequest<{
      Params: { matchId: string };
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply
  ) {
    const { matchId } = request.params;
    const { limit = 50, offset = 0 } = request.query;

    const messageRepository = container.messageRepository;

    const messages = await messageRepository.findByMatchId(matchId, limit, offset);

    return reply.send({
      success: true,
      data: messages,
      meta: {
        limit,
        offset,
        count: messages.length
      }
    });
  }

  async markAsRead(
    request: FastifyRequest<{ Params: { messageId: string } }>,
    reply: FastifyReply
  ) {
    const { messageId } = request.params;
    const { userId } = request as AuthenticatedRequest;

    const messageRepository = container.messageRepository;

    const message = await messageRepository.markAsRead(messageId);

    // Notify sender via socket
    if (message.matchId) {
      socketManager.emitMessageRead(message.matchId, messageId, userId);
    }

    return reply.send({
      success: true,
      data: message
    });
  }
}

export const messageController = new MessageController();
