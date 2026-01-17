Claude’s Plan
ZZZimeri Implementation Plan
Domain-Agnostic Visual Matching Platform
📋 Executive Summary
We are building ZZZimeri (Tinder za stanove i cimere) - a roommate/apartment matching app for a hackathon. However, the architecture is designed to be 90% reusable for the future project Tradey (fashion marketplace).

Core Strategy: Build a domain-agnostic "Visual Matching Engine" where only configuration changes between projects.

Key Architectural Principles:

Generic entity naming (Item, Provider, Seeker, Attribute, Acquire)
Configuration-driven behavior (vision prompts, UI labels, matching weights)
Pluggable matching strategies (Graph for ZZZimeri, Vector for Tradey later)
Clean separation: Core → Use Cases → Infrastructure → API
🎯 Project Context
Current Implementation (MVP): ZZZimeri
What: Roommate/apartment matching using AI vision analysis + Neo4j graph matching
Users: Landlords (Providers) post apartments, Renters (Seekers) swipe to find matches
Tech: React Native (Expo), Node.js (Fastify), Neo4j, OpenAI Vision
Timeline: Hackathon (speed matters!)
Future Implementation: Tradey
What: Second-hand fashion marketplace with credits system
Difference: Vector similarity search, PostgreSQL for transactions
Goal: Reuse 90% of ZZZimeri code by switching domain config
🏗️ Architecture Overview
File Structure (apps/server/src)

apps/server/src/
├── config/
│   ├── domain.config.ts              # Core configuration interface
│   ├── domains/
│   │   ├── zzzimeri.config.ts       # ZZZimeri-specific config
│   │   ├── tradey.config.ts         # Tradey config (future)
│   │   └── index.ts                 # Config loader
│   └── database.config.ts
│
├── core/                             # Domain-agnostic layer (90% reusable)
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Item.entity.ts       # Generic item (Apartment/Clothing)
│   │   │   ├── User.entity.ts       # Provider/Seeker roles
│   │   │   ├── Attribute.entity.ts  # Vibe/Style tag
│   │   │   ├── Interaction.entity.ts
│   │   │   └── Match.entity.ts
│   │   └── value-objects/
│   │       ├── Location.vo.ts
│   │       ├── Price.vo.ts
│   │       └── Score.vo.ts
│   │
│   ├── repositories/                 # Repository interfaces (ports)
│   │   ├── IItemRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── IInteractionRepository.ts
│   │   ├── IMatchRepository.ts
│   │   └── IRepository.base.ts
│   │
│   ├── services/
│   │   ├── matching/
│   │   │   ├── IMatchingStrategy.ts
│   │   │   ├── MatchingEngine.ts
│   │   │   ├── strategies/
│   │   │   │   ├── GraphMatchingStrategy.ts
│   │   │   │   └── VectorMatchingStrategy.ts (future)
│   │   │   └── scoring/
│   │   │       ├── ScoreCalculator.ts
│   │   │       └── ScoreAggregator.ts
│   │   ├── vision/
│   │   │   ├── IVisionService.ts
│   │   │   ├── VisionService.ts
│   │   │   ├── PromptBuilder.ts
│   │   │   └── TagExtractor.ts
│   │   ├── recommendation/
│   │   │   ├── FeedService.ts
│   │   │   └── RankingService.ts
│   │   └── notification/
│   │       └── NotificationService.ts
│   │
│   └── use-cases/
│       ├── item/
│       │   ├── CreateItem.usecase.ts
│       │   ├── AnalyzeItemImages.usecase.ts
│       │   └── GetItem.usecase.ts
│       ├── user/
│       │   ├── CreateUser.usecase.ts
│       │   ├── UpdatePreferences.usecase.ts
│       │   └── AnalyzeUserProfile.usecase.ts
│       ├── interaction/
│       │   ├── RecordInteraction.usecase.ts
│       │   └── GetInteractionHistory.usecase.ts
│       ├── matching/
│       │   ├── CalculateMatch.usecase.ts
│       │   ├── GetMatches.usecase.ts
│       │   └── GetFeed.usecase.ts
│       └── messaging/
│           ├── SendMessage.usecase.ts
│           └── GetMessages.usecase.ts
│
├── infrastructure/                   # Framework adapters
│   ├── database/
│   │   ├── neo4j/
│   │   │   ├── Neo4jConnection.ts
│   │   │   ├── Neo4jQueryBuilder.ts
│   │   │   ├── repositories/
│   │   │   │   ├── Neo4jItemRepository.ts
│   │   │   │   ├── Neo4jUserRepository.ts
│   │   │   │   ├── Neo4jInteractionRepository.ts
│   │   │   │   └── Neo4jMatchRepository.ts
│   │   │   ├── mappers/
│   │   │   │   ├── ItemMapper.ts
│   │   │   │   ├── UserMapper.ts
│   │   │   │   └── AttributeMapper.ts
│   │   │   └── migrations/
│   │   │       └── 001_initial_schema.cypher
│   │   └── postgres/                # Future: Tradey credits
│   │       └── repositories/
│   │           └── PostgresTransactionRepository.ts
│   ├── external-services/
│   │   ├── openai/
│   │   │   ├── OpenAIClient.ts
│   │   │   └── OpenAIVisionAdapter.ts
│   │   ├── cloudinary/
│   │   │   ├── CloudinaryClient.ts
│   │   │   └── ImageUploadService.ts
│   │   └── clerk/
│   │       └── ClerkAuthService.ts
│   └── messaging/
│       ├── SocketIOServer.ts
│       └── MessageBroker.ts
│
├── api/                              # HTTP/WebSocket layer
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── ItemController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── InteractionController.ts
│   │   │   ├── MatchController.ts
│   │   │   ├── FeedController.ts
│   │   │   └── MessageController.ts
│   │   ├── routes/
│   │   │   ├── item.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── interaction.routes.ts
│   │   │   ├── match.routes.ts
│   │   │   ├── feed.routes.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── dto/
│   │   │   ├── CreateItemDto.ts
│   │   │   ├── UpdateItemDto.ts
│   │   │   └── InteractionDto.ts
│   │   └── serializers/
│   │       ├── ItemSerializer.ts
│   │       ├── MatchSerializer.ts
│   │       └── FeedSerializer.ts
│   └── websocket/
│       ├── handlers/
│       │   ├── MessageHandler.ts
│       │   └── MatchNotificationHandler.ts
│       └── events/
│           └── SocketEvents.ts
│
├── shared/
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── error.ts
│   │   └── validation.ts
│   └── constants/
│       └── errors.constants.ts
│
└── container/                        # Dependency Injection
    ├── Container.ts
    ├── bindings.ts
    └── factories/
        ├── RepositoryFactory.ts
        └── MatchingStrategyFactory.ts
📦 Implementation Phases
Phase 1: Configuration Layer (Foundation)
Goal: Create domain configuration system that controls all domain-specific behavior

Step 1.1: Core Configuration Interface
File: src/config/domain.config.ts

Define the master configuration interface:

DomainType enum (ZZZIMERI, TRADEY)
MatchingStrategyType enum (GRAPH, VECTOR, HYBRID)
VisionPromptConfig interface (system prompts, attribute categories)
UILabelsConfig interface (entity names, action verbs)
MatchingWeightsConfig interface (item vs provider compatibility weights)
ItemSchemaConfig interface (required fields, constraints)
FeatureFlagsConfig interface (credits, vector search, etc.)
DomainConfig master interface combining all above
Step 1.2: ZZZimeri Configuration
File: src/config/domains/zzzimeri.config.ts

Implement ZZZimeri-specific configuration:


{
  domain: ZZZIMERI,
  vision: {
    itemAnalysis: {
      systemPrompt: "You are an expert interior design analyst...",
      userPromptTemplate: "Analyze these apartment images...",
      attributeCategories: ['architectural_style', 'interior_design', 'ambiance'],
      maxAttributes: 10
    },
    userAnalysis: {
      systemPrompt: "You are a personality analyst...",
      personalityTraits: ['extrovert', 'introvert', 'organized', ...]
    }
  },
  labels: {
    entities: { item: 'Apartment', provider: 'Landlord', seeker: 'Renter', attribute: 'Vibe' },
    actions: { acquire: 'Rent', list: 'List for Rent' }
  },
  matching: {
    strategy: GRAPH,
    weights: { itemCompatibility: 0.7, providerCompatibility: 0.3 },
    minScoreThreshold: 50
  },
  itemSchema: {
    type: 'apartment',
    requiredFields: ['price', 'size', 'location', 'images'],
    constraints: { price: { min: 0, max: 100000 }, images: { min: 1, max: 10 } }
  },
  database: { primary: NEO4J },
  features: {
    enableCreditsSystem: false,
    enableVectorSearch: false,
    enableRealtimeMatching: true
  }
}
Step 1.3: Configuration Loader
File: src/config/domains/index.ts

Create loader that reads DOMAIN_TYPE env var and returns appropriate config.

Phase 2: Core Domain Layer (Reusable Entities & Interfaces)
Goal: Define domain-agnostic entities and repository interfaces

Step 2.1: Core Entities
Files: src/core/domain/entities/*.entity.ts

Define TypeScript interfaces:

Item.entity.ts:

{
  id, type, providerId, price, images, description, location?,
  attributes: Attribute[], metadata: Record<string, any>,
  status: 'active' | 'acquired' | 'removed', createdAt, updatedAt
}
User.entity.ts:

{
  id, email, name, role: 'provider' | 'seeker' | 'both',
  preferences?: Record<string, any>, attributes: Attribute[],
  bio?, images, createdAt, updatedAt
}
Attribute.entity.ts:

{ id, name, category, confidence: 0-1, source: 'vision' | 'user' | 'inferred' }
Interaction.entity.ts:

{ id, userId, itemId, type: 'like' | 'dislike' | 'super_like', timestamp, metadata? }
Match.entity.ts:

{
  id, seekerId, itemId, providerId,
  score: { itemCompatibility, providerCompatibility, totalScore, reasons, breakdown },
  status: 'pending' | 'accepted' | 'rejected', createdAt, expiresAt?
}
Step 2.2: Value Objects
Files: src/core/domain/value-objects/*.vo.ts

Location.vo.ts: { address?, city?, lat?, lng? }
Price.vo.ts: Value object with validation
Score.vo.ts: Match score calculation logic
Step 2.3: Repository Interfaces (Ports)
Files: src/core/repositories/*.ts

Define interfaces for data access (hexagonal architecture):

IRepository<T>: Base with findById, findAll, create, update, delete
IItemRepository: Extends base + findByProviderId, findByAttributes, findNearby, addAttributes
IUserRepository: Extends base + findByEmail, findByRole, updatePreferences, addAttributes
IInteractionRepository: Extends base + findByUserId, findByItemId, hasUserInteracted
IMatchRepository: Extends base + findBySeekerId, findByProviderId, updateStatus
Phase 3: Services Layer (Business Logic)
Goal: Implement domain-agnostic services using configuration

Step 3.1: Vision Service
Files: src/core/services/vision/*

IVisionService.ts (Interface):


interface IVisionService {
  analyzeItem(images: string[], metadata?: any): Promise<VisionAnalysisResult>;
  analyzeUser(images: string[], bio?: string): Promise<VisionAnalysisResult>;
}
VisionService.ts (Implementation):

Constructor accepts OpenAI API key
analyzeItem():
Reads domainConfig.vision.itemAnalysis for system prompt and user prompt template
Calls OpenAI gpt-4o with vision
Parses JSON response { attributes: [...], confidence: 0.8 }
Converts to Attribute[] entities
Categorizes attributes using config.attributeCategories
Returns { attributes, confidence, rawResponse }
analyzeUser():
Reads domainConfig.vision.userAnalysis
Similar flow for personality trait extraction
PromptBuilder.ts:

Helper class to inject metadata into prompt templates
Example: Replace {metadata.price} placeholders in prompts
Step 3.2: Matching Engine (Strategy Pattern)
Files: src/core/services/matching/*

IMatchingStrategy.ts (Interface):


interface IMatchingStrategy {
  calculateMatch(seeker: User, item: Item, provider: User): Promise<MatchScore>;
  findBestMatches(seeker: User, items: Item[], limit: number): Promise<Match[]>;
  getName(): string;
}
MatchingEngine.ts (Orchestrator):

Accepts IMatchingStrategy in constructor
setStrategy(): Allows runtime strategy switching
calculateMatch(): Delegates to strategy
generateFeed():
Calls strategy's findBestMatches()
Filters by domainConfig.matching.minScoreThreshold
Returns ranked feed
GraphMatchingStrategy.ts (ZZZimeri Implementation):

calculateMatch():
Item Compatibility (70%):
Compare seeker's preferred attributes with item's attributes
Check price within budget (seeker.preferences.budget)
Check location proximity if applicable
Return score 0-100
Provider Compatibility (30%):
Jaccard similarity between seeker traits and provider traits
Return score 0-100
Weighted Total:

totalScore = (itemScore * 0.7) + (providerScore * 0.3)
Generate Reasons:
"Matching vibes: Modern, Minimalist"
"Within your budget range"
"Compatible landlord: Organized, Quiet"
Return MatchScore object
findBestMatches():
Loop through candidate items
Calculate score for each
Sort by total score descending
Return top N
VectorMatchingStrategy.ts (Tradey - Future):

Placeholder implementation that throws "Not implemented"
Will use vector embeddings for visual similarity
Step 3.3: Recommendation Services
Files: src/core/services/recommendation/*

FeedService.ts:

generatePersonalizedFeed(seeker: User, limit: number):
Fetch candidate items from repository (filters: status=active, not already interacted)
Call MatchingEngine.generateFeed()
Apply diversity logic (don't show only same provider)
Return ranked items with scores
RankingService.ts:

Helper service for re-ranking based on freshness, popularity
Future: A/B testing different ranking formulas
FilterService.ts:

Apply hard filters before matching:
Budget range
Location radius
Move-in date window
Step 3.4: Notification Service
Files: src/core/services/notification/*

NotificationService.ts:

notifyNewMatch(match: Match): Send notification to both users
notifyNewMessage(message: Message): Send real-time message notification
Integration with Socket.io (defined in infrastructure layer)
Phase 4: Use Cases Layer (Application Logic)
Goal: Define application use cases that orchestrate services

Step 4.1: Item Use Cases
Files: src/core/use-cases/item/*

CreateItem.usecase.ts:


class CreateItemUseCase {
  constructor(itemRepo: IItemRepository, visionService: IVisionService) {}

  async execute(input: CreateItemInput): Promise<Item> {
    // 1. Validate input against domainConfig.itemSchema
    // 2. Call visionService.analyzeItem(images, metadata)
    // 3. Create item entity with extracted attributes
    // 4. Save to itemRepo.create()
    // 5. Return created item
  }
}
AnalyzeItemImages.usecase.ts:

Re-analyze existing item images (for re-training or updates)
GetItem.usecase.ts:

Fetch item by ID
Include provider details
Include match score if seeker ID provided
Step 4.2: User Use Cases
Files: src/core/use-cases/user/*

CreateUser.usecase.ts:

Create user from auth provider (Clerk)
Initialize with role (provider/seeker)
UpdatePreferences.usecase.ts:

Update seeker preferences (budget, location, move-in date, lifestyle)
Validate against domain schema
AnalyzeUserProfile.usecase.ts:

Analyze user's profile images and bio
Extract personality traits via Vision AI
Save attributes to user entity
Step 4.3: Interaction Use Cases
Files: src/core/use-cases/interaction/*

RecordInteraction.usecase.ts:


async execute(userId: string, itemId: string, type: 'like' | 'dislike') {
  // 1. Check if interaction already exists
  // 2. Create interaction entity
  // 3. Save to interactionRepo
  // 4. If type === 'like', check for mutual match:
  //    - If provider also liked this seeker → Create Match
  //    - Notify both parties
  // 5. Return interaction
}
GetInteractionHistory.usecase.ts:

Fetch user's past interactions
Filter by type (likes, dislikes)
UndoInteraction.usecase.ts:

Delete last interaction (for "Undo" feature)
Step 4.4: Matching Use Cases
Files: src/core/use-cases/matching/*

CalculateMatch.usecase.ts:

Calculate match score between specific seeker and item
Use MatchingEngine
GetMatches.usecase.ts:

For providers: Get list of seekers who liked their items
For seekers: Get list of accepted matches
GetFeed.usecase.ts:


async execute(seekerId: string, limit: number = 20): Promise<FeedItem[]> {
  // 1. Fetch seeker from userRepo
  // 2. Apply hard filters (budget, location) via FilterService
  // 3. Get candidate items
  // 4. Call FeedService.generatePersonalizedFeed()
  // 5. Return ranked feed with scores and reasons
}
Step 4.5: Messaging Use Cases
Files: src/core/use-cases/messaging/*

SendMessage.usecase.ts:

Verify match exists between users
Create message entity
Save to database
Emit Socket.io event for real-time delivery
GetMessages.usecase.ts:

Fetch conversation history between two users
Mark messages as read
Phase 5: Infrastructure Layer (Adapters)
Goal: Implement repository interfaces and external service adapters

Step 5.1: Neo4j Connection
File: src/infrastructure/database/neo4j/Neo4jConnection.ts


class Neo4jConnection {
  private driver: Driver;

  constructor(config: { uri, user, password }) {
    this.driver = neo4j.driver(config.uri,
      neo4j.auth.basic(config.user, config.password)
    );
  }

  async executeQuery(query: string, params: any): Promise<any> {
    const session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records;
    } finally {
      await session.close();
    }
  }

  async close() { await this.driver.close(); }
}
Step 5.2: Neo4j Repositories
Files: src/infrastructure/database/neo4j/repositories/*

Neo4jItemRepository.ts (implements IItemRepository):


class Neo4jItemRepository implements IItemRepository {
  constructor(private connection: Neo4jConnection) {}

  async create(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    const query = `
      CREATE (i:Item {
        id: randomUUID(),
        type: $type,
        providerId: $providerId,
        price: $price,
        images: $images,
        description: $description,
        location: $location,
        metadata: $metadata,
        status: $status,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN i
    `;
    const result = await this.connection.executeQuery(query, data);
    const item = ItemMapper.toDomain(result[0].get('i'));

    // Create attribute relationships
    for (const attr of data.attributes) {
      await this.addAttributes(item.id, [attr]);
    }

    return item;
  }

  async findByAttributes(attributes: string[], matchAll = false): Promise<Item[]> {
    const operator = matchAll ? 'ALL' : 'ANY';
    const query = `
      MATCH (i:Item)-[r:HAS_ATTRIBUTE]->(a:Attribute)
      WHERE ${operator}(attrName IN $attributes WHERE a.name = attrName)
      RETURN DISTINCT i, collect(a) as attributes
    `;
    // ... implementation
  }

  async addAttributes(itemId: string, attributes: Attribute[]): Promise<void> {
    for (const attr of attributes) {
      const query = `
        MATCH (i:Item {id: $itemId})
        MERGE (a:Attribute {name: $name, category: $category, domain: $domain})
        MERGE (i)-[r:HAS_ATTRIBUTE {confidence: $confidence, source: $source}]->(a)
      `;
      await this.connection.executeQuery(query, {
        itemId,
        name: attr.name,
        category: attr.category,
        domain: domainConfig.domain,
        confidence: attr.confidence,
        source: attr.source
      });
    }
  }

  // ... other methods
}
Neo4jUserRepository.ts (implements IUserRepository):

Similar structure for User nodes
Methods: create, findByEmail, findByRole, updatePreferences, addAttributes
Neo4jInteractionRepository.ts (implements IInteractionRepository):

Create (:User)-[:LIKED|DISLIKED|SUPER_LIKED {timestamp}]->(:Item) relationships
Query methods for interaction history
Neo4jMatchRepository.ts (implements IMatchRepository):

Create Match nodes and relationships:

CREATE (m:Match {id, score, status, createdAt})
CREATE (seeker:User {id: $seekerId})-[:MATCHED_WITH]->(m)
CREATE (m)-[:FOR_ITEM]->(item:Item {id: $itemId})
CREATE (m)-[:WITH_PROVIDER]->(provider:User {id: $providerId})
Step 5.3: Neo4j Mappers
Files: src/infrastructure/database/neo4j/mappers/*

ItemMapper.ts:


class ItemMapper {
  static toDomain(node: any): Item {
    return {
      id: node.properties.id,
      type: node.properties.type,
      providerId: node.properties.providerId,
      price: node.properties.price,
      images: node.properties.images,
      description: node.properties.description,
      location: JSON.parse(node.properties.location || '{}'),
      attributes: [], // Populated separately
      metadata: JSON.parse(node.properties.metadata || '{}'),
      status: node.properties.status,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt)
    };
  }

  static toPersistence(item: Item): any {
    return {
      id: item.id,
      type: item.type,
      providerId: item.providerId,
      price: item.price,
      images: item.images,
      description: item.description,
      location: JSON.stringify(item.location || {}),
      metadata: JSON.stringify(item.metadata),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    };
  }
}
UserMapper.ts, AttributeMapper.ts: Similar structure

Step 5.4: Neo4j Schema Migration
File: src/infrastructure/database/neo4j/migrations/001_initial_schema.cypher


// Create constraints
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT item_id_unique IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE;
CREATE CONSTRAINT attribute_id_unique IF NOT EXISTS FOR (a:Attribute) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT match_id_unique IF NOT EXISTS FOR (m:Match) REQUIRE m.id IS UNIQUE;

// Create indexes
CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
CREATE INDEX user_role IF NOT EXISTS FOR (u:User) ON (u.role);
CREATE INDEX item_type IF NOT EXISTS FOR (i:Item) ON (i.type);
CREATE INDEX item_status IF NOT EXISTS FOR (i:Item) ON (i.status);
CREATE INDEX item_provider IF NOT EXISTS FOR (i:Item) ON (i.providerId);
CREATE INDEX attribute_name IF NOT EXISTS FOR (a:Attribute) ON (a.name);
CREATE INDEX attribute_category IF NOT EXISTS FOR (a:Attribute) ON (a.category);
CREATE INDEX match_status IF NOT EXISTS FOR (m:Match) ON (m.status);

// Full-text search
CREATE FULLTEXT INDEX itemDescriptions IF NOT EXISTS FOR (i:Item) ON EACH [i.description];
Step 5.5: External Service Adapters
Files: src/infrastructure/external-services/*

openai/OpenAIClient.ts:

Wrapper around OpenAI SDK
Handles API key, error handling, retries
openai/OpenAIVisionAdapter.ts:

Implements IVisionService
Uses OpenAIClient internally
cloudinary/ImageUploadService.ts:


class ImageUploadService {
  constructor(private cloudinary: Cloudinary) {}

  async uploadImage(file: Buffer, folder: string): Promise<string> {
    const result = await this.cloudinary.uploader.upload(file, {
      folder: `${domainConfig.domain}/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    return result.secure_url;
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}
clerk/ClerkAuthService.ts:

Verify JWT tokens
Extract user info from Clerk session
Step 5.6: Socket.io Server
File: src/infrastructure/messaging/SocketIOServer.ts


class SocketIOServer {
  private io: SocketIO;

  constructor(httpServer: any) {
    this.io = new SocketIO(httpServer, { cors: { origin: '*' } });
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join_room', ({ matchId }) => {
        socket.join(`match:${matchId}`);
      });

      socket.on('send_message', async ({ matchId, message }) => {
        this.io.to(`match:${matchId}`).emit('new_message', message);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  emitToMatch(matchId: string, event: string, data: any) {
    this.io.to(`match:${matchId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}
Phase 6: API Layer (Controllers & Routes)
Goal: Expose use cases via REST API

Step 6.1: Controllers
Files: src/api/http/controllers/*

ItemController.ts:


class ItemController {
  constructor(
    private createItemUseCase: CreateItemUseCase,
    private getItemUseCase: GetItemUseCase
  ) {}

  async createItem(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreateItemDto.parse(req.body);
      const item = await this.createItemUseCase.execute({
        providerId: req.user.id,
        ...data
      });
      reply.status(201).send(ItemSerializer.toResponse(item));
    } catch (error) {
      throw error; // Handled by error middleware
    }
  }

  async getItem(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const item = await this.getItemUseCase.execute(id);
    reply.send(ItemSerializer.toResponse(item));
  }
}
InteractionController.ts:


class InteractionController {
  constructor(private recordInteractionUseCase: RecordInteractionUseCase) {}

  async swipe(req: FastifyRequest, reply: FastifyReply) {
    const { itemId, action } = InteractionDto.parse(req.body);
    const interaction = await this.recordInteractionUseCase.execute(
      req.user.id,
      itemId,
      action
    );
    reply.status(201).send(interaction);
  }
}
FeedController.ts:


class FeedController {
  constructor(private getFeedUseCase: GetFeedUseCase) {}

  async getFeed(req: FastifyRequest, reply: FastifyReply) {
    const { limit = 20 } = req.query as { limit?: number };
    const feed = await this.getFeedUseCase.execute(req.user.id, limit);
    reply.send(FeedSerializer.toResponse(feed));
  }
}
MatchController.ts:


class MatchController {
  constructor(private getMatchesUseCase: GetMatchesUseCase) {}

  async getMatches(req: FastifyRequest, reply: FastifyReply) {
    const matches = await this.getMatchesUseCase.execute(req.user.id);
    reply.send(matches.map(MatchSerializer.toResponse));
  }

  async acceptMatch(req: FastifyRequest, reply: FastifyReply) {
    const { matchId } = req.params as { matchId: string };
    // Update match status to 'accepted'
    // Unlock chat
    reply.send({ success: true });
  }
}
MessageController.ts:


class MessageController {
  constructor(
    private sendMessageUseCase: SendMessageUseCase,
    private getMessagesUseCase: GetMessagesUseCase
  ) {}

  async sendMessage(req: FastifyRequest, reply: FastifyReply) {
    const { matchId, content } = req.body;
    const message = await this.sendMessageUseCase.execute({
      senderId: req.user.id,
      matchId,
      content
    });
    reply.status(201).send(message);
  }

  async getMessages(req: FastifyRequest, reply: FastifyReply) {
    const { matchId } = req.params;
    const messages = await this.getMessagesUseCase.execute(matchId);
    reply.send(messages);
  }
}
Step 6.2: DTOs (Data Transfer Objects)
Files: src/api/http/dto/*

CreateItemDto.ts:


import { z } from 'zod';

export const CreateItemDto = z.object({
  price: z.number().min(0),
  images: z.array(z.string().url()).min(1).max(10),
  description: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export type CreateItemDto = z.infer<typeof CreateItemDto>;
InteractionDto.ts:


export const InteractionDto = z.object({
  itemId: z.string().uuid(),
  action: z.enum(['like', 'dislike', 'super_like'])
});
UserPreferencesDto.ts:


export const UserPreferencesDto = z.object({
  budget: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  location: z.object({
    city: z.string(),
    radius: z.number() // km
  }).optional(),
  moveInDate: z.string().datetime().optional(),
  lifestyle: z.object({
    smoker: z.boolean().optional(),
    pets: z.boolean().optional(),
    cleanliness: z.number().min(1).max(5).optional(),
    sleepSchedule: z.enum(['early', 'late']).optional()
  }).optional()
});
Step 6.3: Serializers
Files: src/api/http/serializers/*

ItemSerializer.ts:


class ItemSerializer {
  static toResponse(item: Item, includeProvider = false): any {
    const labels = domainConfig.labels;

    return {
      id: item.id,
      type: labels.entities.item, // "Apartment" or "Clothing Item"
      price: item.price,
      images: item.images,
      description: item.description,
      location: item.location,
      attributes: item.attributes.map(attr => ({
        name: attr.name,
        category: attr.category,
        confidence: attr.confidence
      })),
      metadata: item.metadata,
      status: item.status,
      createdAt: item.createdAt,
      // ... include provider if requested
    };
  }
}
MatchSerializer.ts:


class MatchSerializer {
  static toResponse(match: Match, includeDetails = true): any {
    const labels = domainConfig.labels;

    return {
      id: match.id,
      score: {
        [labels.matching.itemCompatibility]: match.score.itemCompatibility,
        [labels.matching.providerCompatibility]: match.score.providerCompatibility,
        total: match.score.totalScore,
        reasons: match.score.reasons
      },
      status: match.status,
      createdAt: match.createdAt,
      // ... include item and provider details if requested
    };
  }
}
Step 6.4: Routes
Files: src/api/http/routes/*

item.routes.ts:


import { FastifyInstance } from 'fastify';

export function itemRoutes(app: FastifyInstance, container: Container) {
  const controller = new ItemController(
    container.get('createItemUseCase'),
    container.get('getItemUseCase')
  );

  app.post('/items', { preHandler: [authMiddleware] }, controller.createItem.bind(controller));
  app.get('/items/:id', controller.getItem.bind(controller));
  app.patch('/items/:id', { preHandler: [authMiddleware] }, controller.updateItem.bind(controller));
  app.delete('/items/:id', { preHandler: [authMiddleware] }, controller.deleteItem.bind(controller));
}
interaction.routes.ts:


export function interactionRoutes(app: FastifyInstance, container: Container) {
  const controller = new InteractionController(container.get('recordInteractionUseCase'));

  app.post('/interactions/swipe', { preHandler: [authMiddleware] }, controller.swipe.bind(controller));
  app.get('/interactions/history', { preHandler: [authMiddleware] }, controller.getHistory.bind(controller));
}
feed.routes.ts:


export function feedRoutes(app: FastifyInstance, container: Container) {
  const controller = new FeedController(container.get('getFeedUseCase'));

  app.get('/feed', { preHandler: [authMiddleware] }, controller.getFeed.bind(controller));
}
match.routes.ts:


export function matchRoutes(app: FastifyInstance, container: Container) {
  const controller = new MatchController(container.get('getMatchesUseCase'));

  app.get('/matches', { preHandler: [authMiddleware] }, controller.getMatches.bind(controller));
  app.post('/matches/:matchId/accept', { preHandler: [authMiddleware] }, controller.acceptMatch.bind(controller));
  app.post('/matches/:matchId/reject', { preHandler: [authMiddleware] }, controller.rejectMatch.bind(controller));
}
message.routes.ts:


export function messageRoutes(app: FastifyInstance, container: Container) {
  const controller = new MessageController(
    container.get('sendMessageUseCase'),
    container.get('getMessagesUseCase')
  );

  app.post('/messages', { preHandler: [authMiddleware] }, controller.sendMessage.bind(controller));
  app.get('/messages/:matchId', { preHandler: [authMiddleware] }, controller.getMessages.bind(controller));
}
index.ts (Route Aggregator):


import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance, container: Container) {
  app.register((instance, opts, done) => {
    itemRoutes(instance, container);
    interactionRoutes(instance, container);
    feedRoutes(instance, container);
    matchRoutes(instance, container);
    messageRoutes(instance, container);
    done();
  }, { prefix: '/api/v1' });
}
Step 6.5: Middleware
Files: src/api/http/middleware/*

auth.middleware.ts:


import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyClerkToken } from '../../infrastructure/external-services/clerk/ClerkAuthService';

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await verifyClerkToken(token);
    req.user = user; // Attach to request
  } catch (error) {
    reply.status(401).send({ error: 'Invalid token' });
  }
}
validation.middleware.ts:


import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      req.body = schema.parse(req.body);
    } catch (error) {
      reply.status(400).send({ error: 'Validation failed', details: error });
    }
  };
}
error-handler.middleware.ts:


import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function errorHandler(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  console.error(error);

  if (error.statusCode) {
    reply.status(error.statusCode).send({ error: error.message });
  } else {
    reply.status(500).send({ error: 'Internal server error' });
  }
}
rate-limit.middleware.ts:


import rateLimit from '@fastify/rate-limit';

export const rateLimitConfig = {
  max: 100, // requests
  timeWindow: '15 minutes'
};
Phase 7: Dependency Injection & Container
Goal: Wire all dependencies together

Step 7.1: IoC Container
File: src/container/Container.ts


export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
      Container.instance.initialize();
    }
    return Container.instance;
  }

  private initialize(): void {
    // Database
    const neo4jConnection = new Neo4jConnection(domainConfig.database.neo4j!);
    this.set('neo4jConnection', neo4jConnection);

    // Repositories
    this.set('itemRepository', new Neo4jItemRepository(neo4jConnection));
    this.set('userRepository', new Neo4jUserRepository(neo4jConnection));
    this.set('interactionRepository', new Neo4jInteractionRepository(neo4jConnection));
    this.set('matchRepository', new Neo4jMatchRepository(neo4jConnection));

    // External services
    const openAIClient = new OpenAIClient(process.env.OPENAI_API_KEY!);
    this.set('openAIClient', openAIClient);

    const visionService = new VisionService(process.env.OPENAI_API_KEY!);
    this.set('visionService', visionService);

    const cloudinary = new Cloudinary({ /* config */ });
    this.set('imageUploadService', new ImageUploadService(cloudinary));

    // Matching engine
    const matchingStrategy = MatchingStrategyFactory.create(
      this.get('itemRepository'),
      this.get('userRepository')
    );
    this.set('matchingEngine', new MatchingEngine(matchingStrategy));

    // Services
    this.set('feedService', new FeedService(
      this.get('itemRepository'),
      this.get('interactionRepository'),
      this.get('matchingEngine')
    ));

    this.set('notificationService', new NotificationService(/* socket.io */));

    // Use cases - Item
    this.set('createItemUseCase', new CreateItemUseCase(
      this.get('itemRepository'),
      this.get('visionService')
    ));

    this.set('getItemUseCase', new GetItemUseCase(
      this.get('itemRepository')
    ));

    // Use cases - User
    this.set('createUserUseCase', new CreateUserUseCase(
      this.get('userRepository')
    ));

    this.set('updatePreferencesUseCase', new UpdatePreferencesUseCase(
      this.get('userRepository')
    ));

    this.set('analyzeUserProfileUseCase', new AnalyzeUserProfileUseCase(
      this.get('userRepository'),
      this.get('visionService')
    ));

    // Use cases - Interaction
    this.set('recordInteractionUseCase', new RecordInteractionUseCase(
      this.get('interactionRepository'),
      this.get('matchRepository'),
      this.get('notificationService')
    ));

    this.set('getInteractionHistoryUseCase', new GetInteractionHistoryUseCase(
      this.get('interactionRepository')
    ));

    // Use cases - Matching
    this.set('calculateMatchUseCase', new CalculateMatchUseCase(
      this.get('matchingEngine'),
      this.get('userRepository'),
      this.get('itemRepository')
    ));

    this.set('getMatchesUseCase', new GetMatchesUseCase(
      this.get('matchRepository')
    ));

    this.set('getFeedUseCase', new GetFeedUseCase(
      this.get('feedService'),
      this.get('userRepository')
    ));

    // Use cases - Messaging
    this.set('sendMessageUseCase', new SendMessageUseCase(
      this.get('messageRepository'),
      this.get('notificationService')
    ));

    this.set('getMessagesUseCase', new GetMessagesUseCase(
      this.get('messageRepository')
    ));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    return service;
  }

  set(serviceName: string, service: any): void {
    this.services.set(serviceName, service);
  }
}
Step 7.2: Strategy Factory
File: src/container/factories/MatchingStrategyFactory.ts


export class MatchingStrategyFactory {
  static create(itemRepo: IItemRepository, userRepo: IUserRepository): IMatchingStrategy {
    const strategyType = domainConfig.matching.strategy;

    switch (strategyType) {
      case MatchingStrategyType.GRAPH:
        return new GraphMatchingStrategy(itemRepo, userRepo);

      case MatchingStrategyType.VECTOR:
        throw new Error('Vector strategy not implemented yet');

      case MatchingStrategyType.HYBRID:
        throw new Error('Hybrid strategy not implemented yet');

      default:
        throw new Error(`Unknown strategy: ${strategyType}`);
    }
  }
}
Phase 8: Shared Package Updates
Goal: Create generic schemas for cross-domain compatibility

Step 8.1: Generic Schemas
File: packages/shared/src/schemas.generic.ts

Create new generic Zod schemas:

AttributeSchema
GenericUserSchema
GenericItemSchema
GenericInteractionSchema
GenericMatchScoreSchema
GenericMatchSchema
Export from packages/shared/src/index.ts:


export * from './schemas.generic';
export * from './schemas'; // Keep legacy for backward compatibility
Step 8.2: Adapter Layer (Optional for Now)
File: packages/shared/src/adapters/apartment-adapter.ts

Create adapters to convert between legacy schemas and generic schemas.
This allows mobile app to continue using Apartment types while backend uses Item.

Can be implemented later when migrating mobile app.

Phase 9: Updated App Entry Point
Goal: Initialize server with domain config

Step 9.1: Update app.ts
File: apps/server/src/app.ts


import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { domainConfig } from './config/domains';
import { Container } from './container/Container';
import { registerRoutes } from './api/http/routes';
import { errorHandler } from './api/http/middleware/error-handler.middleware';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Plugins
app.register(cors, { origin: true });
app.register(rateLimit, { max: 100, timeWindow: '15 minutes' });

// Error handler
app.setErrorHandler(errorHandler);

// Initialize DI container
const container = Container.getInstance();

// Register routes
registerRoutes(app, container);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  domain: domainConfig.domain,
  timestamp: new Date().toISOString()
}));

// Root
app.get('/', async () => ({
  message: `${domainConfig.labels.entities.itemPlural} Matching Platform API`,
  domain: domainConfig.domain,
  version: '1.0.0'
}));

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });

    console.log(`
┌─────────────────────────────────────────────────┐
│  🚀 Server running on port ${port}                │
│  📦 Domain: ${domainConfig.domain}                       │
│  🎯 Matching strategy: ${domainConfig.matching.strategy}            │
│  🗄️  Database: ${domainConfig.database.primary}                   │
└─────────────────────────────────────────────────┘
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
Step 9.2: Environment Variables
File: apps/server/.env


# Domain configuration
DOMAIN_TYPE=zzzimeri

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# External services
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Auth
CLERK_SECRET_KEY=sk_test_...
Phase 10: Testing & Validation
Goal: Ensure the system works end-to-end

Step 10.1: Manual Testing Flow
Setup Neo4j Database:

Create Neo4j AuraDB instance
Run migration script (001_initial_schema.cypher)
Verify constraints and indexes
Start Backend Server:


cd apps/server
npm run dev
Verify logs show: Domain: zzzimeri, Strategy: graph
Test API Endpoints:

Create User (Provider):


POST /api/v1/users
{
  "email": "landlord@test.com",
  "name": "John Doe",
  "role": "provider",
  "images": ["https://example.com/profile.jpg"]
}
Analyze User Profile:


POST /api/v1/users/:userId/analyze
Verify AI extracts personality traits
Check Neo4j: (:User)-[:HAS_ATTRIBUTE]->(:Attribute) relationships created
Create Item (Apartment):


POST /api/v1/items
{
  "price": 1500,
  "images": ["https://example.com/apt1.jpg", "https://example.com/apt2.jpg"],
  "description": "Modern 2BR apartment",
  "location": { "city": "Belgrade", "lat": 44.8, "lng": 20.4 },
  "metadata": { "size": 80, "bedrooms": 2 }
}
Verify AI tags apartment with vibes (Modern, Bright, etc.)
Check Neo4j: (:Item)-[:HAS_ATTRIBUTE]->(:Attribute) relationships
Create User (Seeker):


POST /api/v1/users
{
  "email": "seeker@test.com",
  "name": "Jane Smith",
  "role": "seeker",
  "preferences": {
    "budget": { "min": 1000, "max": 2000 },
    "location": { "city": "Belgrade", "radius": 10 }
  }
}
Get Personalized Feed:


GET /api/v1/feed
Authorization: Bearer <seeker-token>
Verify response includes items ranked by match score
Check reasons: "Matching vibes: Modern", "Within budget"
Swipe Right (Like):


POST /api/v1/interactions/swipe
{
  "itemId": "apt-123",
  "action": "like"
}
Verify interaction created in Neo4j
Check if mutual match created (if provider also liked seeker)
Get Matches:


GET /api/v1/matches
Authorization: Bearer <provider-token>
Verify provider sees list of seekers who liked their apartment
Check match scores and compatibility reasons
Accept Match:


POST /api/v1/matches/:matchId/accept
Verify match status updated to 'accepted'
Chat should be unlocked
Send Message:


POST /api/v1/messages
{
  "matchId": "match-456",
  "content": "Hello! When can I view the apartment?"
}
Verify message saved
Check Socket.io real-time delivery
Test Domain Configuration Switch:

Change .env: DOMAIN_TYPE=tradey
Restart server
Verify logs show: Domain: tradey
Check API responses use "Clothing Item", "Seller", "Buyer" labels
Step 10.2: Neo4j Cypher Query Examples
View All Items with Attributes:


MATCH (i:Item {type: 'apartment'})-[r:HAS_ATTRIBUTE]->(a:Attribute)
RETURN i.id, i.price, collect(a.name) as vibes
LIMIT 10
Find Items Matching User Preferences:


MATCH (u:User {id: 'user-123', role: 'seeker'})
MATCH (u)-[:PREFERS]->(prefAttr:Attribute)
MATCH (i:Item {type: 'apartment', status: 'active'})-[:HAS_ATTRIBUTE]->(prefAttr)
WITH i, count(prefAttr) as matchCount
ORDER BY matchCount DESC
RETURN i.id, i.price, matchCount
LIMIT 20
Check for Mutual Matches:


MATCH (seeker:User {role: 'seeker'})-[:LIKED]->(item:Item)
MATCH (provider:User {role: 'provider'})-[:OWNS]->(item)
MATCH (provider)-[:LIKED]->(seeker)
RETURN seeker.name, item.id, provider.name
Visualize Social Graph (for Hackathon Demo!):


MATCH path = (u1:User)-[:MATCHED_WITH]->(m:Match)-[:FOR_ITEM]->(i:Item)<-[:OWNS]-(u2:User)
RETURN path
LIMIT 50
🔑 Critical Files Summary
Configuration Layer
src/config/domain.config.ts - Master configuration interface
src/config/domains/zzzimeri.config.ts - ZZZimeri domain config
src/config/domains/index.ts - Config loader
Core Domain Layer
src/core/domain/entities/Item.entity.ts - Generic item entity
src/core/domain/entities/User.entity.ts - User with roles
src/core/domain/entities/Attribute.entity.ts - Generic attribute
src/core/repositories/IItemRepository.ts - Item repository interface
src/core/repositories/IUserRepository.ts - User repository interface
Services Layer
src/core/services/vision/VisionService.ts - AI vision analysis
src/core/services/matching/MatchingEngine.ts - Matching orchestrator
src/core/services/matching/strategies/GraphMatchingStrategy.ts - Graph-based matching
src/core/services/recommendation/FeedService.ts - Personalized feed generation
Use Cases Layer
src/core/use-cases/item/CreateItem.usecase.ts - Create item with AI analysis
src/core/use-cases/matching/GetFeed.usecase.ts - Get personalized feed
src/core/use-cases/interaction/RecordInteraction.usecase.ts - Swipe logic
Infrastructure Layer
src/infrastructure/database/neo4j/Neo4jConnection.ts - Neo4j client wrapper
src/infrastructure/database/neo4j/repositories/Neo4jItemRepository.ts - Item repo implementation
src/infrastructure/database/neo4j/repositories/Neo4jUserRepository.ts - User repo implementation
src/infrastructure/database/neo4j/mappers/ItemMapper.ts - Domain ↔ Neo4j mapping
src/infrastructure/database/neo4j/migrations/001_initial_schema.cypher - Database schema
API Layer
src/api/http/controllers/ItemController.ts - Item endpoints
src/api/http/controllers/FeedController.ts - Feed endpoints
src/api/http/controllers/InteractionController.ts - Swipe endpoints
src/api/http/routes/index.ts - Route aggregator
src/api/http/middleware/auth.middleware.ts - Authentication
Dependency Injection
src/container/Container.ts - IoC container
src/container/factories/MatchingStrategyFactory.ts - Strategy factory
App Entry
src/app.ts - Main server initialization
Shared Package
packages/shared/src/schemas.generic.ts - Generic Zod schemas
🎨 Hackathon Strategy: What to Build vs. What to Fake
✅ MUST Build (Live Demo)
Swipe Interface - Smooth animations, must feel like Tinder
AI Vision Tags - Real-time tag extraction with "Analyzing: Modern style detected..." feedback
Personalized Feed - Show ranked items with match scores and reasons
Match Screen - Display compatibility graph visualization (Neo4j Browser or custom D3.js)
Backend API - All core endpoints working (items, feed, interactions, matches)
⚠️ Build But Simplify
Chat - Basic UI, messages saved to DB, Socket.io for real-time (don't need full features like typing indicators, read receipts)
User Onboarding - Simple form, skip fancy animations
Image Upload - Direct Cloudinary upload, skip image editing features
🚫 Fake / Skip for Hackathon
Payment/Monetization - Just show button, no Stripe integration
Settings/Edit Profile - Read-only profiles
Push Notifications - In-app only, skip mobile push
Admin Panel - Not needed for demo
Advanced Filters - Use basic filters (price, location) only
🎯 Demo Flow for Judges
Setup (Before Demo)
Seed database with 20 apartments (varied vibes: Modern, Rustic, Student, Luxury)
Create 5 provider accounts with personality traits
Create 2 seeker accounts with different preferences
Live Demo Script (5 minutes)
Intro (30s): "ZZZimeri solves roommate incompatibility using AI vision analysis and graph database matching"

Onboarding (1 min):

Show seeker signing up
Quick preference quiz (budget, lifestyle)
Upload profile pic → AI extracts traits in real-time
Show UI feedback: "Analyzing... Detected: Organized, Introvert, Pet-lover"
Feed & Matching (2 min):

Open feed → swipe through apartments
Show match score overlay: "85% Match"
Click "Why?" → Show reasons:
✅ Matching vibes: Modern, Minimalist
✅ Within budget ($1,200-$1,800)
✅ Compatible roommate: Quiet, Organized
Swipe right → Animate "It's a Match!"
Graph Visualization (1 min) - THE WOW MOMENT:

Open Neo4j Browser or custom visualization
Show graph: Seeker → Apartment → Landlord → Shared Interests
Highlight relationship: "You both prefer 'Modern' style and have mutual friend 'Marko'"
Chat Unlock (30s):

Provider accepts match → Chat unlocks
Send first message → Real-time delivery via Socket.io
Config Switch Demo (Optional - 30s):

Change .env: DOMAIN_TYPE=tradey
Restart server (takes 5s)
Show same UI now says "Clothing Item", "Seller", "Buyer"
"Same codebase, different domain!"
📊 Success Metrics
Technical Goals
✅ 90% code reusability between ZZZimeri and Tradey
✅ Sub-2s response time for feed generation
✅ AI vision analysis completes in <5s per item
✅ Graph matching queries execute in <500ms
Hackathon Goals
✅ Working end-to-end demo
✅ Impressive graph visualization
✅ Real-time AI tag extraction
✅ Smooth swipe animations
✅ Clean, domain-agnostic codebase
🚀 Next Steps After Hackathon
For Tradey Migration
Implement VectorMatchingStrategy using Pinecone/Weaviate
Add PostgreSQL for credits system
Update tradey.config.ts with fashion-specific prompts
Build visual similarity search
Switch DOMAIN_TYPE=tradey and launch!
Scalability Improvements
Add Redis caching for feed generation
Implement background jobs for AI analysis (Bull/BullMQ)
Add database connection pooling
Implement rate limiting per user
Add monitoring (Prometheus + Grafana)
📝 Final Checklist Before Implementation
 Neo4j AuraDB instance created and credentials added to .env
 OpenAI API key obtained and added to .env
 Cloudinary account created and credentials added
 Clerk authentication set up
 All dependencies installed (npm install in root, apps/server, apps/mobile, packages/shared)
 TypeScript compiles without errors
 Database migration script ready to run
🎓 Key Architectural Decisions
Why This Architecture?
Domain-Agnostic Naming: Ensures 90% code reusability by abstracting business concepts
Configuration-Driven: All domain-specific behavior controlled by single config file
Hexagonal Architecture: Core domain independent of frameworks (easy to swap Fastify → NestJS)
Strategy Pattern for Matching: Pluggable algorithms (Graph now, Vector later)
Repository Pattern: Clean separation between domain and data layer
Use Case Layer: Application logic separate from HTTP layer (reusable for GraphQL, gRPC, CLI)
Trade-offs
Complexity: More layers = more files, but cleaner separation
Over-engineering?: For hackathon, yes. For long-term product, no.
Learning Curve: Team needs to understand DDD patterns
Performance: Extra abstraction layers add minimal overhead (<5ms per request)
Future-Proofing
Easy to add new domains (just create new config file)
Easy to add new matching strategies (implement IMatchingStrategy)
Easy to add new databases (implement repository interfaces)
Easy to add new AI providers (implement IVisionService)
Prepared by: Claude Code (Senior Software Architect & Lead Developer)
Date: 2026-01-17
Version: 1.0
Status: Ready for Implementation