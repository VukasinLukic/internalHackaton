import { Match, MatchStatus } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IMatchRepository extends IRepository<Match> {
  findBySeekerId(seekerId: string): Promise<Match[]>;
  findByProviderId(providerId: string): Promise<Match[]>;
  findByUserIds(seekerId: string, providerId: string, itemId: string): Promise<Match | null>;
  updateStatus(id: string, status: MatchStatus): Promise<Match>;
}
