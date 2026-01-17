import { Item, ItemStatus, ItemLocation } from '../../../../core/domain/entities';

interface Neo4jItemNode {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  size?: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  images: string[];
  attributes: string[];
  vibes: string[];
  status: string;
  createdAt: { toString(): string };
  updatedAt: { toString(): string };
}

export class ItemMapper {
  static toDomain(node: Neo4jItemNode): Item {
    return {
      id: node.id,
      providerId: node.providerId,
      title: node.title,
      description: node.description,
      price: typeof node.price === 'object' ? (node.price as any).toNumber() : node.price,
      size: node.size,
      location: {
        address: node.address,
        city: node.city,
        lat: typeof node.lat === 'object' ? (node.lat as any).toNumber() : node.lat,
        lng: typeof node.lng === 'object' ? (node.lng as any).toNumber() : node.lng
      },
      images: node.images || [],
      attributes: node.attributes || [],
      vibes: node.vibes || [],
      status: node.status as ItemStatus,
      createdAt: new Date(node.createdAt.toString()),
      updatedAt: new Date(node.updatedAt.toString())
    };
  }

  static toNeo4j(item: Partial<Item>): Record<string, any> {
    return {
      id: item.id,
      providerId: item.providerId,
      title: item.title,
      description: item.description,
      price: item.price,
      size: item.size,
      address: item.location?.address,
      city: item.location?.city,
      lat: item.location?.lat,
      lng: item.location?.lng,
      images: item.images || [],
      attributes: item.attributes || [],
      vibes: item.vibes || [],
      status: item.status || 'active'
    };
  }
}
