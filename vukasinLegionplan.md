# 🦁 VUKASIN LEGION - Backend Plan (Heavy Lifting)
**Machine**: Legion (jači)
**Focus**: Neo4j Repositories, AI Integration, Matching Algorithm, Use Cases, Real-time
**Coordination**: DELL radi setup, config, interfaces, routes - ti implementiraš logiku

---

## 🎯 LEGION Scope

✅ **TI RADIŠ:**
- Neo4j Repository Implementations (CRUD operacije)
- Neo4j Mappers (domain ↔ database)
- OpenAI Vision Service (image analysis)
- Cloudinary Image Upload Service
- Matching Algorithm (graph-based scoring)
- Feed Generation Service
- All Use Cases (business logic)
- Socket.io Real-time Chat
- Database Seeding Script
- Controllers implementation

❌ **DELL RADI (Ne Diraj!):**
- Domain config types
- Entity interfaces
- Repository interfaces
- DTOs + Zod validation
- Route definitions
- Middleware
- Serializers
- Neo4j Connection (samo connection, ne repositories)

---

## ⚠️ PREREQUISITES (Čekaj da DELL završi)

Pre nego što počneš, proveri da DELL ima:
- [ ] `apps/server/src/config/domain.config.ts`
- [ ] `apps/server/src/core/domain/entities/*.ts`
- [ ] `apps/server/src/core/repositories/*.ts`
- [ ] `apps/server/src/infrastructure/database/neo4j/Neo4jConnection.ts`
- [ ] `apps/server/src/api/http/dto/*.ts`

---

## 📦 Phase 1: Neo4j Mappers (1h)

### Step 1.1: User Mapper
**File**: `apps/server/src/infrastructure/database/neo4j/mappers/UserMapper.ts`

```typescript
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
      bio: user.bio,
      images: user.images || [],
      attributes: user.attributes || [],
      clerkId: user.clerkId
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
```

---

### Step 1.2: Item Mapper
**File**: `apps/server/src/infrastructure/database/neo4j/mappers/ItemMapper.ts`

```typescript
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
```

---

### Step 1.3: Other Mappers
**File**: `apps/server/src/infrastructure/database/neo4j/mappers/InteractionMapper.ts`

```typescript
import { Interaction, InteractionType } from '../../../../core/domain/entities';

interface Neo4jInteractionNode {
  id: string;
  userId: string;
  itemId: string;
  type: string;
  createdAt: { toString(): string };
}

export class InteractionMapper {
  static toDomain(node: Neo4jInteractionNode): Interaction {
    return {
      id: node.id,
      userId: node.userId,
      itemId: node.itemId,
      type: node.type as InteractionType,
      createdAt: new Date(node.createdAt.toString())
    };
  }

  static toNeo4j(interaction: Partial<Interaction>): Record<string, any> {
    return {
      id: interaction.id,
      userId: interaction.userId,
      itemId: interaction.itemId,
      type: interaction.type
    };
  }
}
```

---

**File**: `apps/server/src/infrastructure/database/neo4j/mappers/MatchMapper.ts`

```typescript
import { Match, MatchStatus, MatchScore } from '../../../../core/domain/entities';

interface Neo4jMatchNode {
  id: string;
  seekerId: string;
  providerId: string;
  itemId: string;
  totalScore: number;
  itemCompatibility: number;
  providerCompatibility: number;
  reasons: string[];
  status: string;
  createdAt: { toString(): string };
  acceptedAt?: { toString(): string };
}

export class MatchMapper {
  static toDomain(node: Neo4jMatchNode): Match {
    return {
      id: node.id,
      seekerId: node.seekerId,
      providerId: node.providerId,
      itemId: node.itemId,
      score: {
        total: node.totalScore,
        itemCompatibility: node.itemCompatibility,
        providerCompatibility: node.providerCompatibility,
        reasons: node.reasons || []
      },
      status: node.status as MatchStatus,
      createdAt: new Date(node.createdAt.toString()),
      acceptedAt: node.acceptedAt ? new Date(node.acceptedAt.toString()) : undefined
    };
  }

  static toNeo4j(match: Partial<Match>): Record<string, any> {
    return {
      id: match.id,
      seekerId: match.seekerId,
      providerId: match.providerId,
      itemId: match.itemId,
      totalScore: match.score?.total,
      itemCompatibility: match.score?.itemCompatibility,
      providerCompatibility: match.score?.providerCompatibility,
      reasons: match.score?.reasons || [],
      status: match.status || 'pending'
    };
  }
}
```

---

**File**: `apps/server/src/infrastructure/database/neo4j/mappers/index.ts`

```typescript
export * from './UserMapper';
export * from './ItemMapper';
export * from './InteractionMapper';
export * from './MatchMapper';
```

---

## 📦 Phase 2: Neo4j Repositories (2-3h)

### Step 2.1: User Repository
**File**: `apps/server/src/infrastructure/database/neo4j/repositories/Neo4jUserRepository.ts`

```typescript
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
```

---

### Step 2.2: Item Repository
**File**: `apps/server/src/infrastructure/database/neo4j/repositories/Neo4jItemRepository.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemStatus } from '../../../../core/domain/entities';
import { IItemRepository, FindItemsOptions } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { ItemMapper } from '../mappers';

export class Neo4jItemRepository implements IItemRepository {

  async findById(id: string): Promise<Item | null> {
    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item {id: $id}) RETURN i`,
      { id }
    );
    return result[0] ? ItemMapper.toDomain(result[0].i.properties) : null;
  }

  async findByProviderId(providerId: string): Promise<Item[]> {
    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item {providerId: $providerId})
       RETURN i
       ORDER BY i.createdAt DESC`,
      { providerId }
    );
    return result.map(r => ItemMapper.toDomain(r.i.properties));
  }

  async findMany(options: FindItemsOptions): Promise<Item[]> {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.status) {
      conditions.push('i.status = $status');
      params.status = options.status;
    }
    if (options.providerId) {
      conditions.push('i.providerId = $providerId');
      params.providerId = options.providerId;
    }
    if (options.city) {
      conditions.push('i.city = $city');
      params.city = options.city;
    }
    if (options.minPrice !== undefined) {
      conditions.push('i.price >= $minPrice');
      params.minPrice = options.minPrice;
    }
    if (options.maxPrice !== undefined) {
      conditions.push('i.price <= $maxPrice');
      params.maxPrice = options.maxPrice;
    }
    if (options.excludeIds && options.excludeIds.length > 0) {
      conditions.push('NOT i.id IN $excludeIds');
      params.excludeIds = options.excludeIds;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item)
       ${whereClause}
       RETURN i
       ORDER BY i.createdAt DESC
       SKIP $offset
       LIMIT $limit`,
      {
        ...params,
        offset: options.offset || 0,
        limit: options.limit || 20
      }
    );

    return result.map(r => ItemMapper.toDomain(r.i.properties));
  }

  async create(data: Partial<Item>): Promise<Item> {
    const id = data.id || uuidv4();
    const params = ItemMapper.toNeo4j({ ...data, id });

    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `CREATE (i:Item {
        id: $id,
        providerId: $providerId,
        title: $title,
        description: $description,
        price: $price,
        size: $size,
        address: $address,
        city: $city,
        lat: $lat,
        lng: $lng,
        images: $images,
        attributes: $attributes,
        vibes: $vibes,
        status: $status,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN i`,
      params
    );

    // Create ownership relationship
    await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $providerId}), (i:Item {id: $itemId})
       CREATE (u)-[:OWNS]->(i)`,
      { providerId: data.providerId, itemId: id }
    );

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async update(id: string, data: Partial<Item>): Promise<Item> {
    const setClauses: string[] = ['i.updatedAt = datetime()'];
    const params: Record<string, any> = { id };

    if (data.title) {
      setClauses.push('i.title = $title');
      params.title = data.title;
    }
    if (data.description !== undefined) {
      setClauses.push('i.description = $description');
      params.description = data.description;
    }
    if (data.price !== undefined) {
      setClauses.push('i.price = $price');
      params.price = data.price;
    }
    if (data.status) {
      setClauses.push('i.status = $status');
      params.status = data.status;
    }

    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `MATCH (i:Item {id: $id})
       SET ${setClauses.join(', ')}
       RETURN i`,
      params
    );

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async addAttributes(id: string, attributes: string[], vibes: string[]): Promise<Item> {
    // Update item's attributes and vibes arrays
    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `MATCH (i:Item {id: $id})
       SET i.attributes = $attributes,
           i.vibes = $vibes,
           i.updatedAt = datetime()
       RETURN i`,
      { id, attributes, vibes }
    );

    // Create Attribute nodes and relationships
    for (const attr of [...attributes, ...vibes]) {
      await neo4jConnection.executeWrite(
        `MERGE (a:Attribute {name: $name})
         WITH a
         MATCH (i:Item {id: $itemId})
         MERGE (i)-[:HAS_ATTRIBUTE]->(a)`,
        { name: attr.toLowerCase(), itemId: id }
      );
    }

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async updateStatus(id: string, status: ItemStatus): Promise<Item> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH (i:Item {id: $id})
       DETACH DELETE i
       RETURN count(i) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
```

---

### Step 2.3: Interaction Repository
**File**: `apps/server/src/infrastructure/database/neo4j/repositories/Neo4jInteractionRepository.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Interaction, InteractionType } from '../../../../core/domain/entities';
import { IInteractionRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { InteractionMapper } from '../mappers';

export class Neo4jInteractionRepository implements IInteractionRepository {

  async findById(id: string): Promise<Interaction | null> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User)-[r:INTERACTED]->(i:Item)
       WHERE r.id = $id
       RETURN r {.*, userId: u.id, itemId: i.id} as props`,
      { id }
    );
    return result[0] ? InteractionMapper.toDomain(result[0].props) : null;
  }

  async findByUserId(userId: string): Promise<Interaction[]> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User {id: $userId})-[r:INTERACTED]->(i:Item)
       RETURN r {.*, userId: u.id, itemId: i.id} as props
       ORDER BY r.createdAt DESC`,
      { userId }
    );
    return result.map(r => InteractionMapper.toDomain(r.props));
  }

  async findByItemId(itemId: string): Promise<Interaction[]> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User)-[r:INTERACTED]->(i:Item {id: $itemId})
       RETURN r {.*, userId: u.id, itemId: i.id} as props
       ORDER BY r.createdAt DESC`,
      { itemId }
    );
    return result.map(r => InteractionMapper.toDomain(r.props));
  }

  async hasUserInteracted(userId: string, itemId: string): Promise<boolean> {
    const result = await neo4jConnection.executeQuery(
      `MATCH (u:User {id: $userId})-[r:INTERACTED]->(i:Item {id: $itemId})
       RETURN count(r) as count`,
      { userId, itemId }
    );
    return (result[0] as any).count > 0;
  }

  async getSwipedItemIds(userId: string): Promise<string[]> {
    const result = await neo4jConnection.executeQuery<{ itemId: string }>(
      `MATCH (u:User {id: $userId})-[:INTERACTED]->(i:Item)
       RETURN i.id as itemId`,
      { userId }
    );
    return result.map(r => r.itemId);
  }

  async create(data: Partial<Interaction>): Promise<Interaction> {
    const id = data.id || uuidv4();

    // Create relationship with properties
    const relType = data.type === 'like' ? 'LIKED' :
                    data.type === 'super_like' ? 'SUPER_LIKED' : 'DISLIKED';

    await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $userId}), (i:Item {id: $itemId})
       CREATE (u)-[r:INTERACTED {
         id: $id,
         type: $type,
         createdAt: datetime()
       }]->(i)
       CREATE (u)-[:${relType}]->(i)`,
      {
        id,
        userId: data.userId,
        itemId: data.itemId,
        type: data.type
      }
    );

    return {
      id,
      userId: data.userId!,
      itemId: data.itemId!,
      type: data.type!,
      createdAt: new Date()
    };
  }

  async update(id: string, data: Partial<Interaction>): Promise<Interaction> {
    // Interactions are immutable, throw error
    throw new Error('Interactions cannot be updated');
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH ()-[r:INTERACTED {id: $id}]->()
       DELETE r
       RETURN count(r) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
```

---

### Step 2.4: Match Repository
**File**: `apps/server/src/infrastructure/database/neo4j/repositories/Neo4jMatchRepository.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Match, MatchStatus } from '../../../../core/domain/entities';
import { IMatchRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { MatchMapper } from '../mappers';

export class Neo4jMatchRepository implements IMatchRepository {

  async findById(id: string): Promise<Match | null> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {id: $id}) RETURN m`,
      { id }
    );
    return result[0] ? MatchMapper.toDomain(result[0].m.properties) : null;
  }

  async findBySeekerId(seekerId: string): Promise<Match[]> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {seekerId: $seekerId})
       RETURN m
       ORDER BY m.createdAt DESC`,
      { seekerId }
    );
    return result.map(r => MatchMapper.toDomain(r.m.properties));
  }

  async findByProviderId(providerId: string): Promise<Match[]> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {providerId: $providerId})
       RETURN m
       ORDER BY m.createdAt DESC`,
      { providerId }
    );
    return result.map(r => MatchMapper.toDomain(r.m.properties));
  }

  async findByUserIds(seekerId: string, providerId: string, itemId: string): Promise<Match | null> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {seekerId: $seekerId, providerId: $providerId, itemId: $itemId})
       RETURN m`,
      { seekerId, providerId, itemId }
    );
    return result[0] ? MatchMapper.toDomain(result[0].m.properties) : null;
  }

  async create(data: Partial<Match>): Promise<Match> {
    const id = data.id || uuidv4();
    const params = MatchMapper.toNeo4j({ ...data, id });

    const result = await neo4jConnection.executeWrite<{ m: any }>(
      `CREATE (m:Match {
        id: $id,
        seekerId: $seekerId,
        providerId: $providerId,
        itemId: $itemId,
        totalScore: $totalScore,
        itemCompatibility: $itemCompatibility,
        providerCompatibility: $providerCompatibility,
        reasons: $reasons,
        status: $status,
        createdAt: datetime()
      })
      RETURN m`,
      params
    );

    // Create relationships to users and item
    await neo4jConnection.executeWrite(
      `MATCH (s:User {id: $seekerId}), (p:User {id: $providerId}), (i:Item {id: $itemId}), (m:Match {id: $matchId})
       CREATE (s)-[:HAS_MATCH]->(m)
       CREATE (p)-[:HAS_MATCH]->(m)
       CREATE (m)-[:FOR_ITEM]->(i)`,
      {
        seekerId: data.seekerId,
        providerId: data.providerId,
        itemId: data.itemId,
        matchId: id
      }
    );

    return MatchMapper.toDomain(result[0].m.properties);
  }

  async update(id: string, data: Partial<Match>): Promise<Match> {
    const setClauses: string[] = [];
    const params: Record<string, any> = { id };

    if (data.status) {
      setClauses.push('m.status = $status');
      params.status = data.status;
      if (data.status === 'accepted') {
        setClauses.push('m.acceptedAt = datetime()');
      }
    }

    const result = await neo4jConnection.executeWrite<{ m: any }>(
      `MATCH (m:Match {id: $id})
       SET ${setClauses.join(', ')}
       RETURN m`,
      params
    );

    return MatchMapper.toDomain(result[0].m.properties);
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH (m:Match {id: $id})
       DETACH DELETE m
       RETURN count(m) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
```

---

**File**: `apps/server/src/infrastructure/database/neo4j/repositories/index.ts`

```typescript
export * from './Neo4jUserRepository';
export * from './Neo4jItemRepository';
export * from './Neo4jInteractionRepository';
export * from './Neo4jMatchRepository';
```

---

## 📦 Phase 3: External Services (1.5h)

### Step 3.1: OpenAI Client
**File**: `apps/server/src/infrastructure/external-services/openai/OpenAIClient.ts`

```typescript
import OpenAI from 'openai';

class OpenAIClient {
  private static instance: OpenAIClient;
  private client: OpenAI;

  private constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async analyzeImages(
    systemPrompt: string,
    userPrompt: string,
    imageUrls: string[]
  ): Promise<string> {
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: userPrompt }
    ];

    for (const url of imageUrls) {
      content.push({
        type: 'image_url',
        image_url: { url, detail: 'low' }
      });
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '{}';
  }
}

export const openAIClient = OpenAIClient.getInstance();
```

---

### Step 3.2: Vision Service
**File**: `apps/server/src/core/services/vision/VisionService.ts`

```typescript
import { openAIClient } from '../../../infrastructure/external-services/openai/OpenAIClient';
import { DomainConfig } from '../../../config/domain.config';

export interface ItemAnalysisResult {
  attributes: string[];
  vibes: string[];
  cleanliness?: number;
  features?: string[];
}

export interface UserAnalysisResult {
  traits: string[];
  socialStyle?: string;
  lifestyle?: string[];
}

export class VisionService {
  constructor(private config: DomainConfig) {}

  async analyzeItem(imageUrls: string[]): Promise<ItemAnalysisResult> {
    const { systemPrompt, userPromptTemplate } = this.config.vision.itemAnalysis;

    const userPrompt = userPromptTemplate.replace('{imageUrls}', imageUrls.join(', '));

    const responseText = await openAIClient.analyzeImages(
      systemPrompt,
      userPrompt,
      imageUrls
    );

    try {
      const parsed = JSON.parse(responseText);
      return {
        attributes: parsed.attributes || [],
        vibes: parsed.vibes || [],
        cleanliness: parsed.cleanliness,
        features: parsed.features
      };
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      return { attributes: [], vibes: [] };
    }
  }

  async analyzeUser(imageUrls: string[], bio?: string): Promise<UserAnalysisResult> {
    const { systemPrompt, userPromptTemplate } = this.config.vision.userAnalysis;

    const userPrompt = userPromptTemplate
      .replace('{imageUrls}', imageUrls.join(', '))
      .replace('{bio}', bio || 'No bio provided');

    const responseText = await openAIClient.analyzeImages(
      systemPrompt,
      userPrompt,
      imageUrls
    );

    try {
      const parsed = JSON.parse(responseText);
      return {
        traits: parsed.traits || [],
        socialStyle: parsed.socialStyle,
        lifestyle: parsed.lifestyle
      };
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      return { traits: [] };
    }
  }
}
```

---

### Step 3.3: Cloudinary Service
**File**: `apps/server/src/infrastructure/external-services/cloudinary/ImageUploadService.ts`

```typescript
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

class ImageUploadService {
  private static instance: ImageUploadService;

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'zzzimeri'
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        }
      ).end(fileBuffer);
    });
  }

  async uploadFromUrl(
    imageUrl: string,
    folder: string = 'zzzimeri'
  ): Promise<{ url: string; publicId: string }> {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  }

  async deleteImage(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }

  getThumbnailUrl(url: string, width: number = 400): string {
    return url.replace('/upload/', `/upload/w_${width},c_fill/`);
  }
}

export const imageUploadService = ImageUploadService.getInstance();
```

---

## 📦 Phase 4: Matching Algorithm (2h)

### Step 4.1: Matching Strategy Interface
**File**: `apps/server/src/core/services/matching/IMatchingStrategy.ts`

```typescript
import { User, Item, MatchScore } from '../../domain/entities';

export interface MatchCandidate {
  item: Item;
  provider: User;
}

export interface IMatchingStrategy {
  calculateMatch(seeker: User, item: Item, provider: User): MatchScore;
  findBestMatches(seeker: User, candidates: MatchCandidate[], limit: number): Array<{
    candidate: MatchCandidate;
    score: MatchScore;
  }>;
}
```

---

### Step 4.2: Graph Matching Strategy
**File**: `apps/server/src/core/services/matching/strategies/GraphMatchingStrategy.ts`

```typescript
import { User, Item, MatchScore } from '../../../domain/entities';
import { IMatchingStrategy, MatchCandidate } from '../IMatchingStrategy';
import { DomainConfig } from '../../../../config/domain.config';

export class GraphMatchingStrategy implements IMatchingStrategy {
  constructor(private config: DomainConfig) {}

  calculateMatch(seeker: User, item: Item, provider: User): MatchScore {
    const itemScore = this.calculateItemCompatibility(seeker, item);
    const providerScore = this.calculateProviderCompatibility(seeker, provider);

    const { itemCompatibility: itemWeight, providerCompatibility: providerWeight } =
      this.config.matching;

    const total = (itemScore * itemWeight) + (providerScore * providerWeight);

    const reasons = this.generateReasons(seeker, item, provider, itemScore, providerScore);

    return {
      total: Math.round(total),
      itemCompatibility: Math.round(itemScore),
      providerCompatibility: Math.round(providerScore),
      reasons
    };
  }

  private calculateItemCompatibility(seeker: User, item: Item): number {
    let score = 100;
    const reasons: string[] = [];

    // Budget check (hard constraint)
    if (seeker.preferences) {
      const { min, max } = seeker.preferences.budget;
      if (item.price < min || item.price > max) {
        return 0; // Outside budget = no match
      }

      // Price sweet spot bonus (closer to min = better)
      const priceRange = max - min;
      if (priceRange > 0) {
        const pricePosition = (item.price - min) / priceRange;
        score -= pricePosition * 10; // Up to -10 points for expensive end
      }
    }

    // Location check
    if (seeker.preferences?.location.city) {
      if (item.location.city.toLowerCase() !== seeker.preferences.location.city.toLowerCase()) {
        score -= 30; // Different city penalty
      }
    }

    // Attribute matching (visual/vibe similarity)
    const seekerVibePrefs = this.inferVibePreferences(seeker);
    const itemVibes = [...item.attributes, ...item.vibes];

    const vibeOverlap = this.calculateJaccardSimilarity(seekerVibePrefs, itemVibes);
    score = score * (0.5 + vibeOverlap * 0.5); // Vibes contribute up to 50% of score

    return Math.max(0, Math.min(100, score));
  }

  private calculateProviderCompatibility(seeker: User, provider: User): number {
    let score = 50; // Start at neutral

    // Trait similarity (Jaccard)
    const traitSimilarity = this.calculateJaccardSimilarity(
      seeker.attributes,
      provider.attributes
    );
    score += traitSimilarity * 50; // Up to +50 for perfect match

    // Lifestyle compatibility
    if (seeker.preferences?.lifestyle && provider.attributes.length > 0) {
      // Check for conflicts
      if (seeker.preferences.lifestyle.smoker !== provider.attributes.includes('smoker')) {
        // One smokes, one doesn't - but check preference
        if (!seeker.preferences.lifestyle.smoker && provider.attributes.includes('smoker')) {
          score -= 20; // Non-smoker matched with smoker
        }
      }

      // Early bird vs night owl
      const seekerEarly = seeker.preferences.lifestyle.earlyBird;
      const providerEarly = provider.attributes.includes('early-bird');
      const providerNight = provider.attributes.includes('night-owl');

      if (seekerEarly && providerNight) score -= 15;
      if (!seekerEarly && providerEarly) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private inferVibePreferences(seeker: User): string[] {
    // Infer what vibes seeker might like based on their traits
    const vibes: string[] = [];

    if (seeker.attributes.includes('introvert') || seeker.attributes.includes('studious')) {
      vibes.push('quiet', 'studious', 'minimalist');
    }
    if (seeker.attributes.includes('extrovert') || seeker.attributes.includes('party-animal')) {
      vibes.push('social', 'party-friendly', 'bright');
    }
    if (seeker.attributes.includes('organized')) {
      vibes.push('modern', 'minimalist', 'bright');
    }
    if (seeker.attributes.includes('artistic')) {
      vibes.push('bohemian', 'cozy', 'rustic');
    }

    return vibes;
  }

  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    if (set1.length === 0 && set2.length === 0) return 0.5; // Neutral

    const s1 = new Set(set1.map(s => s.toLowerCase()));
    const s2 = new Set(set2.map(s => s.toLowerCase()));

    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);

    if (union.size === 0) return 0.5;

    return intersection.size / union.size;
  }

  private generateReasons(
    seeker: User,
    item: Item,
    provider: User,
    itemScore: number,
    providerScore: number
  ): string[] {
    const reasons: string[] = [];

    // Budget reason
    if (seeker.preferences) {
      const { min, max } = seeker.preferences.budget;
      if (item.price >= min && item.price <= max) {
        reasons.push(`Within budget (€${min}-€${max})`);
      }
    }

    // Matching vibes
    const matchingVibes = item.attributes.filter(attr =>
      seeker.attributes.some(sa => sa.toLowerCase() === attr.toLowerCase())
    );
    if (matchingVibes.length > 0) {
      reasons.push(`Matching style: ${matchingVibes.slice(0, 3).join(', ')}`);
    }

    // Provider compatibility
    const matchingTraits = provider.attributes.filter(attr =>
      seeker.attributes.some(sa => sa.toLowerCase() === attr.toLowerCase())
    );
    if (matchingTraits.length > 0) {
      reasons.push(`Compatible roommate: ${matchingTraits.slice(0, 2).join(', ')}`);
    }

    // Location
    if (seeker.preferences?.location.city?.toLowerCase() === item.location.city.toLowerCase()) {
      reasons.push(`In your preferred area: ${item.location.city}`);
    }

    // Score-based reasons
    if (itemScore >= 80) {
      reasons.push('Great apartment match!');
    }
    if (providerScore >= 70) {
      reasons.push('Highly compatible roommate');
    }

    return reasons.slice(0, 4); // Max 4 reasons
  }

  findBestMatches(
    seeker: User,
    candidates: MatchCandidate[],
    limit: number
  ): Array<{ candidate: MatchCandidate; score: MatchScore }> {
    const scored = candidates.map(candidate => ({
      candidate,
      score: this.calculateMatch(seeker, candidate.item, candidate.provider)
    }));

    // Filter by minimum threshold
    const filtered = scored.filter(
      s => s.score.total >= this.config.matching.minScoreThreshold
    );

    // Sort by total score descending
    filtered.sort((a, b) => b.score.total - a.score.total);

    return filtered.slice(0, limit);
  }
}
```

---

### Step 4.3: Matching Engine
**File**: `apps/server/src/core/services/matching/MatchingEngine.ts`

```typescript
import { User, Item, MatchScore } from '../../domain/entities';
import { IMatchingStrategy, MatchCandidate } from './IMatchingStrategy';

export class MatchingEngine {
  constructor(private strategy: IMatchingStrategy) {}

  calculateScore(seeker: User, item: Item, provider: User): MatchScore {
    return this.strategy.calculateMatch(seeker, item, provider);
  }

  generateFeed(
    seeker: User,
    candidates: MatchCandidate[],
    limit: number = 20
  ): Array<{ candidate: MatchCandidate; score: MatchScore }> {
    return this.strategy.findBestMatches(seeker, candidates, limit);
  }
}
```

---

### Step 4.4: Feed Service
**File**: `apps/server/src/core/services/recommendation/FeedService.ts`

```typescript
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
```

---

## 📦 Phase 5: Use Cases (2h)

### Step 5.1: Item Use Cases
**File**: `apps/server/src/core/use-cases/item/CreateItem.usecase.ts`

```typescript
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
```

---

**File**: `apps/server/src/core/use-cases/item/GetItem.usecase.ts`

```typescript
import { Item } from '../../domain/entities';
import { IItemRepository } from '../../repositories';

export class GetItemUseCase {
  constructor(private itemRepository: IItemRepository) {}

  async execute(itemId: string): Promise<Item> {
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }
}
```

---

### Step 5.2: User Use Cases
**File**: `apps/server/src/core/use-cases/user/CreateUser.usecase.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities';
import { IUserRepository } from '../../repositories';
import { CreateUserInput } from '../../../api/http/dto';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.create({
      id: uuidv4(),
      email: input.email,
      name: input.name,
      role: input.role,
      clerkId: input.clerkId,
      bio: input.bio,
      images: input.images || [],
      attributes: []
    });

    return user;
  }
}
```

---

**File**: `apps/server/src/core/use-cases/user/AnalyzeUserProfile.usecase.ts`

```typescript
import { User } from '../../domain/entities';
import { IUserRepository } from '../../repositories';
import { VisionService } from '../../services/vision/VisionService';

export class AnalyzeUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private visionService: VisionService
  ) {}

  async execute(userId: string, images: string[], bio?: string): Promise<User> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Analyze with AI
    const analysis = await this.visionService.analyzeUser(images, bio);

    // 3. Update user attributes
    const updatedUser = await this.userRepository.addAttributes(
      userId,
      analysis.traits
    );

    return updatedUser;
  }
}
```

---

### Step 5.3: Interaction Use Cases
**File**: `apps/server/src/core/use-cases/interaction/RecordInteraction.usecase.ts`

```typescript
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
```

---

### Step 5.4: Feed Use Case
**File**: `apps/server/src/core/use-cases/matching/GetFeed.usecase.ts`

```typescript
import { FeedService, FeedItem } from '../../services/recommendation/FeedService';

export class GetFeedUseCase {
  constructor(private feedService: FeedService) {}

  async execute(seekerId: string, limit: number = 20, offset: number = 0): Promise<FeedItem[]> {
    return this.feedService.generatePersonalizedFeed(seekerId, limit, offset);
  }
}
```

---

### Step 5.5: Match Use Cases
**File**: `apps/server/src/core/use-cases/matching/GetMatches.usecase.ts`

```typescript
import { Match } from '../../domain/entities';
import { IMatchRepository } from '../../repositories';

export class GetMatchesUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(userId: string, role: 'seeker' | 'provider'): Promise<Match[]> {
    if (role === 'seeker') {
      return this.matchRepository.findBySeekerId(userId);
    } else {
      return this.matchRepository.findByProviderId(userId);
    }
  }
}
```

---

**File**: `apps/server/src/core/use-cases/matching/AcceptMatch.usecase.ts`

```typescript
import { Match } from '../../domain/entities';
import { IMatchRepository } from '../../repositories';

export class AcceptMatchUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(matchId: string, providerId: string): Promise<Match> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.providerId !== providerId) {
      throw new Error('Only the provider can accept this match');
    }

    if (match.status !== 'pending') {
      throw new Error('Match is not pending');
    }

    return this.matchRepository.updateStatus(matchId, 'accepted');
  }
}
```

---

**File**: `apps/server/src/core/use-cases/index.ts`

```typescript
// Item
export * from './item/CreateItem.usecase';
export * from './item/GetItem.usecase';

// User
export * from './user/CreateUser.usecase';
export * from './user/AnalyzeUserProfile.usecase';

// Interaction
export * from './interaction/RecordInteraction.usecase';

// Matching
export * from './matching/GetFeed.usecase';
export * from './matching/GetMatches.usecase';
export * from './matching/AcceptMatch.usecase';
```

---

## 📦 Phase 6: Socket.io Real-time (1h)

**File**: `apps/server/src/infrastructure/messaging/SocketIOServer.ts`

```typescript
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export class SocketIOServer {
  private static instance: SocketIOServer;
  private io: Server | null = null;

  private constructor() {}

  static getInstance(): SocketIOServer {
    if (!SocketIOServer.instance) {
      SocketIOServer.instance = new SocketIOServer();
    }
    return SocketIOServer.instance;
  }

  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Join match room
      socket.on('join_room', (matchId: string) => {
        socket.join(`match:${matchId}`);
        console.log(`Socket ${socket.id} joined room match:${matchId}`);
      });

      // Leave match room
      socket.on('leave_room', (matchId: string) => {
        socket.leave(`match:${matchId}`);
      });

      // Send message
      socket.on('send_message', (message: ChatMessage) => {
        // Broadcast to room (including sender for confirmation)
        this.io?.to(`match:${message.matchId}`).emit('new_message', {
          ...message,
          timestamp: new Date().toISOString()
        });
      });

      // Typing indicator
      socket.on('typing_start', (data: { matchId: string; userId: string }) => {
        socket.to(`match:${data.matchId}`).emit('user_typing', {
          userId: data.userId,
          typing: true
        });
      });

      socket.on('typing_stop', (data: { matchId: string; userId: string }) => {
        socket.to(`match:${data.matchId}`).emit('user_typing', {
          userId: data.userId,
          typing: false
        });
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    console.log('✅ Socket.IO initialized');
  }

  // Emit to specific match room
  emitToMatch(matchId: string, event: string, data: any): void {
    this.io?.to(`match:${matchId}`).emit(event, data);
  }

  // Emit to specific user (if they have a user room)
  emitToUser(userId: string, event: string, data: any): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }
}

export const socketIOServer = SocketIOServer.getInstance();
```

---

## 📦 Phase 7: Update Container + Controllers (1h)

### Step 7.1: Update Container
**File**: `apps/server/src/container/Container.ts` (FULL IMPLEMENTATION)

```typescript
import { DomainConfig } from '../config/domain.config';
import { loadDomainConfig } from '../config/domains';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';

// Repositories
import {
  Neo4jUserRepository,
  Neo4jItemRepository,
  Neo4jInteractionRepository,
  Neo4jMatchRepository
} from '../infrastructure/database/neo4j/repositories';

// Services
import { VisionService } from '../core/services/vision/VisionService';
import { MatchingEngine } from '../core/services/matching/MatchingEngine';
import { GraphMatchingStrategy } from '../core/services/matching/strategies/GraphMatchingStrategy';
import { FeedService } from '../core/services/recommendation/FeedService';

// Use Cases
import {
  CreateUserUseCase,
  AnalyzeUserProfileUseCase,
  CreateItemUseCase,
  GetItemUseCase,
  RecordInteractionUseCase,
  GetFeedUseCase,
  GetMatchesUseCase,
  AcceptMatchUseCase
} from '../core/use-cases';

class Container {
  private static instance: Container;

  // Config
  public domainConfig: DomainConfig;

  // Repositories
  public userRepository!: Neo4jUserRepository;
  public itemRepository!: Neo4jItemRepository;
  public interactionRepository!: Neo4jInteractionRepository;
  public matchRepository!: Neo4jMatchRepository;

  // Services
  public visionService!: VisionService;
  public matchingEngine!: MatchingEngine;
  public feedService!: FeedService;

  // Use Cases
  public createUserUseCase!: CreateUserUseCase;
  public analyzeUserProfileUseCase!: AnalyzeUserProfileUseCase;
  public createItemUseCase!: CreateItemUseCase;
  public getItemUseCase!: GetItemUseCase;
  public recordInteractionUseCase!: RecordInteractionUseCase;
  public getFeedUseCase!: GetFeedUseCase;
  public getMatchesUseCase!: GetMatchesUseCase;
  public acceptMatchUseCase!: AcceptMatchUseCase;

  private constructor() {
    this.domainConfig = loadDomainConfig();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(): Promise<void> {
    // Connect to database
    await neo4jConnection.connect();

    // Initialize repositories
    this.userRepository = new Neo4jUserRepository();
    this.itemRepository = new Neo4jItemRepository();
    this.interactionRepository = new Neo4jInteractionRepository();
    this.matchRepository = new Neo4jMatchRepository();

    // Initialize services
    this.visionService = new VisionService(this.domainConfig);

    const matchingStrategy = new GraphMatchingStrategy(this.domainConfig);
    this.matchingEngine = new MatchingEngine(matchingStrategy);

    this.feedService = new FeedService(
      this.userRepository,
      this.itemRepository,
      this.interactionRepository,
      this.matchingEngine
    );

    // Initialize use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.analyzeUserProfileUseCase = new AnalyzeUserProfileUseCase(
      this.userRepository,
      this.visionService
    );
    this.createItemUseCase = new CreateItemUseCase(
      this.itemRepository,
      this.userRepository,
      this.visionService
    );
    this.getItemUseCase = new GetItemUseCase(this.itemRepository);
    this.recordInteractionUseCase = new RecordInteractionUseCase(
      this.interactionRepository,
      this.itemRepository,
      this.userRepository,
      this.matchRepository,
      this.matchingEngine
    );
    this.getFeedUseCase = new GetFeedUseCase(this.feedService);
    this.getMatchesUseCase = new GetMatchesUseCase(this.matchRepository);
    this.acceptMatchUseCase = new AcceptMatchUseCase(this.matchRepository);

    console.log('✅ Container initialized');
  }
}

export const container = Container.getInstance();
```

---

## 📦 Phase 8: Database Seeding (1h)

**File**: `apps/server/scripts/seed.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { neo4jConnection } from '../src/infrastructure/database/neo4j/Neo4jConnection';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  await neo4jConnection.connect();

  // Clear existing data
  console.log('Clearing existing data...');
  await neo4jConnection.executeWrite('MATCH (n) DETACH DELETE n');

  // Create providers
  console.log('Creating providers...');
  const providers = [
    {
      id: 'provider-1',
      email: 'marko@test.com',
      name: 'Marko Marković',
      role: 'provider',
      bio: 'IT profesionalac, volim red i mir',
      images: ['https://randomuser.me/api/portraits/men/1.jpg'],
      attributes: ['organized', 'quiet', 'early-bird', 'fitness']
    },
    {
      id: 'provider-2',
      email: 'ana@test.com',
      name: 'Ana Anić',
      role: 'provider',
      bio: 'Dizajnerka, kreativna duša',
      images: ['https://randomuser.me/api/portraits/women/2.jpg'],
      attributes: ['artistic', 'social', 'night-owl', 'pet-lover']
    },
    {
      id: 'provider-3',
      email: 'petar@test.com',
      name: 'Petar Petrović',
      role: 'provider',
      bio: 'Student medicine, focus na učenje',
      images: ['https://randomuser.me/api/portraits/men/3.jpg'],
      attributes: ['studious', 'introvert', 'organized', 'early-bird']
    }
  ];

  for (const p of providers) {
    await neo4jConnection.executeWrite(
      `CREATE (u:User {
        id: $id, email: $email, name: $name, role: $role,
        bio: $bio, images: $images, attributes: $attributes,
        createdAt: datetime(), updatedAt: datetime()
      })`,
      p
    );
  }

  // Create apartments
  console.log('Creating apartments...');
  const apartments = [
    {
      id: 'apt-1',
      providerId: 'provider-1',
      title: 'Moderna garsonjera na Vračaru',
      description: 'Svetla i prostrana garsonjera, potpuno namještena',
      price: 350,
      size: 30,
      address: 'Njegoševa 50',
      city: 'Beograd',
      lat: 44.8025,
      lng: 20.4764,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
      attributes: ['modern', 'bright', 'minimalist'],
      vibes: ['quiet', 'studious'],
      status: 'active'
    },
    {
      id: 'apt-2',
      providerId: 'provider-2',
      title: 'Kreativni studio na Dorćolu',
      description: 'Umetnički prostor sa dušom',
      price: 400,
      size: 45,
      address: 'Cara Dušana 80',
      city: 'Beograd',
      lat: 44.8211,
      lng: 20.4633,
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
      attributes: ['bohemian', 'artistic', 'cozy'],
      vibes: ['social', 'chill'],
      status: 'active'
    },
    {
      id: 'apt-3',
      providerId: 'provider-3',
      title: 'Studentska soba kod Studentskog trga',
      description: 'Idealno za studente, blizu fakulteta',
      price: 200,
      size: 15,
      address: 'Studentski trg 1',
      city: 'Beograd',
      lat: 44.8186,
      lng: 20.4568,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      attributes: ['minimalist', 'bright', 'modern'],
      vibes: ['studious', 'quiet'],
      status: 'active'
    },
    {
      id: 'apt-4',
      providerId: 'provider-1',
      title: 'Luksuzni stan na Novom Beogradu',
      description: 'Premium stan sa pogledom na reku',
      price: 600,
      size: 70,
      address: 'Bulevar Mihajla Pupina 10',
      city: 'Beograd',
      lat: 44.8125,
      lng: 20.4214,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
      attributes: ['luxury', 'modern', 'bright'],
      vibes: ['chill', 'social'],
      status: 'active'
    }
  ];

  for (const apt of apartments) {
    await neo4jConnection.executeWrite(
      `CREATE (i:Item {
        id: $id, providerId: $providerId, title: $title, description: $description,
        price: $price, size: $size, address: $address, city: $city,
        lat: $lat, lng: $lng, images: $images,
        attributes: $attributes, vibes: $vibes, status: $status,
        createdAt: datetime(), updatedAt: datetime()
      })`,
      apt
    );

    // Create ownership relationship
    await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $providerId}), (i:Item {id: $itemId})
       CREATE (u)-[:OWNS]->(i)`,
      { providerId: apt.providerId, itemId: apt.id }
    );
  }

  // Create seekers
  console.log('Creating seekers...');
  const seekers = [
    {
      id: 'seeker-1',
      email: 'jana@test.com',
      name: 'Jana Janić',
      role: 'seeker',
      bio: 'Studentkinja prava, tražim miran kutak',
      images: ['https://randomuser.me/api/portraits/women/4.jpg'],
      attributes: ['studious', 'organized', 'introvert', 'early-bird'],
      budgetMin: 150,
      budgetMax: 300,
      preferredCity: 'Beograd',
      searchRadius: 10,
      smoker: false,
      pets: false,
      earlyBird: true,
      cleanliness: 5
    },
    {
      id: 'seeker-2',
      email: 'nikola@test.com',
      name: 'Nikola Nikolić',
      role: 'seeker',
      bio: 'Mladi profesionalac, društven',
      images: ['https://randomuser.me/api/portraits/men/5.jpg'],
      attributes: ['social', 'fitness', 'extrovert', 'night-owl'],
      budgetMin: 300,
      budgetMax: 500,
      preferredCity: 'Beograd',
      searchRadius: 15,
      smoker: false,
      pets: true,
      earlyBird: false,
      cleanliness: 4
    }
  ];

  for (const s of seekers) {
    await neo4jConnection.executeWrite(
      `CREATE (u:User {
        id: $id, email: $email, name: $name, role: $role,
        bio: $bio, images: $images, attributes: $attributes,
        budgetMin: $budgetMin, budgetMax: $budgetMax,
        preferredCity: $preferredCity, searchRadius: $searchRadius,
        smoker: $smoker, pets: $pets, earlyBird: $earlyBird, cleanliness: $cleanliness,
        createdAt: datetime(), updatedAt: datetime()
      })`,
      s
    );
  }

  // Create some attribute nodes
  console.log('Creating attribute nodes...');
  const attributes = [
    'modern', 'minimalist', 'bohemian', 'cozy', 'bright', 'luxury',
    'quiet', 'studious', 'social', 'chill',
    'organized', 'artistic', 'fitness', 'introvert', 'extrovert', 'early-bird', 'night-owl'
  ];

  for (const attr of attributes) {
    await neo4jConnection.executeWrite(
      `MERGE (a:Attribute {name: $name})`,
      { name: attr }
    );
  }

  // Create sample interaction (seeker-1 likes apt-3)
  console.log('Creating sample interactions...');
  await neo4jConnection.executeWrite(
    `MATCH (u:User {id: 'seeker-1'}), (i:Item {id: 'apt-3'})
     CREATE (u)-[:INTERACTED {id: 'int-1', type: 'like', createdAt: datetime()}]->(i)
     CREATE (u)-[:LIKED]->(i)`
  );

  // Create sample match
  console.log('Creating sample match...');
  await neo4jConnection.executeWrite(
    `CREATE (m:Match {
      id: 'match-1',
      seekerId: 'seeker-1',
      providerId: 'provider-3',
      itemId: 'apt-3',
      totalScore: 92,
      itemCompatibility: 95,
      providerCompatibility: 85,
      reasons: ['Within budget (€150-€300)', 'Matching style: minimalist, bright', 'Compatible roommate: studious, organized'],
      status: 'pending',
      createdAt: datetime()
    })`
  );

  console.log('\n✅ Seed completed successfully!');
  console.log('Created:');
  console.log('  - 3 providers');
  console.log('  - 4 apartments');
  console.log('  - 2 seekers');
  console.log('  - 1 sample interaction');
  console.log('  - 1 sample match');

  await neo4jConnection.close();
}

seed().catch(console.error);
```

---

## ✅ LEGION Checklist

- [ ] Phase 1: Mappers
  - [ ] `UserMapper.ts`
  - [ ] `ItemMapper.ts`
  - [ ] `InteractionMapper.ts`
  - [ ] `MatchMapper.ts`

- [ ] Phase 2: Neo4j Repositories
  - [ ] `Neo4jUserRepository.ts`
  - [ ] `Neo4jItemRepository.ts`
  - [ ] `Neo4jInteractionRepository.ts`
  - [ ] `Neo4jMatchRepository.ts`

- [ ] Phase 3: External Services
  - [ ] `OpenAIClient.ts`
  - [ ] `VisionService.ts`
  - [ ] `ImageUploadService.ts`

- [ ] Phase 4: Matching Algorithm
  - [ ] `IMatchingStrategy.ts`
  - [ ] `GraphMatchingStrategy.ts`
  - [ ] `MatchingEngine.ts`
  - [ ] `FeedService.ts`

- [ ] Phase 5: Use Cases
  - [ ] `CreateItem.usecase.ts`
  - [ ] `GetItem.usecase.ts`
  - [ ] `CreateUser.usecase.ts`
  - [ ] `AnalyzeUserProfile.usecase.ts`
  - [ ] `RecordInteraction.usecase.ts`
  - [ ] `GetFeed.usecase.ts`
  - [ ] `GetMatches.usecase.ts`
  - [ ] `AcceptMatch.usecase.ts`

- [ ] Phase 6: Socket.io
  - [ ] `SocketIOServer.ts`

- [ ] Phase 7: Update Container (full impl)

- [ ] Phase 8: Seed script

---

## 📁 Final LEGION Folder Structure

```
apps/server/src/
├── infrastructure/
│   ├── database/
│   │   └── neo4j/
│   │       ├── mappers/
│   │       │   ├── UserMapper.ts        ← LEGION
│   │       │   ├── ItemMapper.ts        ← LEGION
│   │       │   ├── InteractionMapper.ts ← LEGION
│   │       │   ├── MatchMapper.ts       ← LEGION
│   │       │   └── index.ts             ← LEGION
│   │       └── repositories/
│   │           ├── Neo4jUserRepository.ts ← LEGION
│   │           ├── Neo4jItemRepository.ts ← LEGION
│   │           ├── Neo4jInteractionRepository.ts ← LEGION
│   │           ├── Neo4jMatchRepository.ts ← LEGION
│   │           └── index.ts              ← LEGION
│   ├── external-services/
│   │   ├── openai/
│   │   │   └── OpenAIClient.ts          ← LEGION
│   │   └── cloudinary/
│   │       └── ImageUploadService.ts    ← LEGION
│   └── messaging/
│       └── SocketIOServer.ts            ← LEGION
├── core/
│   ├── services/
│   │   ├── vision/
│   │   │   └── VisionService.ts         ← LEGION
│   │   ├── matching/
│   │   │   ├── IMatchingStrategy.ts     ← LEGION
│   │   │   ├── MatchingEngine.ts        ← LEGION
│   │   │   └── strategies/
│   │   │       └── GraphMatchingStrategy.ts ← LEGION
│   │   └── recommendation/
│   │       └── FeedService.ts           ← LEGION
│   └── use-cases/
│       ├── item/
│       │   ├── CreateItem.usecase.ts    ← LEGION
│       │   └── GetItem.usecase.ts       ← LEGION
│       ├── user/
│       │   ├── CreateUser.usecase.ts    ← LEGION
│       │   └── AnalyzeUserProfile.usecase.ts ← LEGION
│       ├── interaction/
│       │   └── RecordInteraction.usecase.ts ← LEGION
│       ├── matching/
│       │   ├── GetFeed.usecase.ts       ← LEGION
│       │   ├── GetMatches.usecase.ts    ← LEGION
│       │   └── AcceptMatch.usecase.ts   ← LEGION
│       └── index.ts                     ← LEGION
├── container/
│   └── Container.ts                     ← LEGION (full implementation)
└── scripts/
    └── seed.ts                          ← LEGION
```

---

## 🔗 Coordination sa DELL-om

1. **Pre nego što počneš** - proveri da DELL ima interfaces i types
2. **Import paths** - koristi DELL-ove interfaces iz `core/repositories/`
3. **Ne diraj** - routes, middleware, DTOs, serializers
4. **Communicate** - javi DELL-u kad završiš Container da može update-ovati `app.ts`

---

**LEGION Power! 🦁 Heavy lifting starts here!**
