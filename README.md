# ZZZimeri Monorepo

"Tinder za stanove i cimere" - Hackathon Edition

## Project Structure

```
zzzimeri-monorepo/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   └── server/          # Node.js (Fastify) backend
└── packages/
    ├── shared/          # Shared types, schemas, constants
    └── tsconfig/        # Shared TypeScript configs
```

## Tech Stack

### Frontend (Mobile)
- React Native + Expo SDK 54
- Expo Router v3
- React Native Reanimated + Gesture Handler
- Zustand (state management)
- Tamagui (UI components)
- TypeScript

### Backend
- Node.js + Fastify
- Neo4j (graph database)
- OpenAI GPT-4o (AI vision)
- Cloudinary (image storage)
- Socket.io (real-time chat)
- Zod (validation)

## Getting Started

```bash
# Install dependencies
npm install

# Run mobile app
npm run mobile

# Run server
npm run server
```

## Environment Variables

Copy `.env.example` to `.env` in `apps/server/` and fill in your API keys.
