import { User, UserPreferences } from '../../domain/entities';
import { IUserRepository } from '../../repositories';

export class UpdatePreferencesUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, preferences: UserPreferences): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'seeker') {
      throw new Error('Only seekers can have preferences');
    }

    return this.userRepository.updatePreferences(userId, preferences);
  }
}
