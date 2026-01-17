import { Match, MatchStatus, MatchScore } from '../../../../core/domain/entities';

interface Neo4jMatchNode {
  id: string;
  seekerId: string;
  providerId: string;
  itemId: string;
  totalScore: number;
  itemCompatibility: number;
  providerCompatibility: number;
  reasons: string[];
  status: string;
  createdAt: { toString(): string };
  acceptedAt?: { toString(): string };
}

export class MatchMapper {
  static toDomain(node: Neo4jMatchNode): Match {
    return {
      id: node.id,
      seekerId: node.seekerId,
      providerId: node.providerId,
      itemId: node.itemId,
      score: {
        total: node.totalScore,
        itemCompatibility: node.itemCompatibility,
        providerCompatibility: node.providerCompatibility,
        reasons: node.reasons || []
      },
      status: node.status as MatchStatus,
      createdAt: new Date(node.createdAt.toString()),
      acceptedAt: node.acceptedAt ? new Date(node.acceptedAt.toString()) : undefined
    };
  }

  static toNeo4j(match: Partial<Match>): Record<string, any> {
    return {
      id: match.id,
      seekerId: match.seekerId,
      providerId: match.providerId,
      itemId: match.itemId,
      totalScore: match.score?.total,
      itemCompatibility: match.score?.itemCompatibility,
      providerCompatibility: match.score?.providerCompatibility,
      reasons: match.score?.reasons || [],
      status: match.status || 'pending'
    };
  }
}
