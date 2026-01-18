import { User, UserRole, UserPreferences } from '../../../../core/domain/entities';

interface Neo4jUserNode {
  id: string;
  clerkId?: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  images: string[];
  attributes: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredCity?: string;
  searchRadius?: number;
  preferredLat?: number;
  preferredLng?: number;
  moveInDate?: string;
  smoker?: boolean;
  pets?: boolean;
  earlyBird?: boolean;
  cleanliness?: number;
  createdAt: { toString(): string };
  updatedAt: { toString(): string };
}

export class UserMapper {
  static toDomain(node: Neo4jUserNode): User {
    const preferences: UserPreferences | undefined =
      node.budgetMin !== undefined
        ? {
            budget: { min: node.budgetMin, max: node.budgetMax || node.budgetMin },
            location: {
              city: node.preferredCity || '',
              radius: node.searchRadius || 10,
              lat: node.preferredLat,
              lng: node.preferredLng
            },
            moveInDate: node.moveInDate,
            lifestyle: {
              smoker: node.smoker || false,
              pets: node.pets || false,
              earlyBird: node.earlyBird || false,
              cleanliness: node.cleanliness || 3
            }
          }
        : undefined;

    return {
      id: node.id,
      clerkId: node.clerkId,
      email: node.email,
      name: node.name,
      role: node.role as UserRole,
      bio: node.bio,
      images: node.images || [],
      attributes: node.attributes || [],
      preferences,
      createdAt: new Date(node.createdAt.toString()),
      updatedAt: new Date(node.updatedAt.toString())
    };
  }

  static toNeo4j(user: Partial<User>): Record<string, any> {
    const params: Record<string, any> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio || '',
      images: user.images || [],
      attributes: user.attributes || [],
      clerkId: user.clerkId || null
    };

    if (user.preferences) {
      params.budgetMin = user.preferences.budget.min;
      params.budgetMax = user.preferences.budget.max;
      params.preferredCity = user.preferences.location.city;
      params.searchRadius = user.preferences.location.radius;
      params.preferredLat = user.preferences.location.lat;
      params.preferredLng = user.preferences.location.lng;
      params.moveInDate = user.preferences.moveInDate;
      params.smoker = user.preferences.lifestyle.smoker;
      params.pets = user.preferences.lifestyle.pets;
      params.earlyBird = user.preferences.lifestyle.earlyBird;
      params.cleanliness = user.preferences.lifestyle.cleanliness;
    }

    return params;
  }
}
