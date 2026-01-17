import { v4 as uuidv4 } from 'uuid';
import { User, UserPreferences } from '../../../../core/domain/entities';
import { IUserRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { UserMapper } from '../mappers';

export class Neo4jUserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const result = await neo4jConnection.executeQuery<{ u: any }>(
      `MATCH (u:User {id: $id}) RETURN u`,
      { id }
    );
    return result[0] ? UserMapper.toDomain(result[0].u.properties) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await neo4jConnection.executeQuery<{ u: any }>(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );
    return result[0] ? UserMapper.toDomain(result[0].u.properties) : null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await neo4jConnection.executeQuery<{ u: any }>(
      `MATCH (u:User {clerkId: $clerkId}) RETURN u`,
      { clerkId }
    );
    return result[0] ? UserMapper.toDomain(result[0].u.properties) : null;
  }

  async create(data: Partial<User>): Promise<User> {
    const id = data.id || uuidv4();
    const params = UserMapper.toNeo4j({ ...data, id });

    const result = await neo4jConnection.executeWrite<{ u: any }>(
      `CREATE (u:User {
        id: $id,
        email: $email,
        name: $name,
        role: $role,
        bio: $bio,
        images: $images,
        attributes: $attributes,
        clerkId: $clerkId,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN u`,
      params
    );

    return UserMapper.toDomain(result[0].u.properties);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const setClauses: string[] = ['u.updatedAt = datetime()'];
    const params: Record<string, any> = { id };

    if (data.name) {
      setClauses.push('u.name = $name');
      params.name = data.name;
    }
    if (data.bio !== undefined) {
      setClauses.push('u.bio = $bio');
      params.bio = data.bio;
    }
    if (data.images) {
      setClauses.push('u.images = $images');
      params.images = data.images;
    }
    if (data.attributes) {
      setClauses.push('u.attributes = $attributes');
      params.attributes = data.attributes;
    }

    const result = await neo4jConnection.executeWrite<{ u: any }>(
      `MATCH (u:User {id: $id})
       SET ${setClauses.join(', ')}
       RETURN u`,
      params
    );

    return UserMapper.toDomain(result[0].u.properties);
  }

  async updatePreferences(id: string, preferences: UserPreferences): Promise<User> {
    const result = await neo4jConnection.executeWrite<{ u: any }>(
      `MATCH (u:User {id: $id})
       SET u.budgetMin = $budgetMin,
           u.budgetMax = $budgetMax,
           u.preferredCity = $preferredCity,
           u.searchRadius = $searchRadius,
           u.preferredLat = $preferredLat,
           u.preferredLng = $preferredLng,
           u.moveInDate = $moveInDate,
           u.smoker = $smoker,
           u.pets = $pets,
           u.earlyBird = $earlyBird,
           u.cleanliness = $cleanliness,
           u.updatedAt = datetime()
       RETURN u`,
      {
        id,
        budgetMin: preferences.budget.min,
        budgetMax: preferences.budget.max,
        preferredCity: preferences.location.city,
        searchRadius: preferences.location.radius,
        preferredLat: preferences.location.lat,
        preferredLng: preferences.location.lng,
        moveInDate: preferences.moveInDate,
        smoker: preferences.lifestyle.smoker,
        pets: preferences.lifestyle.pets,
        earlyBird: preferences.lifestyle.earlyBird,
        cleanliness: preferences.lifestyle.cleanliness
      }
    );

    return UserMapper.toDomain(result[0].u.properties);
  }

  async addAttributes(id: string, attributes: string[]): Promise<User> {
    // First, add to user's attributes array
    const result = await neo4jConnection.executeWrite<{ u: any }>(
      `MATCH (u:User {id: $id})
       SET u.attributes = u.attributes + $newAttributes,
           u.updatedAt = datetime()
       RETURN u`,
      { id, newAttributes: attributes }
    );

    // Then create Attribute nodes and relationships
    for (const attr of attributes) {
      await neo4jConnection.executeWrite(
        `MERGE (a:Attribute {name: $name})
         WITH a
         MATCH (u:User {id: $userId})
         MERGE (u)-[:HAS_TRAIT]->(a)`,
        { name: attr.toLowerCase(), userId: id }
      );
    }

    return UserMapper.toDomain(result[0].u.properties);
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $id})
       DETACH DELETE u
       RETURN count(u) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
