import { Interaction, InteractionType } from '../../../../core/domain/entities';

interface Neo4jInteractionNode {
  id: string;
  userId: string;
  itemId: string;
  type: string;
  createdAt: { toString(): string };
}

export class InteractionMapper {
  static toDomain(node: Neo4jInteractionNode): Interaction {
    return {
      id: node.id,
      userId: node.userId,
      itemId: node.itemId,
      type: node.type as InteractionType,
      createdAt: new Date(node.createdAt.toString())
    };
  }

  static toNeo4j(interaction: Partial<Interaction>): Record<string, any> {
    return {
      id: interaction.id,
      userId: interaction.userId,
      itemId: interaction.itemId,
      type: interaction.type
    };
  }
}
