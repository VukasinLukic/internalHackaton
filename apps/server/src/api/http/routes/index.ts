import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.routes';
import { itemRoutes } from './item.routes';
import { feedRoutes } from './feed.routes';
import { interactionRoutes } from './interaction.routes';
import { matchRoutes } from './match.routes';
import { messageRoutes } from './message.routes';
import { visionRoutes } from './vision.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // API v1 routes
  fastify.register(async (api) => {
    // Health check
    api.get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString()
    }));

    api.register(userRoutes, { prefix: '/users' });
    api.register(itemRoutes, { prefix: '/items' });
    api.register(feedRoutes, { prefix: '/feed' });
    api.register(interactionRoutes, { prefix: '/interactions' });
    api.register(matchRoutes, { prefix: '/matches' });
    api.register(messageRoutes, { prefix: '/messages' });
    api.register(visionRoutes, { prefix: '/vision' });
  }, { prefix: '/api/v1' });
}
