import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { SwipeInput } from '../dto';
import { AuthenticatedRequest } from '../middleware';
import { socketManager } from '../../../infrastructure/websocket';

export class InteractionController {
  async recordSwipe(
    request: FastifyRequest<{ Body: SwipeInput }>,
    reply: FastifyReply
  ) {
    const { userId } = request as AuthenticatedRequest;
    const { itemId, action } = request.body;

    const recordInteractionUseCase = container.recordInteractionUseCase;

    const result = await recordInteractionUseCase.execute(userId, itemId, action);

    // If it's a match, notify both users via socket
    if (result.match) {
      socketManager.emitNewMatch(userId, result.match);
      socketManager.emitNewMatch(result.match.providerId, result.match);
    }

    return reply.send({
      success: true,
      data: {
        interaction: result.interaction,
        match: result.match
      }
    });
  }

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const getInteractionHistoryUseCase = container.getInteractionHistoryUseCase;

    const interactions = await getInteractionHistoryUseCase.execute(userId);

    return reply.send({
      success: true,
      data: interactions
    });
  }
}

export const interactionController = new InteractionController();
