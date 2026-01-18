import { v4 as uuidv4 } from 'uuid';
import { Item } from '../../domain/entities';
import { IItemRepository, IUserRepository } from '../../repositories';
import { VisionService } from '../../services/vision/VisionService';
import { CreateItemInput } from '../../../api/http/dto';

export class CreateItemUseCase {
  constructor(
    private itemRepository: IItemRepository,
    private userRepository: IUserRepository,
    private visionService: VisionService
  ) {}

  async execute(providerId: string, input: CreateItemInput): Promise<Item> {
    // 1. Verify provider exists
    const provider = await this.userRepository.findById(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }
    if (provider.role !== 'provider') {
      throw new Error('Only providers can create items');
    }

    // 2. Analyze images with AI
    const analysis = await this.visionService.analyzeItem(input.images);

    // 3. Create item
    const item = await this.itemRepository.create({
      id: uuidv4(),
      providerId,
      title: input.title,
      description: input.description,
      price: input.price,
      size: input.size,
      location: input.location,
      images: input.images,
      attributes: analysis.attributes,
      vibes: analysis.vibes,
      status: 'active'
    });

    // 4. Link attributes in graph
    await this.itemRepository.addAttributes(item.id, analysis.attributes, analysis.vibes);

    return item;
  }
}
