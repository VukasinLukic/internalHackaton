import { User } from '../../domain/entities';
import { IUserRepository } from '../../repositories';
import { VisionService } from '../../services/vision/VisionService';

export class AnalyzeUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private visionService: VisionService
  ) {}

  async execute(userId: string, images: string[], bio?: string): Promise<User> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Analyze with AI
    const analysis = await this.visionService.analyzeUser(images, bio);

    // 3. Update user attributes
    const updatedUser = await this.userRepository.addAttributes(
      userId,
      analysis.traits
    );

    return updatedUser;
  }
}
