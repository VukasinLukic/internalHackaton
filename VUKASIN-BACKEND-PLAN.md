# 🔧 VUKASIN - Backend Development Plan
**Role**: Backend Developer + AI/ML + Database Architect
**Responsibilities**: API, Neo4j Graph Database, AI Vision, Matching Algorithm
**Timeline**: Hackathon Sprint

---

## 🎯 Your Scope (DO NOT Touch Mobile!)

✅ **YOU BUILD:**
- REST API (Fastify)
- Neo4j Graph Database + Cypher Queries
- OpenAI Vision Integration (Photo Recognition)
- Matching Algorithm (Graph-based)
- Real-time Chat Backend (Socket.io)
- Authentication Backend (Clerk integration)
- Image Upload Service (Cloudinary)

❌ **TEODORA BUILDS (Don't Touch!):**
- React Native App
- Mobile UI/UX
- Swipe Animations
- Mobile State Management (Zustand)
- Mobile API Client
- Mobile Navigation (Expo Router)

---

## 📦 Phase 1: Foundation Setup (2-3 hours)

### Step 1.1: Domain Configuration System
**Goal**: Set up configuration-driven architecture

**Tasks**:
1. Create `apps/server/src/config/domain.config.ts`
   - Define `DomainType` enum (`ZZZIMERI`, `TRADEY`)
   - Define `VisionPromptConfig` interface
   - Define `UILabelsConfig` interface
   - Define `MatchingWeightsConfig` interface

2. Create `apps/server/src/config/domains/zzzimeri.config.ts`
   - Vision prompts for apartment analysis
   - Vision prompts for personality analysis
   - Matching weights (70% apartment, 30% roommate)
   - UI labels mapping

3. Create `apps/server/src/config/domains/index.ts`
   - Config loader based on `process.env.DOMAIN_TYPE`

**Deliverable**: Configuration system ready, can switch domains via `.env`

---

### Step 1.2: Core Domain Entities
**Goal**: Define TypeScript interfaces for all entities

**Tasks**:
1. Create domain entities in `apps/server/src/core/domain/entities/`:
   - `Item.entity.ts` (generic apartment/clothing)
   - `User.entity.ts` (provider/seeker roles)
   - `Attribute.entity.ts` (vibes/tags from AI)
   - `Interaction.entity.ts` (like/dislike/super_like)
   - `Match.entity.ts` (match scoring + reasons)

2. Create value objects in `apps/server/src/core/domain/value-objects/`:
   - `Location.vo.ts`
   - `Price.vo.ts`
   - `Score.vo.ts`

**Deliverable**: Type-safe domain model

---

### Step 1.3: Repository Interfaces
**Goal**: Define contracts for data access

**Tasks**:
1. Create repository interfaces in `apps/server/src/core/repositories/`:
   - `IRepository.base.ts` (CRUD operations)
   - `IItemRepository.ts`
   - `IUserRepository.ts`
   - `IInteractionRepository.ts`
   - `IMatchRepository.ts`

**Deliverable**: Clean separation between domain and infrastructure

---

## 📦 Phase 2: Neo4j Graph Database (3-4 hours)

### Step 2.1: Neo4j Setup
**Goal**: Connect to Neo4j AuraDB

**Tasks**:
1. Create Neo4j AuraDB instance (free tier)
2. Save credentials to `.env`:
   ```
   NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your-password
   ```

3. Create `apps/server/src/infrastructure/database/neo4j/Neo4jConnection.ts`
   - Driver initialization
   - `executeQuery()` method
   - Connection pooling

**Deliverable**: Neo4j connection working

---

### Step 2.2: Database Schema + Migration
**Goal**: Create graph schema with constraints and indexes

**Tasks**:
1. Create `apps/server/src/infrastructure/database/neo4j/migrations/001_initial_schema.cypher`
   - Node constraints (unique IDs)
   - Indexes (email, role, type, status)
   - Full-text search on descriptions

2. Run migration script manually in Neo4j Browser

**Deliverable**: Database schema ready

---

### Step 2.3: Neo4j Repositories
**Goal**: Implement repository pattern for Neo4j

**Tasks**:
1. Create mappers in `apps/server/src/infrastructure/database/neo4j/mappers/`:
   - `ItemMapper.ts` (domain ↔ Neo4j node)
   - `UserMapper.ts`
   - `AttributeMapper.ts`

2. Create repositories in `apps/server/src/infrastructure/database/neo4j/repositories/`:
   - `Neo4jItemRepository.ts`
     - `create()` - Create apartment with attributes
     - `findByProviderId()` - Get provider's apartments
     - `findByAttributes()` - Find apartments by vibes
     - `addAttributes()` - Link AI tags to apartment
   - `Neo4jUserRepository.ts`
     - `create()` - Create user
     - `findByEmail()` - Auth lookup
     - `updatePreferences()` - Update seeker preferences
     - `addAttributes()` - Link AI traits to user
   - `Neo4jInteractionRepository.ts`
     - `create()` - Record like/dislike
     - `findByUserId()` - Get user's interaction history
     - `hasUserInteracted()` - Check if already swiped
   - `Neo4jMatchRepository.ts`
     - `create()` - Create match node
     - `findBySeekerId()` - Get seeker's matches
     - `findByProviderId()` - Get provider's incoming likes

**Deliverable**: Full CRUD operations via Neo4j

---

## 📦 Phase 3: AI Vision Integration (2-3 hours)

### Step 3.1: OpenAI Setup
**Goal**: Extract tags from images using GPT-4 Vision

**Tasks**:
1. Get OpenAI API key, add to `.env`:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

2. Create `apps/server/src/infrastructure/external-services/openai/OpenAIClient.ts`
   - Wrapper around OpenAI SDK
   - Error handling + retries

**Deliverable**: OpenAI client ready

---

### Step 3.2: Vision Service
**Goal**: Analyze apartment and user images

**Tasks**:
1. Create `apps/server/src/core/services/vision/VisionService.ts`
   - `analyzeItem(images: string[])`:
     - Use `domainConfig.vision.itemAnalysis.systemPrompt`
     - Call GPT-4o Vision API
     - Parse JSON response: `{ attributes: ["Modern", "Bright"], confidence: 0.9 }`
     - Return `Attribute[]` entities
   - `analyzeUser(images: string[], bio?: string)`:
     - Use `domainConfig.vision.userAnalysis.systemPrompt`
     - Extract personality traits: `["Organized", "Introvert", "Pet-lover"]`

**Deliverable**: AI vision working end-to-end

---

### Step 3.3: Image Upload Service
**Goal**: Upload images to Cloudinary

**Tasks**:
1. Create Cloudinary account, add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

2. Create `apps/server/src/infrastructure/external-services/cloudinary/ImageUploadService.ts`
   - `uploadImage(file: Buffer, folder: string)`: Upload + return URL
   - `deleteImage(publicId: string)`: Delete image

**Deliverable**: Image upload working

---

## 📦 Phase 4: Matching Algorithm (3-4 hours)

### Step 4.1: Matching Engine Architecture
**Goal**: Strategy pattern for pluggable matching algorithms

**Tasks**:
1. Create `apps/server/src/core/services/matching/IMatchingStrategy.ts`
   - Interface: `calculateMatch(seeker, item, provider)`
   - Interface: `findBestMatches(seeker, items[], limit)`

2. Create `apps/server/src/core/services/matching/MatchingEngine.ts`
   - Constructor accepts `IMatchingStrategy`
   - `generateFeed()`: Orchestrates matching + filtering

**Deliverable**: Matching engine foundation

---

### Step 4.2: Graph Matching Strategy
**Goal**: Implement compatibility algorithm for ZZZimeri

**Tasks**:
1. Create `apps/server/src/core/services/matching/strategies/GraphMatchingStrategy.ts`

   **Implement `calculateMatch()`**:
   - **Item Compatibility (70%)**:
     - Compare seeker's preferred attributes with apartment's AI tags
     - Check if price is within budget
     - Check if location is within radius
     - Return score 0-100

   - **Provider Compatibility (30%)**:
     - Jaccard similarity: `intersection(seekerTraits, providerTraits) / union`
     - Return score 0-100

   - **Weighted Total**:
     ```
     totalScore = (itemScore * 0.7) + (providerScore * 0.3)
     ```

   - **Generate Reasons**:
     ```javascript
     reasons = [
       "Matching vibes: Modern, Minimalist",
       "Within your budget ($1,200-$1,800)",
       "Compatible roommate: Quiet, Organized"
     ]
     ```

   **Implement `findBestMatches()`**:
   - Loop through candidate apartments
   - Calculate score for each
   - Sort by total score descending
   - Return top N

**Deliverable**: Matching algorithm complete

---

### Step 4.3: Feed Generation Service
**Goal**: Create personalized feed for seekers

**Tasks**:
1. Create `apps/server/src/core/services/recommendation/FeedService.ts`
   - `generatePersonalizedFeed(seeker, limit)`:
     - Fetch apartments (status=active, not already swiped)
     - Apply hard filters (budget, location)
     - Call `MatchingEngine.generateFeed()`
     - Filter by `minScoreThreshold` from config
     - Return ranked feed

**Deliverable**: Feed generation ready

---

## 📦 Phase 5: Use Cases + Business Logic (2-3 hours)

### Step 5.1: Item Use Cases
**Goal**: Apartment CRUD operations

**Tasks**:
1. Create use cases in `apps/server/src/core/use-cases/item/`:
   - `CreateItem.usecase.ts`:
     - Validate input
     - Call `VisionService.analyzeItem()` to extract tags
     - Save apartment + attributes to Neo4j
   - `GetItem.usecase.ts`: Fetch apartment by ID
   - `UpdateItem.usecase.ts`: Update apartment details
   - `DeleteItem.usecase.ts`: Mark apartment as removed

**Deliverable**: Item management

---

### Step 5.2: User Use Cases
**Goal**: User profile management

**Tasks**:
1. Create use cases in `apps/server/src/core/use-cases/user/`:
   - `CreateUser.usecase.ts`: Create user from Clerk auth
   - `UpdatePreferences.usecase.ts`: Update seeker preferences
   - `AnalyzeUserProfile.usecase.ts`: Extract AI traits from photos

**Deliverable**: User management

---

### Step 5.3: Interaction Use Cases
**Goal**: Swipe logic (like/dislike)

**Tasks**:
1. Create `apps/server/src/core/use-cases/interaction/RecordInteraction.usecase.ts`
   - Check if already swiped → return error
   - Create interaction in Neo4j: `(:User)-[:LIKED]->(:Item)`
   - **If type = 'like'**: Check for mutual match
     - If provider also liked seeker → Create Match node
     - Notify both users (future: Socket.io)
   - Return interaction

**Deliverable**: Swipe logic complete

---

### Step 5.4: Matching Use Cases
**Goal**: Get matches and feed

**Tasks**:
1. Create use cases in `apps/server/src/core/use-cases/matching/`:
   - `GetFeed.usecase.ts`: Generate personalized feed
   - `GetMatches.usecase.ts`: Get user's matches
   - `CalculateMatch.usecase.ts`: Calculate score for specific pair

**Deliverable**: Matching system complete

---

### Step 5.5: Messaging Use Cases
**Goal**: Chat backend

**Tasks**:
1. Create use cases in `apps/server/src/core/use-cases/messaging/`:
   - `SendMessage.usecase.ts`: Save message to Neo4j
   - `GetMessages.usecase.ts`: Fetch conversation history

**Deliverable**: Chat backend ready

---

## 📦 Phase 6: REST API Layer (2-3 hours)

### Step 6.1: DTOs + Validation
**Goal**: Type-safe request/response schemas

**Tasks**:
1. Create DTOs in `apps/server/src/api/http/dto/`:
   - `CreateItemDto.ts` (Zod schema for apartment creation)
   - `UpdateItemDto.ts`
   - `InteractionDto.ts` (itemId, action)
   - `UserPreferencesDto.ts` (budget, location, lifestyle)

**Deliverable**: Request validation

---

### Step 6.2: Controllers
**Goal**: HTTP request handlers

**Tasks**:
1. Create controllers in `apps/server/src/api/http/controllers/`:
   - `ItemController.ts`:
     - `POST /items` - Create apartment (with AI analysis)
     - `GET /items/:id` - Get apartment details
     - `PATCH /items/:id` - Update apartment
     - `DELETE /items/:id` - Delete apartment

   - `UserController.ts`:
     - `POST /users` - Create user
     - `PATCH /users/:id/preferences` - Update preferences
     - `POST /users/:id/analyze` - Analyze profile photos

   - `InteractionController.ts`:
     - `POST /interactions/swipe` - Like/dislike apartment
     - `GET /interactions/history` - Get swipe history

   - `FeedController.ts`:
     - `GET /feed` - Get personalized apartment feed

   - `MatchController.ts`:
     - `GET /matches` - Get user's matches
     - `POST /matches/:matchId/accept` - Accept match
     - `POST /matches/:matchId/reject` - Reject match

   - `MessageController.ts`:
     - `POST /messages` - Send message
     - `GET /messages/:matchId` - Get conversation

**Deliverable**: REST API controllers

---

### Step 6.3: Routes + Middleware
**Goal**: Wire controllers to HTTP endpoints

**Tasks**:
1. Create routes in `apps/server/src/api/http/routes/`:
   - `item.routes.ts`
   - `user.routes.ts`
   - `interaction.routes.ts`
   - `feed.routes.ts`
   - `match.routes.ts`
   - `message.routes.ts`
   - `index.ts` (route aggregator with `/api/v1` prefix)

2. Create middleware in `apps/server/src/api/http/middleware/`:
   - `auth.middleware.ts` (verify Clerk JWT)
   - `validation.middleware.ts` (Zod validation)
   - `error-handler.middleware.ts` (global error handling)

**Deliverable**: API routes ready

---

### Step 6.4: Serializers
**Goal**: Format responses with domain labels

**Tasks**:
1. Create serializers in `apps/server/src/api/http/serializers/`:
   - `ItemSerializer.ts`: Convert `Item` entity to API response (use `domainConfig.labels`)
   - `MatchSerializer.ts`: Convert `Match` entity to response
   - `FeedSerializer.ts`: Format feed items

**Deliverable**: Consistent API responses

---

## 📦 Phase 7: Real-time Chat (1-2 hours)

### Step 7.1: Socket.io Server
**Goal**: Real-time messaging

**Tasks**:
1. Create `apps/server/src/infrastructure/messaging/SocketIOServer.ts`
   - Initialize Socket.io with CORS
   - Handle events:
     - `join_room` - Join match chat room
     - `send_message` - Broadcast message to room
     - `disconnect` - Clean up
   - Methods:
     - `emitToMatch(matchId, event, data)`
     - `emitToUser(userId, event, data)`

**Deliverable**: Real-time chat backend

---

## 📦 Phase 8: Dependency Injection (1 hour)

### Step 8.1: IoC Container
**Goal**: Wire all dependencies

**Tasks**:
1. Create `apps/server/src/container/Container.ts`
   - Singleton pattern
   - Initialize all repositories, services, use cases
   - Lazy loading

2. Create `apps/server/src/container/factories/MatchingStrategyFactory.ts`
   - Factory to create matching strategy based on config

**Deliverable**: Dependency injection ready

---

## 📦 Phase 9: Server Entry Point (30 min)

### Step 9.1: Main App
**Goal**: Initialize Fastify server

**Tasks**:
1. Update `apps/server/src/app.ts`:
   - Load domain config
   - Register plugins (CORS, rate limit)
   - Initialize DI container
   - Register routes
   - Add health check endpoint
   - Start server with nice console output

**Deliverable**: Server running

---

## 📦 Phase 10: Testing + Seeding (2-3 hours)

### Step 10.1: Database Seeding
**Goal**: Create demo data for Teodora's mobile app

**Tasks**:
1. Create seed script `apps/server/scripts/seed.ts`:
   - Create 5 provider users with AI traits
   - Create 20 apartments with varied vibes (Modern, Rustic, Student, Luxury)
   - Create 3 seeker users with different preferences
   - Create some interactions + matches

**Deliverable**: Demo data ready

---

### Step 10.2: API Testing
**Goal**: Verify all endpoints work

**Tasks**:
1. Test with Postman/Thunder Client:
   - Create user → Analyze profile → Check Neo4j for attributes
   - Create apartment → Check AI tags extracted
   - Create seeker → Update preferences
   - Get feed → Verify matching scores
   - Swipe right → Check for match creation
   - Send message → Verify real-time delivery

**Deliverable**: API fully tested

---

## 🎯 Final Deliverables for Teodora

**API Documentation** (share with Teodora):
```
BASE_URL: http://localhost:3000/api/v1

Authentication:
  Authorization: Bearer <clerk-token>

Endpoints:

POST /users
  Body: { email, name, role: "provider" | "seeker", images[] }
  Response: User object

POST /users/:id/analyze
  Trigger: AI analysis of profile photos
  Response: { attributes: [...] }

PATCH /users/:id/preferences
  Body: { budget: {min, max}, location: {city, radius}, lifestyle: {...} }

POST /items
  Body: { price, images[], description, location, metadata }
  Response: Item object with AI tags

GET /items/:id
  Response: Item details + provider info

GET /feed
  Query: ?limit=20
  Response: [{ item, provider, score: { total, reasons: [...] } }]

POST /interactions/swipe
  Body: { itemId, action: "like" | "dislike" | "super_like" }
  Response: Interaction + match (if mutual)

GET /matches
  Response: [Match objects]

POST /matches/:matchId/accept
  Response: { success: true }

POST /messages
  Body: { matchId, content }
  Response: Message object

GET /messages/:matchId
  Response: [Message objects]

WebSocket Events:
  connect -> join_room(matchId)
  send_message -> broadcasts to room
  new_message <- receive message
```

---

## 🚀 Hackathon Priority Order

**Must Have (Demo Blockers)**:
1. ✅ Neo4j setup + schema
2. ✅ AI vision integration (apartment + user analysis)
3. ✅ Matching algorithm (graph-based)
4. ✅ Feed generation API
5. ✅ Swipe interaction API
6. ✅ Match creation logic

**Should Have (Nice to Show)**:
1. ✅ Real-time chat (Socket.io)
2. ✅ Database seeding (demo data)

**Could Have (If Time)**:
1. Advanced Cypher queries (social graph traversal)
2. Match expiration logic
3. Undo swipe feature

---

## 📝 Environment Variables Checklist

```bash
# Domain
DOMAIN_TYPE=zzzimeri

# Server
PORT=3000
NODE_ENV=development

# Neo4j
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Clerk (if needed for auth)
CLERK_SECRET_KEY=sk_test_...
```

---

**Good luck, Vukasine! 🚀 Focus on the backend brilliance!**
