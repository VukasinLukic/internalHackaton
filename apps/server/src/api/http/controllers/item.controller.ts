import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { CreateItemInput, UpdateItemInput } from '../dto';
import { AuthenticatedRequest } from '../middleware';

export class ItemController {
  async createItem(
    request: FastifyRequest<{ Body: CreateItemInput }>,
    reply: FastifyReply
  ) {
    const { userId } = request as AuthenticatedRequest;
    const createItemUseCase = container.createItemUseCase;

    const item = await createItemUseCase.execute(userId, request.body);

    return reply.status(201).send({
      success: true,
      data: item
    });
  }

  async getItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const getItemUseCase = container.getItemUseCase;

    const item = await getItemUseCase.execute(id);

    if (!item) {
      return reply.status(404).send({
        success: false,
        error: 'Item not found'
      });
    }

    return reply.send({
      success: true,
      data: item
    });
  }

  async updateItem(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateItemInput;
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const { userId } = request as AuthenticatedRequest;
    const itemRepository = container.itemRepository;

    // Verify ownership
    const item = await itemRepository.findById(id);
    if (!item) {
      return reply.status(404).send({
        success: false,
        error: 'Item not found'
      });
    }

    if (item.providerId !== userId) {
      return reply.status(403).send({
        success: false,
        error: 'Not authorized to update this item'
      });
    }

    const updatedItem = await itemRepository.update(id, request.body);

    return reply.send({
      success: true,
      data: updatedItem
    });
  }

  async deleteItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const { userId } = request as AuthenticatedRequest;
    const itemRepository = container.itemRepository;

    // Verify ownership
    const item = await itemRepository.findById(id);
    if (!item) {
      return reply.status(404).send({
        success: false,
        error: 'Item not found'
      });
    }

    if (item.providerId !== userId) {
      return reply.status(403).send({
        success: false,
        error: 'Not authorized to delete this item'
      });
    }

    await itemRepository.updateStatus(id, 'removed');

    return reply.send({
      success: true,
      message: 'Item deleted successfully'
    });
  }

  async getProviderItems(
    request: FastifyRequest<{ Params: { providerId: string } }>,
    reply: FastifyReply
  ) {
    const { providerId } = request.params;
    const itemRepository = container.itemRepository;

    const items = await itemRepository.findByProviderId(providerId);

    return reply.send({
      success: true,
      data: items
    });
  }
}

export const itemController = new ItemController();
