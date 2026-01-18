import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities';
import { IUserRepository } from '../../repositories';
import { CreateUserInput } from '../../../api/http/dto';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.create({
      id: uuidv4(),
      email: input.email,
      name: input.name,
      role: input.role,
      clerkId: input.clerkId,
      bio: input.bio,
      images: input.images || [],
      attributes: []
    });

    return user;
  }
}
