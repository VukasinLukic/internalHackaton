import { User, Item, MatchScore } from '../../domain/entities';
import { IMatchingStrategy, MatchCandidate } from './IMatchingStrategy';

export class MatchingEngine {
  constructor(private strategy: IMatchingStrategy) {}

  calculateScore(seeker: User, item: Item, provider: User): MatchScore {
    return this.strategy.calculateMatch(seeker, item, provider);
  }

  generateFeed(
    seeker: User,
    candidates: MatchCandidate[],
    limit: number = 20
  ): Array<{ candidate: MatchCandidate; score: MatchScore }> {
    return this.strategy.findBestMatches(seeker, candidates, limit);
  }
}
