import { Interaction } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IInteractionRepository extends IRepository<Interaction> {
  findByUserId(userId: string): Promise<Interaction[]>;
  findByItemId(itemId: string): Promise<Interaction[]>;
  hasUserInteracted(userId: string, itemId: string): Promise<boolean>;
  getSwipedItemIds(userId: string): Promise<string[]>;
}
