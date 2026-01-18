import { Item } from '../../domain/entities';
import { IItemRepository } from '../../repositories';

export class GetItemUseCase {
  constructor(private itemRepository: IItemRepository) {}

  async execute(itemId: string): Promise<Item> {
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }
}
