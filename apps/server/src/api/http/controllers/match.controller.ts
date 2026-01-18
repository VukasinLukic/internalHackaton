import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { AuthenticatedRequest } from '../middleware';
import { socketManager } from '../../../infrastructure/websocket';

export class MatchController {
  async getMatches(request: FastifyRequest, reply: FastifyReply) {
    const { userId, userRole } = request as AuthenticatedRequest;
    const getMatchesUseCase = container.getMatchesUseCase;

    const matches = await getMatchesUseCase.execute(userId, userRole as 'provider' | 'seeker');

    return reply.send({
      success: true,
      data: matches
    });
  }

  async acceptMatch(
    request: FastifyRequest<{ Params: { matchId: string } }>,
    reply: FastifyReply
  ) {
    const { matchId } = request.params;
    const { userId } = request as AuthenticatedRequest;
    const acceptMatchUseCase = container.acceptMatchUseCase;

    const match = await acceptMatchUseCase.execute(matchId, userId);

    // Notify both users via socket
    socketManager.emitMatchStatusUpdate(matchId, 'accepted', match);

    return reply.send({
      success: true,
      data: match
    });
  }

  async rejectMatch(
    request: FastifyRequest<{ Params: { matchId: string } }>,
    reply: FastifyReply
  ) {
    const { matchId } = request.params;
    const matchRepository = container.matchRepository;

    const match = await matchRepository.updateStatus(matchId, 'rejected');

    // Notify both users via socket
    socketManager.emitMatchStatusUpdate(matchId, 'rejected', match);

    return reply.send({
      success: true,
      data: match
    });
  }
}

export const matchController = new MatchController();
