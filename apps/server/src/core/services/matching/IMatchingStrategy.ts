import { User, Item, MatchScore } from '../../domain/entities';

export interface MatchCandidate {
  item: Item;
  provider: User;
}

export interface IMatchingStrategy {
  calculateMatch(seeker: User, item: Item, provider: User): MatchScore;
  findBestMatches(seeker: User, candidates: MatchCandidate[], limit: number): Array<{
    candidate: MatchCandidate;
    score: MatchScore;
  }>;
}
