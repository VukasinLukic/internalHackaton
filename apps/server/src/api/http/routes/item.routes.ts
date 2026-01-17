import { FastifyInstance } from 'fastify';
import { CreateItemDto, UpdateItemDto } from '../dto';
import { validateBody, authMiddleware } from '../middleware';

export async function itemRoutes(fastify: FastifyInstance) {
  // Create item (apartment)
  fastify.post('/', {
    preHandler: [authMiddleware, validateBody(CreateItemDto)]
  }, async (_request, _reply) => {
    // TODO: Legion implements + AI analysis
    return { message: 'Create item - Legion implements' };
  });

  // Get item by ID
  fastify.get('/:id', async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Get item - Legion implements' };
  });

  // Update item
  fastify.patch('/:id', {
    preHandler: [authMiddleware, validateBody(UpdateItemDto)]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Update item - Legion implements' };
  });

  // Delete item
  fastify.delete('/:id', {
    preHandler: [authMiddleware]
  }, async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Delete item - Legion implements' };
  });

  // Get provider's items
  fastify.get('/provider/:providerId', async (_request, _reply) => {
    // TODO: Legion implements
    return { message: 'Get provider items - Legion implements' };
  });
}
