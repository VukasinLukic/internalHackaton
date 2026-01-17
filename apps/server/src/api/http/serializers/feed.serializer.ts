import { Item, User, MatchScore } from '../../../core/domain/entities';
import { DomainConfig } from '../../../config/domain.config';
import { serializeItem, SerializedItem } from './item.serializer';

export interface FeedItem {
  item: SerializedItem;
  provider: {
    id: string;
    name: string;
    image?: string;
    attributes: string[];
  };
  score: {
    total: number;
    itemCompatibility: number;
    providerCompatibility: number;
    reasons: string[];
  };
}

export function serializeFeedItem(
  item: Item,
  provider: User,
  score: MatchScore,
  config: DomainConfig
): FeedItem {
  return {
    item: serializeItem(item, config),
    provider: {
      id: provider.id,
      name: provider.name,
      image: provider.images[0],
      attributes: provider.attributes
    },
    score: {
      total: Math.round(score.total),
      itemCompatibility: Math.round(score.itemCompatibility),
      providerCompatibility: Math.round(score.providerCompatibility),
      reasons: score.reasons
    }
  };
}
