import { Message } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IMessageRepository extends IRepository<Message> {
  findByMatchId(matchId: string, limit?: number, offset?: number): Promise<Message[]>;
  markAsRead(messageId: string): Promise<Message>;
  getUnreadCount(userId: string): Promise<number>;
}
