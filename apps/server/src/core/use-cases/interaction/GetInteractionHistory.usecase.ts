import { Interaction } from '../../domain/entities';
import { IInteractionRepository } from '../../repositories';

export class GetInteractionHistoryUseCase {
  constructor(private interactionRepository: IInteractionRepository) {}

  async execute(userId: string): Promise<Interaction[]> {
    return this.interactionRepository.findByUserId(userId);
  }
}
