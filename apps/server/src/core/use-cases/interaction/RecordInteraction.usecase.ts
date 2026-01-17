import { v4 as uuidv4 } from 'uuid';
import { Interaction, Match, InteractionType } from '../../domain/entities';
import { IInteractionRepository, IItemRepository, IMatchRepository, IUserRepository } from '../../repositories';
import { MatchingEngine } from '../../services/matching/MatchingEngine';

export interface RecordInteractionResult {
  interaction: Interaction;
  match?: Match;
}

export class RecordInteractionUseCase {
  constructor(
    private interactionRepository: IInteractionRepository,
    private itemRepository: IItemRepository,
    private userRepository: IUserRepository,
    private matchRepository: IMatchRepository,
    private matchingEngine: MatchingEngine
  ) {}

  async execute(
    userId: string,
    itemId: string,
    action: InteractionType
  ): Promise<RecordInteractionResult> {
    // 1. Check if already interacted
    const hasInteracted = await this.interactionRepository.hasUserInteracted(userId, itemId);
    if (hasInteracted) {
      throw new Error('Already swiped on this item');
    }

    // 2. Get item and verify it exists
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // 3. Create interaction
    const interaction = await this.interactionRepository.create({
      id: uuidv4(),
      userId,
      itemId,
      type: action
    });

    // 4. If like/super_like, check for match creation
    let match: Match | undefined;
    if (action === 'like' || action === 'super_like') {
      const seeker = await this.userRepository.findById(userId);
      const provider = await this.userRepository.findById(item.providerId);

      if (seeker && provider) {
        // Calculate match score
        const score = this.matchingEngine.calculateScore(seeker, item, provider);

        // Create match (pending provider approval)
        match = await this.matchRepository.create({
          id: uuidv4(),
          seekerId: userId,
          providerId: item.providerId,
          itemId,
          score,
          status: 'pending'
        });
      }
    }

    return { interaction, match };
  }
}
