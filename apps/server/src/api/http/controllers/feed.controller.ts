import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { AuthenticatedRequest } from '../middleware';
import { serializeFeedItem } from '../serializers';

export class FeedController {
  async getFeed(
    request: FastifyRequest<{
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply
  ) {
    const { userId } = request as AuthenticatedRequest;
    const { limit = 20, offset = 0 } = request.query;

    const getFeedUseCase = container.getFeedUseCase;
    const domainConfig = container.domainConfig;

    const feedItems = await getFeedUseCase.execute(userId, limit, offset);

    // Serialize feed items with domain-specific labels
    const serialized = feedItems.map((feedItem) =>
      serializeFeedItem(feedItem.item, feedItem.provider, feedItem.score, domainConfig)
    );

    return reply.send({
      success: true,
      data: serialized,
      meta: {
        limit,
        offset,
        count: serialized.length
      }
    });
  }
}

export const feedController = new FeedController();
