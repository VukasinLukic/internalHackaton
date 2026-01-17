import { Item, ItemStatus } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface FindItemsOptions {
  status?: ItemStatus;
  providerId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: string[];
  excludeIds?: string[];
  limit?: number;
  offset?: number;
}

export interface IItemRepository extends IRepository<Item> {
  findByProviderId(providerId: string): Promise<Item[]>;
  findMany(options: FindItemsOptions): Promise<Item[]>;
  addAttributes(id: string, attributes: string[], vibes: string[]): Promise<Item>;
  updateStatus(id: string, status: ItemStatus): Promise<Item>;
}
