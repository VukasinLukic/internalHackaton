import { Item } from '../../../core/domain/entities';
import { DomainConfig } from '../../../config/domain.config';

export interface SerializedItem {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  size?: number;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  attributes: string[];
  vibes: string[];
  status: string;
  createdAt: string;
  _type: string; // "Apartment" based on domain config
}

export function serializeItem(item: Item, config: DomainConfig): SerializedItem {
  return {
    id: item.id,
    providerId: item.providerId,
    title: item.title,
    description: item.description,
    price: item.price,
    size: item.size,
    location: {
      address: item.location.address,
      city: item.location.city,
      coordinates: { lat: item.location.lat, lng: item.location.lng }
    },
    images: item.images,
    attributes: item.attributes,
    vibes: item.vibes,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    _type: config.labels.item.singular
  };
}

export function serializeItems(items: Item[], config: DomainConfig): SerializedItem[] {
  return items.map(item => serializeItem(item, config));
}
