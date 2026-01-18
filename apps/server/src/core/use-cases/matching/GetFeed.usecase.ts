import { FeedService, FeedItem } from '../../services/recommendation/FeedService';

export class GetFeedUseCase {
  constructor(private feedService: FeedService) {}

  async execute(seekerId: string, limit: number = 20, offset: number = 0): Promise<FeedItem[]> {
    return this.feedService.generatePersonalizedFeed(seekerId, limit, offset);
  }
}
