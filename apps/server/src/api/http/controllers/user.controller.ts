import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../container/Container';
import { CreateUserInput, UpdateUserPreferencesInput, AnalyzeUserInput } from '../dto';
import { AuthenticatedRequest } from '../middleware';

export class UserController {
  async createUser(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
  ) {
    const createUserUseCase = container.createUserUseCase;
    const user = await createUserUseCase.execute(request.body);

    return reply.status(201).send({
      success: true,
      data: user
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const userRepository = container.userRepository;

    const user = await userRepository.findById(userId);

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      });
    }

    return reply.send({
      success: true,
      data: user
    });
  }

  async updatePreferences(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserPreferencesInput;
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const updatePreferencesUseCase = container.updatePreferencesUseCase;

    const user = await updatePreferencesUseCase.execute(id, request.body);

    return reply.send({
      success: true,
      data: user
    });
  }

  async analyzeUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: AnalyzeUserInput;
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const analyzeUserUseCase = container.analyzeUserProfileUseCase;

    const result = await analyzeUserUseCase.execute(id, request.body.images, request.body.bio);

    return reply.send({
      success: true,
      data: result
    });
  }
}

export const userController = new UserController();
