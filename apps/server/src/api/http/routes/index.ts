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
