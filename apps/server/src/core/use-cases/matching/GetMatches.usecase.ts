import { Match } from '../../domain/entities';
import { IMatchRepository } from '../../repositories';

export class GetMatchesUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(userId: string, role: 'seeker' | 'provider'): Promise<Match[]> {
    if (role === 'seeker') {
      return this.matchRepository.findBySeekerId(userId);
    } else {
      return this.matchRepository.findByProviderId(userId);
    }
  }
}
