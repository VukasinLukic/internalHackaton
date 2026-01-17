import { User, Item } from '../../domain/entities';
import { IUserRepository, IItemRepository, IInteractionRepository } from '../../repositories';
import { MatchingEngine } from '../matching/MatchingEngine';
import { MatchCandidate } from '../matching/IMatchingStrategy';

export interface FeedItem {
  item: Item;
  provider: User;
  score: {
    total: number;
    itemCompatibility: number;
    providerCompatibility: number;
    reasons: string[];
  };
}

export class FeedService {
  constructor(
    private userRepository: IUserRepository,
    private itemRepository: IItemRepository,
    private interactionRepository: IInteractionRepository,
    private matchingEngine: MatchingEngine
  ) {}

  async generatePersonalizedFeed(
    seekerId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FeedItem[]> {
    // 1. Get seeker profile
    const seeker = await this.userRepository.findById(seekerId);
    if (!seeker) {
      throw new Error('Seeker not found');
    }

    // 2. Get items user has already swiped on
    const swipedItemIds = await this.interactionRepository.getSwipedItemIds(seekerId);

    // 3. Find candidate items with filters
    const items = await this.itemRepository.findMany({
      status: 'active',
      excludeIds: swipedItemIds,
      city: seeker.preferences?.location.city,
      minPrice: seeker.preferences?.budget.min,
      maxPrice: seeker.preferences?.budget.max,
      limit: limit * 3, // Fetch more to account for filtering
      offset: 0
    });

    // 4. Get providers for each item
    const candidates: MatchCandidate[] = [];
    for (const item of items) {
      const provider = await this.userRepository.findById(item.providerId);
      if (provider) {
        candidates.push({ item, provider });
      }
    }

    // 5. Score and rank candidates
    const ranked = this.matchingEngine.generateFeed(seeker, candidates, limit);

    // 6. Transform to feed items
    return ranked.map(({ candidate, score }) => ({
      item: candidate.item,
      provider: candidate.provider,
      score: {
        total: score.total,
        itemCompatibility: score.itemCompatibility,
        providerCompatibility: score.providerCompatibility,
        reasons: score.reasons
      }
    }));
  }
}
