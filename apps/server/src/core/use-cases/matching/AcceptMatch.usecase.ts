import { Match } from '../../domain/entities';
import { IMatchRepository } from '../../repositories';

export class AcceptMatchUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(matchId: string, providerId: string): Promise<Match> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.providerId !== providerId) {
      throw new Error('Only the provider can accept this match');
    }

    if (match.status !== 'pending') {
      throw new Error('Match is not pending');
    }

    return this.matchRepository.updateStatus(matchId, 'accepted');
  }
}
