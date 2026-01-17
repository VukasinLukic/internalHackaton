# 💻 VUKASIN DELL - Backend Plan (Lakši Taskovi)
**Machine**: Dell (slabiji)
**Focus**: Setup, Configuration, Database Schema, DTOs, Routes, Middleware
**Coordination**: Legion radi AI, Matching Algorithm, Use Cases

---

## 🎯 DELL Scope

✅ **TI RADIŠ:**
- Domain Configuration System
- Core Domain Entities (interfaces)
- Repository Interfaces (samo contracts)
- Neo4j Setup + Connection
- Database Schema (Cypher migrations)
- DTOs + Validation (Zod schemas)
- Routes + Middleware
- Serializers
- Dependency Injection Container
- Server Entry Point update
- Environment setup

❌ **LEGION RADI (Ne Diraj!):**
- Neo4j Repository Implementations
- OpenAI/Cloudinary Integration
- Vision Service
- Matching Algorithm
- Use Cases (business logic)
- Socket.io Real-time
- Seed Script

---

## 📦 Phase 1: Domain Configuration System (1-1.5h)

### Step 1.1: Config Types
**File**: `apps/server/src/config/domain.config.ts`

```typescript
// Domain types
export type DomainType = 'zzzimeri' | 'tradey';

export interface VisionPromptConfig {
  itemAnalysis: {
    systemPrompt: string;
    userPromptTemplate: string;
  };
  userAnalysis: {
    systemPrompt: string;
    userPromptTemplate: string;
  };
}

export interface MatchingWeightsConfig {
  itemCompatibility: number;      // 0.7 for zzzimeri
  providerCompatibility: number;  // 0.3 for zzzimeri
  minScoreThreshold: number;      // 50
}

export interface UILabelsConfig {
  item: {
    singular: string;    // "Apartment" / "Item"
    plural: string;      // "Apartments" / "Items"
  };
  provider: {
    singular: string;    // "Roommate" / "Seller"
    plural: string;
  };
  seeker: {
    singular: string;    // "Seeker" / "Buyer"
    plural: string;
  };
  action: {
    like: string;        // "Interested" / "Want"
    dislike: string;     // "Pass" / "Skip"
  };
}

export interface DomainConfig {
  type: DomainType;
  vision: VisionPromptConfig;
  matching: MatchingWeightsConfig;
  labels: UILabelsConfig;
}
```

---

### Step 1.2: ZZZimeri Config
**File**: `apps/server/src/config/domains/zzzimeri.config.ts`

```typescript
import { DomainConfig } from '../domain.config';

export const zzzimeriConfig: DomainConfig = {
  type: 'zzzimeri',

  vision: {
    itemAnalysis: {
      systemPrompt: `You are an apartment analyzer for a roommate matching app.
Analyze the apartment images and extract:
1. Style tags: modern, minimalist, rustic, bohemian, industrial, cozy, bright, luxury, student-vibes
2. Vibe tags: chill, party-friendly, quiet, studious, social
3. Cleanliness estimate: 1-5
4. Notable features: plants, pets-allowed, gaming-setup, workspace, balcony

Return JSON: { "attributes": string[], "vibes": string[], "cleanliness": number, "features": string[] }`,
      userPromptTemplate: 'Analyze these apartment images: {imageUrls}'
    },
    userAnalysis: {
      systemPrompt: `You are a personality analyzer for a roommate matching app.
Analyze the user's photos and bio to extract personality traits:
1. Social style: extrovert, introvert, ambivert
2. Lifestyle: party-animal, chill, studious, fitness, artistic, gamer, foodie
3. Habits indicators: early-bird, night-owl, organized, pet-lover

Return JSON: { "traits": string[], "socialStyle": string, "lifestyle": string[] }`,
      userPromptTemplate: 'Analyze this user. Photos: {imageUrls}. Bio: {bio}'
    }
  },

  matching: {
    itemCompatibility: 0.7,
    providerCompatibility: 0.3,
    minScoreThreshold: 50
  },

  labels: {
    item: { singular: 'Apartment', plural: 'Apartments' },
    provider: { singular: 'Roommate', plural: 'Roommates' },
    seeker: { singular: 'Seeker', plural: 'Seekers' },
    action: { like: 'Interested', dislike: 'Pass' }
  }
};
```

---

### Step 1.3: Config Loader
**File**: `apps/server/src/config/domains/index.ts`

```typescript
import { DomainConfig, DomainType } from '../domain.config';
import { zzzimeriConfig } from './zzzimeri.config';

const configs: Record<DomainType, DomainConfig> = {
  zzzimeri: zzzimeriConfig,
  tradey: zzzimeriConfig // TODO: Create tradey config later
};

export function loadDomainConfig(): DomainConfig {
  const domainType = (process.env.DOMAIN_TYPE || 'zzzimeri') as DomainType;

  const config = configs[domainType];
  if (!config) {
    throw new Error(`Unknown domain type: ${domainType}`);
  }

  console.log(`✅ Loaded domain config: ${domainType}`);
  return config;
}

export { DomainConfig, DomainType };
```

---

## 📦 Phase 2: Core Domain Entities (1h)

### Step 2.1: Entity Interfaces
**File**: `apps/server/src/core/domain/entities/User.entity.ts`

```typescript
export type UserRole = 'provider' | 'seeker';

export interface UserPreferences {
  budget: { min: number; max: number };
  location: { city: string; radius: number; lat?: number; lng?: number };
  moveInDate?: string;
  lifestyle: {
    smoker: boolean;
    pets: boolean;
    earlyBird: boolean;
    cleanliness: number; // 1-5
  };
}

export interface User {
  id: string;
  clerkId?: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  images: string[];
  attributes: string[];      // AI-extracted traits
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

---

**File**: `apps/server/src/core/domain/entities/Item.entity.ts`

```typescript
export type ItemStatus = 'active' | 'rented' | 'removed';

export interface ItemLocation {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Item {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  size?: number;           // m2
  location: ItemLocation;
  images: string[];
  attributes: string[];    // AI-extracted: ["modern", "bright"]
  vibes: string[];         // AI-extracted: ["chill", "quiet"]
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

---

**File**: `apps/server/src/core/domain/entities/Interaction.entity.ts`

```typescript
export type InteractionType = 'like' | 'dislike' | 'super_like';

export interface Interaction {
  id: string;
  userId: string;
  itemId: string;
  type: InteractionType;
  createdAt: Date;
}
```

---

**File**: `apps/server/src/core/domain/entities/Match.entity.ts`

```typescript
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface MatchScore {
  total: number;
  itemCompatibility: number;
  providerCompatibility: number;
  reasons: string[];
}

export interface Match {
  id: string;
  seekerId: string;
  providerId: string;
  itemId: string;
  score: MatchScore;
  status: MatchStatus;
  createdAt: Date;
  acceptedAt?: Date;
}
```

---

**File**: `apps/server/src/core/domain/entities/Message.entity.ts`

```typescript
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
}
```

---

**File**: `apps/server/src/core/domain/entities/index.ts`

```typescript
export * from './User.entity';
export * from './Item.entity';
export * from './Interaction.entity';
export * from './Match.entity';
export * from './Message.entity';
```

---

## 📦 Phase 3: Repository Interfaces (30min)

**File**: `apps/server/src/core/repositories/IRepository.base.ts`

```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

---

**File**: `apps/server/src/core/repositories/IUserRepository.ts`

```typescript
import { User, UserPreferences } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  updatePreferences(id: string, preferences: UserPreferences): Promise<User>;
  addAttributes(id: string, attributes: string[]): Promise<User>;
}
```

---

**File**: `apps/server/src/core/repositories/IItemRepository.ts`

```typescript
import { Item, ItemStatus } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface FindItemsOptions {
  status?: ItemStatus;
  providerId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: string[];
  excludeIds?: string[];
  limit?: number;
  offset?: number;
}

export interface IItemRepository extends IRepository<Item> {
  findByProviderId(providerId: string): Promise<Item[]>;
  findMany(options: FindItemsOptions): Promise<Item[]>;
  addAttributes(id: string, attributes: string[], vibes: string[]): Promise<Item>;
  updateStatus(id: string, status: ItemStatus): Promise<Item>;
}
```

---

**File**: `apps/server/src/core/repositories/IInteractionRepository.ts`

```typescript
import { Interaction, InteractionType } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IInteractionRepository extends IRepository<Interaction> {
  findByUserId(userId: string): Promise<Interaction[]>;
  findByItemId(itemId: string): Promise<Interaction[]>;
  hasUserInteracted(userId: string, itemId: string): Promise<boolean>;
  getSwipedItemIds(userId: string): Promise<string[]>;
}
```

---

**File**: `apps/server/src/core/repositories/IMatchRepository.ts`

```typescript
import { Match, MatchStatus } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IMatchRepository extends IRepository<Match> {
  findBySeekerId(seekerId: string): Promise<Match[]>;
  findByProviderId(providerId: string): Promise<Match[]>;
  findByUserIds(seekerId: string, providerId: string, itemId: string): Promise<Match | null>;
  updateStatus(id: string, status: MatchStatus): Promise<Match>;
}
```

---

**File**: `apps/server/src/core/repositories/IMessageRepository.ts`

```typescript
import { Message } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IMessageRepository extends IRepository<Message> {
  findByMatchId(matchId: string, limit?: number, offset?: number): Promise<Message[]>;
  markAsRead(messageId: string): Promise<Message>;
  getUnreadCount(userId: string): Promise<number>;
}
```

---

**File**: `apps/server/src/core/repositories/index.ts`

```typescript
export * from './IRepository.base';
export * from './IUserRepository';
export * from './IItemRepository';
export * from './IInteractionRepository';
export * from './IMatchRepository';
export * from './IMessageRepository';
```

---

## 📦 Phase 4: Neo4j Setup + Schema (1h)

### Step 4.1: Neo4j Connection
**File**: `apps/server/src/infrastructure/database/neo4j/Neo4jConnection.ts`

```typescript
import neo4j, { Driver, Session, Result } from 'neo4j-driver';

class Neo4jConnection {
  private static instance: Neo4jConnection;
  private driver: Driver | null = null;

  private constructor() {}

  static getInstance(): Neo4jConnection {
    if (!Neo4jConnection.instance) {
      Neo4jConnection.instance = new Neo4jConnection();
    }
    return Neo4jConnection.instance;
  }

  async connect(): Promise<void> {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Missing Neo4j environment variables');
    }

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    // Verify connection
    await this.driver.verifyConnectivity();
    console.log('✅ Connected to Neo4j');
  }

  getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session();
  }

  async executeQuery<T = any>(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result: Result = await session.run(cypher, params);
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async executeWrite<T = any>(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.executeWrite(tx => tx.run(cypher, params));
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('Neo4j connection closed');
    }
  }
}

export const neo4jConnection = Neo4jConnection.getInstance();
```

---

### Step 4.2: Database Schema Migration
**File**: `apps/server/src/infrastructure/database/neo4j/migrations/001_initial_schema.cypher`

```cypher
// ============================================
// ZZZimeri Neo4j Schema - Run in Neo4j Browser
// ============================================

// --- CONSTRAINTS (Unique IDs) ---
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT item_id IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE;
CREATE CONSTRAINT attribute_name IF NOT EXISTS FOR (a:Attribute) REQUIRE a.name IS UNIQUE;
CREATE CONSTRAINT match_id IF NOT EXISTS FOR (m:Match) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT message_id IF NOT EXISTS FOR (msg:Message) REQUIRE msg.id IS UNIQUE;

// --- INDEXES ---
CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
CREATE INDEX user_clerk_id IF NOT EXISTS FOR (u:User) ON (u.clerkId);
CREATE INDEX user_role IF NOT EXISTS FOR (u:User) ON (u.role);
CREATE INDEX item_status IF NOT EXISTS FOR (i:Item) ON (i.status);
CREATE INDEX item_provider IF NOT EXISTS FOR (i:Item) ON (i.providerId);
CREATE INDEX item_city IF NOT EXISTS FOR (i:Item) ON (i.city);
CREATE INDEX item_price IF NOT EXISTS FOR (i:Item) ON (i.price);
CREATE INDEX match_status IF NOT EXISTS FOR (m:Match) ON (m.status);
CREATE INDEX message_match IF NOT EXISTS FOR (msg:Message) ON (msg.matchId);

// --- FULLTEXT SEARCH (optional) ---
CREATE FULLTEXT INDEX item_search IF NOT EXISTS FOR (i:Item) ON EACH [i.title, i.description];

// --- SAMPLE DATA (for testing) ---
// Provider user
CREATE (p:User {
  id: 'provider-1',
  email: 'marko@test.com',
  name: 'Marko Marković',
  role: 'provider',
  bio: 'Organizovan i tih cimer',
  images: ['https://example.com/marko.jpg'],
  attributes: ['organized', 'quiet', 'early-bird'],
  createdAt: datetime(),
  updatedAt: datetime()
});

// Seeker user
CREATE (s:User {
  id: 'seeker-1',
  email: 'jana@test.com',
  name: 'Jana Janić',
  role: 'seeker',
  bio: 'Studentkinja, volim red',
  images: ['https://example.com/jana.jpg'],
  attributes: ['studious', 'organized', 'introvert'],
  budgetMin: 200,
  budgetMax: 400,
  preferredCity: 'Beograd',
  searchRadius: 10,
  createdAt: datetime(),
  updatedAt: datetime()
});

// Apartment
CREATE (a:Item {
  id: 'apt-1',
  providerId: 'provider-1',
  title: 'Moderna soba na Vračaru',
  description: 'Svetla soba, internet uključen',
  price: 300,
  size: 15,
  address: 'Njegoševa 50',
  city: 'Beograd',
  lat: 44.8025,
  lng: 20.4764,
  images: ['https://example.com/apt1.jpg'],
  attributes: ['modern', 'bright', 'minimalist'],
  vibes: ['quiet', 'studious'],
  status: 'active',
  createdAt: datetime(),
  updatedAt: datetime()
});

// Create relationships
MATCH (p:User {id: 'provider-1'}), (a:Item {id: 'apt-1'})
CREATE (p)-[:OWNS]->(a);

// Create Attribute nodes
MERGE (attr1:Attribute {name: 'modern'});
MERGE (attr2:Attribute {name: 'bright'});
MERGE (attr3:Attribute {name: 'minimalist'});
MERGE (attr4:Attribute {name: 'quiet'});
MERGE (attr5:Attribute {name: 'organized'});

// Link attributes to item
MATCH (a:Item {id: 'apt-1'}), (attr:Attribute {name: 'modern'})
CREATE (a)-[:HAS_ATTRIBUTE]->(attr);
MATCH (a:Item {id: 'apt-1'}), (attr:Attribute {name: 'bright'})
CREATE (a)-[:HAS_ATTRIBUTE]->(attr);
```

---

## 📦 Phase 5: DTOs + Validation (1.5h)

**File**: `apps/server/src/api/http/dto/user.dto.ts`

```typescript
import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['provider', 'seeker']),
  clerkId: z.string().optional(),
  bio: z.string().max(500).optional(),
  images: z.array(z.string().url()).max(5).optional()
});

export const UpdateUserPreferencesDto = z.object({
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.max >= data.min, {
    message: 'Max budget must be >= min budget'
  }),
  location: z.object({
    city: z.string(),
    radius: z.number().min(1).max(50),
    lat: z.number().optional(),
    lng: z.number().optional()
  }),
  moveInDate: z.string().datetime().optional(),
  lifestyle: z.object({
    smoker: z.boolean(),
    pets: z.boolean(),
    earlyBird: z.boolean(),
    cleanliness: z.number().min(1).max(5)
  })
});

export const AnalyzeUserDto = z.object({
  images: z.array(z.string().url()).min(1).max(5),
  bio: z.string().optional()
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesDto>;
export type AnalyzeUserInput = z.infer<typeof AnalyzeUserDto>;
```

---

**File**: `apps/server/src/api/http/dto/item.dto.ts`

```typescript
import { z } from 'zod';

export const CreateItemDto = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0),
  size: z.number().min(0).optional(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  images: z.array(z.string().url()).min(1).max(10)
});

export const UpdateItemDto = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  size: z.number().min(0).optional(),
  status: z.enum(['active', 'rented', 'removed']).optional()
});

export type CreateItemInput = z.infer<typeof CreateItemDto>;
export type UpdateItemInput = z.infer<typeof UpdateItemDto>;
```

---

**File**: `apps/server/src/api/http/dto/interaction.dto.ts`

```typescript
import { z } from 'zod';

export const SwipeDto = z.object({
  itemId: z.string().uuid(),
  action: z.enum(['like', 'dislike', 'super_like'])
});

export type SwipeInput = z.infer<typeof SwipeDto>;
```

---

**File**: `apps/server/src/api/http/dto/message.dto.ts`

```typescript
import { z } from 'zod';

export const SendMessageDto = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1).max(2000)
});

export type SendMessageInput = z.infer<typeof SendMessageDto>;
```

---

**File**: `apps/server/src/api/http/dto/index.ts`

```typescript
export * from './user.dto';
export * from './item.dto';
export * from './interaction.dto';
export * from './message.dto';
```

---

## 📦 Phase 6: Middleware (1h)

**File**: `apps/server/src/api/http/middleware/validation.middleware.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      throw error;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors
        });
      }
      throw error;
    }
  };
}
```

---

**File**: `apps/server/src/api/http/middleware/error-handler.middleware.ts`

```typescript
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code
    });
  }

  // Neo4j errors
  if (error.name === 'Neo4jError') {
    return reply.status(500).send({
      error: 'Database error',
      code: 'DB_ERROR'
    });
  }

  // Default error
  return reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}
```

---

**File**: `apps/server/src/api/http/middleware/auth.middleware.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler.middleware';

// Simplified auth for hackathon - just extract user ID from header
// In production, use Clerk SDK to verify JWT

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
  userRole: 'provider' | 'seeker';
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // For hackathon: use simple header-based auth
  // Header: X-User-Id: user-123
  // Header: X-User-Role: seeker

  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as 'provider' | 'seeker';

  if (!userId) {
    throw new AppError(401, 'Missing X-User-Id header', 'UNAUTHORIZED');
  }

  (request as AuthenticatedRequest).userId = userId;
  (request as AuthenticatedRequest).userRole = userRole || 'seeker';
}

// Optional auth - doesn't fail if not present
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as 'provider' | 'seeker';

  if (userId) {
    (request as AuthenticatedRequest).userId = userId;
    (request as AuthenticatedRequest).userRole = userRole || 'seeker';
  }
}
```

---

**File**: `apps/server/src/api/http/middleware/index.ts`

```typescript
export * from './validation.middleware';
export * from './error-handler.middleware';
export * from './auth.middleware';
```

---

## 📦 Phase 7: Routes Setup (1h)

**File**: `apps/server/src/api/http/routes/user.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { CreateUserDto, UpdateUserPreferencesDto, AnalyzeUserDto } from '../dto';
import { validateBody } from '../middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware';

export async function userRoutes(fastify: FastifyInstance) {
  // Create user
  fastify.post('/', {
    preHandler: [validateBody(CreateUserDto)]
  }, async (request, reply) => {
    // TODO: Legion implements controller
    return { message: 'Create user - Legion implements' };
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { userId };
  });

  // Update preferences
  fastify.patch('/:id/preferences', {
    preHandler: [authMiddleware, validateBody(UpdateUserPreferencesDto)]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Update preferences - Legion implements' };
  });

  // Analyze user photos
  fastify.post('/:id/analyze', {
    preHandler: [authMiddleware, validateBody(AnalyzeUserDto)]
  }, async (request, reply) => {
    // TODO: Legion implements AI
    return { message: 'Analyze user - Legion implements' };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/item.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { CreateItemDto, UpdateItemDto } from '../dto';
import { validateBody, authMiddleware, AuthenticatedRequest } from '../middleware';

export async function itemRoutes(fastify: FastifyInstance) {
  // Create item (apartment)
  fastify.post('/', {
    preHandler: [authMiddleware, validateBody(CreateItemDto)]
  }, async (request, reply) => {
    // TODO: Legion implements + AI analysis
    return { message: 'Create item - Legion implements' };
  });

  // Get item by ID
  fastify.get('/:id', async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Get item - Legion implements' };
  });

  // Update item
  fastify.patch('/:id', {
    preHandler: [authMiddleware, validateBody(UpdateItemDto)]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Update item - Legion implements' };
  });

  // Delete item
  fastify.delete('/:id', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Delete item - Legion implements' };
  });

  // Get provider's items
  fastify.get('/provider/:providerId', async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Get provider items - Legion implements' };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/feed.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, validateQuery, AuthenticatedRequest } from '../middleware';

const FeedQueryDto = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0)
});

export async function feedRoutes(fastify: FastifyInstance) {
  // Get personalized feed
  fastify.get('/', {
    preHandler: [authMiddleware, validateQuery(FeedQueryDto)]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = request.query as z.infer<typeof FeedQueryDto>;

    // TODO: Legion implements matching algorithm
    return {
      message: 'Get feed - Legion implements',
      userId,
      limit,
      offset
    };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/interaction.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { SwipeDto } from '../dto';
import { validateBody, authMiddleware, AuthenticatedRequest } from '../middleware';

export async function interactionRoutes(fastify: FastifyInstance) {
  // Record swipe
  fastify.post('/swipe', {
    preHandler: [authMiddleware, validateBody(SwipeDto)]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Swipe - Legion implements', userId };
  });

  // Get swipe history
  fastify.get('/history', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'History - Legion implements', userId };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/match.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { authMiddleware, AuthenticatedRequest } from '../middleware';

export async function matchRoutes(fastify: FastifyInstance) {
  // Get user's matches
  fastify.get('/', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Get matches - Legion implements', userId };
  });

  // Accept match
  fastify.post('/:matchId/accept', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Accept match - Legion implements' };
  });

  // Reject match
  fastify.post('/:matchId/reject', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Reject match - Legion implements' };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/message.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { SendMessageDto } from '../dto';
import { validateBody, authMiddleware, AuthenticatedRequest } from '../middleware';

export async function messageRoutes(fastify: FastifyInstance) {
  // Send message
  fastify.post('/', {
    preHandler: [authMiddleware, validateBody(SendMessageDto)]
  }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    // TODO: Legion implements
    return { message: 'Send message - Legion implements', userId };
  });

  // Get conversation
  fastify.get('/:matchId', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    // TODO: Legion implements
    return { message: 'Get messages - Legion implements' };
  });
}
```

---

**File**: `apps/server/src/api/http/routes/index.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.routes';
import { itemRoutes } from './item.routes';
import { feedRoutes } from './feed.routes';
import { interactionRoutes } from './interaction.routes';
import { matchRoutes } from './match.routes';
import { messageRoutes } from './message.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));

  // API v1 routes
  fastify.register(async (api) => {
    api.register(userRoutes, { prefix: '/users' });
    api.register(itemRoutes, { prefix: '/items' });
    api.register(feedRoutes, { prefix: '/feed' });
    api.register(interactionRoutes, { prefix: '/interactions' });
    api.register(matchRoutes, { prefix: '/matches' });
    api.register(messageRoutes, { prefix: '/messages' });
  }, { prefix: '/api/v1' });
}
```

---

## 📦 Phase 8: Serializers (30min)

**File**: `apps/server/src/api/http/serializers/item.serializer.ts`

```typescript
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
```

---

**File**: `apps/server/src/api/http/serializers/feed.serializer.ts`

```typescript
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
```

---

**File**: `apps/server/src/api/http/serializers/index.ts`

```typescript
export * from './item.serializer';
export * from './feed.serializer';
```

---

## 📦 Phase 9: Update Server Entry Point (30min)

**File**: `apps/server/src/app.ts` (UPDATE existing file)

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { neo4jConnection } from './infrastructure/database/neo4j/Neo4jConnection';
import { loadDomainConfig } from './config/domains';
import { registerRoutes } from './api/http/routes';
import { errorHandler } from './api/http/middleware';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Load domain config
const domainConfig = loadDomainConfig();

// Make config available globally
app.decorate('domainConfig', domainConfig);

// Plugins
app.register(cors, { origin: true });

// Error handler
app.setErrorHandler(errorHandler);

// Routes
app.register(registerRoutes);

// Startup
const start = async () => {
  try {
    // Connect to Neo4j
    await neo4jConnection.connect();

    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });

    console.log('');
    console.log('🚀 ZZZimeri API Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Domain: ${domainConfig.type}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📚 API:    http://localhost:${port}/api/v1`);
    console.log(`💚 Health: http://localhost:${port}/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await neo4jConnection.close();
  await app.close();
  process.exit(0);
});

start();
```

---

## 📦 Phase 10: DI Container Shell (30min)

**File**: `apps/server/src/container/Container.ts`

```typescript
import { DomainConfig } from '../config/domain.config';
import { loadDomainConfig } from '../config/domains';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';

// Repository interfaces
import {
  IUserRepository,
  IItemRepository,
  IInteractionRepository,
  IMatchRepository,
  IMessageRepository
} from '../core/repositories';

/**
 * Dependency Injection Container
 * DELL sets up the shell, LEGION implements the actual repositories/services
 */
class Container {
  private static instance: Container;

  // Config
  public domainConfig: DomainConfig;

  // Repositories (LEGION implements these)
  public userRepository!: IUserRepository;
  public itemRepository!: IItemRepository;
  public interactionRepository!: IInteractionRepository;
  public matchRepository!: IMatchRepository;
  public messageRepository!: IMessageRepository;

  // Services (LEGION implements these)
  // public visionService!: VisionService;
  // public matchingEngine!: MatchingEngine;
  // public feedService!: FeedService;

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

    // TODO: LEGION initializes repositories here
    // this.userRepository = new Neo4jUserRepository(neo4jConnection);
    // this.itemRepository = new Neo4jItemRepository(neo4jConnection);
    // etc.

    console.log('✅ Container initialized');
  }
}

export const container = Container.getInstance();
```

---

## ✅ DELL Checklist

- [ ] Phase 1: Domain Configuration System
  - [ ] `domain.config.ts` - types
  - [ ] `zzzimeri.config.ts` - config values
  - [ ] `domains/index.ts` - loader

- [ ] Phase 2: Core Domain Entities
  - [ ] `User.entity.ts`
  - [ ] `Item.entity.ts`
  - [ ] `Interaction.entity.ts`
  - [ ] `Match.entity.ts`
  - [ ] `Message.entity.ts`

- [ ] Phase 3: Repository Interfaces
  - [ ] `IRepository.base.ts`
  - [ ] `IUserRepository.ts`
  - [ ] `IItemRepository.ts`
  - [ ] `IInteractionRepository.ts`
  - [ ] `IMatchRepository.ts`
  - [ ] `IMessageRepository.ts`

- [ ] Phase 4: Neo4j Setup
  - [ ] `Neo4jConnection.ts`
  - [ ] `001_initial_schema.cypher`

- [ ] Phase 5: DTOs
  - [ ] `user.dto.ts`
  - [ ] `item.dto.ts`
  - [ ] `interaction.dto.ts`
  - [ ] `message.dto.ts`

- [ ] Phase 6: Middleware
  - [ ] `validation.middleware.ts`
  - [ ] `error-handler.middleware.ts`
  - [ ] `auth.middleware.ts`

- [ ] Phase 7: Routes
  - [ ] `user.routes.ts`
  - [ ] `item.routes.ts`
  - [ ] `feed.routes.ts`
  - [ ] `interaction.routes.ts`
  - [ ] `match.routes.ts`
  - [ ] `message.routes.ts`
  - [ ] `routes/index.ts`

- [ ] Phase 8: Serializers
  - [ ] `item.serializer.ts`
  - [ ] `feed.serializer.ts`

- [ ] Phase 9: Update `app.ts`

- [ ] Phase 10: DI Container shell

---

## 📁 Final DELL Folder Structure

```
apps/server/src/
├── config/
│   ├── domain.config.ts          ← DELL
│   └── domains/
│       ├── zzzimeri.config.ts    ← DELL
│       └── index.ts              ← DELL
├── core/
│   ├── domain/
│   │   └── entities/
│   │       ├── User.entity.ts    ← DELL
│   │       ├── Item.entity.ts    ← DELL
│   │       ├── Interaction.entity.ts ← DELL
│   │       ├── Match.entity.ts   ← DELL
│   │       ├── Message.entity.ts ← DELL
│   │       └── index.ts          ← DELL
│   └── repositories/
│       ├── IRepository.base.ts   ← DELL
│       ├── IUserRepository.ts    ← DELL
│       ├── IItemRepository.ts    ← DELL
│       ├── IInteractionRepository.ts ← DELL
│       ├── IMatchRepository.ts   ← DELL
│       ├── IMessageRepository.ts ← DELL
│       └── index.ts              ← DELL
├── infrastructure/
│   └── database/
│       └── neo4j/
│           ├── Neo4jConnection.ts ← DELL
│           └── migrations/
│               └── 001_initial_schema.cypher ← DELL
├── api/
│   └── http/
│       ├── dto/
│       │   ├── user.dto.ts       ← DELL
│       │   ├── item.dto.ts       ← DELL
│       │   ├── interaction.dto.ts ← DELL
│       │   ├── message.dto.ts    ← DELL
│       │   └── index.ts          ← DELL
│       ├── middleware/
│       │   ├── validation.middleware.ts ← DELL
│       │   ├── error-handler.middleware.ts ← DELL
│       │   ├── auth.middleware.ts ← DELL
│       │   └── index.ts          ← DELL
│       ├── routes/
│       │   ├── user.routes.ts    ← DELL
│       │   ├── item.routes.ts    ← DELL
│       │   ├── feed.routes.ts    ← DELL
│       │   ├── interaction.routes.ts ← DELL
│       │   ├── match.routes.ts   ← DELL
│       │   ├── message.routes.ts ← DELL
│       │   └── index.ts          ← DELL
│       └── serializers/
│           ├── item.serializer.ts ← DELL
│           ├── feed.serializer.ts ← DELL
│           └── index.ts          ← DELL
├── container/
│   └── Container.ts              ← DELL (shell only)
└── app.ts                        ← DELL (update)
```

---

**Kada završiš DELL taskove, javi LEGION-u da može da nastavi sa implementacijom!** 🚀
