import { FastifyInstance } from 'fastify';
import { CreateItemDto, UpdateItemDto } from '../dto';
import { validateBody, authMiddleware } from '../middleware';
import { itemController } from '../controllers';

export async function itemRoutes(fastify: FastifyInstance) {
  // Create item (apartment)
  fastify.post<{
    Body: any;
  }>('/', {
    preHandler: [authMiddleware, validateBody(CreateItemDto)]
  }, itemController.createItem.bind(itemController));

  // Get item by ID
  fastify.get<{
    Params: { id: string };
  }>('/:id', itemController.getItem.bind(itemController));

  // Update item
  fastify.patch<{
    Params: { id: string };
    Body: any;
  }>('/:id', {
    preHandler: [authMiddleware, validateBody(UpdateItemDto)]
  }, itemController.updateItem.bind(itemController));

  // Delete item
  fastify.delete<{
    Params: { id: string };
  }>('/:id', {
    preHandler: [authMiddleware]
  }, itemController.deleteItem.bind(itemController));

  // Get provider's items
  fastify.get<{
    Params: { providerId: string };
  }>('/provider/:providerId', itemController.getProviderItems.bind(itemController));
}
