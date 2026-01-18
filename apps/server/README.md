# ZZZimeri Backend Server

Backend API server za ZZZimeri platformu - Tinder-like aplikaciju za traženje cimera i stanova.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Neo4j Database (local ili AuraDB)
- OpenAI API Key
- Cloudinary account (za upload slika)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env sa tvojim credentials
```

3. Setup database schema & seed data:
```bash
npm run seed
```

4. Start development server:
```bash
npm run dev
```

Server će biti dostupan na `http://localhost:3000`

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/me` - Get current user (auth required)
- `PATCH /api/v1/users/:id/preferences` - Update preferences
- `POST /api/v1/users/:id/analyze` - Analyze user photos with AI

### Items (Apartments)
- `POST /api/v1/items` - Create new item
- `GET /api/v1/items/:id` - Get item by ID
- `PATCH /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `GET /api/v1/items/provider/:providerId` - Get provider's items

### Feed
- `GET /api/v1/feed` - Get personalized feed (auth required)

### Interactions
- `POST /api/v1/interactions/swipe` - Record swipe (like/dislike)
- `GET /api/v1/interactions/history` - Get swipe history

### Matches
- `GET /api/v1/matches` - Get user's matches
- `POST /api/v1/matches/:matchId/accept` - Accept match
- `POST /api/v1/matches/:matchId/reject` - Reject match

### Messages
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/:matchId` - Get conversation messages
- `PATCH /api/v1/messages/:messageId/read` - Mark message as read

## 🔌 WebSocket Events

Connect to: `ws://localhost:3000/socket.io`

### Client → Server
- `authenticate` - Authenticate user socket
- `join_match` - Join match room for chat
- `leave_match` - Leave match room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server → Client
- `authenticated` - Authentication successful
- `new_match` - New match created
- `new_message` - New message received
- `match_status_updated` - Match status changed
- `user_typing` - Other user is typing
- `user_stopped_typing` - Other user stopped typing

## 🔐 Authentication

Za hackathon koristimo jednostavnu autentikaciju sa header-based auth:

```bash
# Headers
X-User-Id: user-id-here
X-User-Role: seeker # or provider
```

Za production, integrisati Clerk authentication.

## 🗄️ Database Schema

Neo4j graf baza sa sledećim node tipovima:
- `User` - Korisnici (providers i seekers)
- `Item` - Stanovi/sobe
- `Interaction` - Swipe interakcije
- `Match` - Matchevi između korisnika
- `Message` - Chat poruke
- `Attribute` - Atributi za matching

## 🧪 Testing

```bash
# Run tests (TODO)
npm test

# Check database
# Open Neo4j Browser at http://localhost:7474
# Run: MATCH (n) RETURN n LIMIT 25
```

## 📁 Project Structure

```
apps/server/src/
├── api/
│   └── http/
│       ├── controllers/     # Request handlers
│       ├── dto/             # Validation schemas (Zod)
│       ├── middleware/      # Auth, validation, errors
│       ├── routes/          # Route definitions
│       └── serializers/     # Response formatters
├── config/
│   ├── domain.config.ts     # Domain type definitions
│   └── domains/
│       └── zzzimeri.config.ts  # ZZZimeri-specific config
├── core/
│   ├── domain/
│   │   └── entities/        # Domain entities
│   ├── repositories/        # Repository interfaces
│   ├── services/
│   │   ├── matching/        # Matching algorithm
│   │   ├── recommendation/  # Feed generation
│   │   └── vision/          # AI image analysis
│   └── use-cases/           # Business logic
├── infrastructure/
│   ├── database/
│   │   └── neo4j/           # Neo4j implementation
│   ├── external-services/
│   │   ├── cloudinary/      # Image upload
│   │   └── openai/          # AI integration
│   └── websocket/           # Socket.io
├── container/
│   └── Container.ts         # Dependency injection
├── scripts/
│   └── seed.ts              # Database seeding
└── app.ts                   # Server entry point
```

## 🎯 Domain Configuration

Aplikacija podržava različite domene (zzzimeri, tradey, etc.) kroz config sistem:

```typescript
// .env
DOMAIN_TYPE=zzzimeri

// Automatski učitava config/domains/zzzimeri.config.ts
```

## 🐛 Troubleshooting

### Neo4j connection fails
- Proveri da li je Neo4j pokrenut
- Proveri credentials u .env
- Za AuraDB, koristi `neo4j+s://` URI

### OpenAI API errors
- Proveri API key
- Proveri da li imaš credits

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

## 📝 License

MIT
