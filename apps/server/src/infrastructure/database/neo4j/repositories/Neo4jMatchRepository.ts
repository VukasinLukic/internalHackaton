import { v4 as uuidv4 } from 'uuid';
import { Match, MatchStatus } from '../../../../core/domain/entities';
import { IMatchRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { MatchMapper } from '../mappers';

export class Neo4jMatchRepository implements IMatchRepository {

  async findById(id: string): Promise<Match | null> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {id: $id}) RETURN m`,
      { id }
    );
    return result[0] ? MatchMapper.toDomain(result[0].m.properties) : null;
  }

  async findBySeekerId(seekerId: string): Promise<Match[]> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {seekerId: $seekerId})
       RETURN m
       ORDER BY m.createdAt DESC`,
      { seekerId }
    );
    return result.map(r => MatchMapper.toDomain(r.m.properties));
  }

  async findByProviderId(providerId: string): Promise<Match[]> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {providerId: $providerId})
       RETURN m
       ORDER BY m.createdAt DESC`,
      { providerId }
    );
    return result.map(r => MatchMapper.toDomain(r.m.properties));
  }

  async findByUserIds(seekerId: string, providerId: string, itemId: string): Promise<Match | null> {
    const result = await neo4jConnection.executeQuery<{ m: any }>(
      `MATCH (m:Match {seekerId: $seekerId, providerId: $providerId, itemId: $itemId})
       RETURN m`,
      { seekerId, providerId, itemId }
    );
    return result[0] ? MatchMapper.toDomain(result[0].m.properties) : null;
  }

  async create(data: Partial<Match>): Promise<Match> {
    const id = data.id || uuidv4();
    const params = MatchMapper.toNeo4j({ ...data, id });

    const result = await neo4jConnection.executeWrite<{ m: any }>(
      `CREATE (m:Match {
        id: $id,
        seekerId: $seekerId,
        providerId: $providerId,
        itemId: $itemId,
        totalScore: $totalScore,
        itemCompatibility: $itemCompatibility,
        providerCompatibility: $providerCompatibility,
        reasons: $reasons,
        status: $status,
        createdAt: datetime()
      })
      RETURN m`,
      params
    );

    // Create relationships to users and item
    await neo4jConnection.executeWrite(
      `MATCH (s:User {id: $seekerId}), (p:User {id: $providerId}), (i:Item {id: $itemId}), (m:Match {id: $matchId})
       CREATE (s)-[:HAS_MATCH]->(m)
       CREATE (p)-[:HAS_MATCH]->(m)
       CREATE (m)-[:FOR_ITEM]->(i)`,
      {
        seekerId: data.seekerId,
        providerId: data.providerId,
        itemId: data.itemId,
        matchId: id
      }
    );

    return MatchMapper.toDomain(result[0].m.properties);
  }

  async update(id: string, data: Partial<Match>): Promise<Match> {
    const setClauses: string[] = [];
    const params: Record<string, any> = { id };

    if (data.status) {
      setClauses.push('m.status = $status');
      params.status = data.status;
      if (data.status === 'accepted') {
        setClauses.push('m.acceptedAt = datetime()');
      }
    }

    const result = await neo4jConnection.executeWrite<{ m: any }>(
      `MATCH (m:Match {id: $id})
       SET ${setClauses.join(', ')}
       RETURN m`,
      params
    );

    return MatchMapper.toDomain(result[0].m.properties);
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH (m:Match {id: $id})
       DETACH DELETE m
       RETURN count(m) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
