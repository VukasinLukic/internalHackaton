import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../../../../core/domain/entities';
import { IInteractionRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { InteractionMapper } from '../mappers';

export class Neo4jInteractionRepository implements IInteractionRepository {

  async findById(id: string): Promise<Interaction | null> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User)-[r:INTERACTED]->(i:Item)
       WHERE r.id = $id
       RETURN r {.*, userId: u.id, itemId: i.id} as props`,
      { id }
    );
    return result[0] ? InteractionMapper.toDomain(result[0].props) : null;
  }

  async findByUserId(userId: string): Promise<Interaction[]> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User {id: $userId})-[r:INTERACTED]->(i:Item)
       RETURN r {.*, userId: u.id, itemId: i.id} as props
       ORDER BY r.createdAt DESC`,
      { userId }
    );
    return result.map(r => InteractionMapper.toDomain(r.props));
  }

  async findByItemId(itemId: string): Promise<Interaction[]> {
    const result = await neo4jConnection.executeQuery<{ props: any }>(
      `MATCH (u:User)-[r:INTERACTED]->(i:Item {id: $itemId})
       RETURN r {.*, userId: u.id, itemId: i.id} as props
       ORDER BY r.createdAt DESC`,
      { itemId }
    );
    return result.map(r => InteractionMapper.toDomain(r.props));
  }

  async hasUserInteracted(userId: string, itemId: string): Promise<boolean> {
    const result = await neo4jConnection.executeQuery(
      `MATCH (u:User {id: $userId})-[r:INTERACTED]->(i:Item {id: $itemId})
       RETURN count(r) as count`,
      { userId, itemId }
    );
    return (result[0] as any).count > 0;
  }

  async getSwipedItemIds(userId: string): Promise<string[]> {
    const result = await neo4jConnection.executeQuery<{ itemId: string }>(
      `MATCH (u:User {id: $userId})-[:INTERACTED]->(i:Item)
       RETURN i.id as itemId`,
      { userId }
    );
    return result.map(r => r.itemId);
  }

  async create(data: Partial<Interaction>): Promise<Interaction> {
    const id = data.id || uuidv4();

    // Create relationship with properties
    const relType = data.type === 'like' ? 'LIKED' :
                    data.type === 'super_like' ? 'SUPER_LIKED' : 'DISLIKED';

    await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $userId}), (i:Item {id: $itemId})
       CREATE (u)-[r:INTERACTED {
         id: $id,
         type: $type,
         createdAt: datetime()
       }]->(i)
       CREATE (u)-[:${relType}]->(i)`,
      {
        id,
        userId: data.userId,
        itemId: data.itemId,
        type: data.type
      }
    );

    return {
      id,
      userId: data.userId!,
      itemId: data.itemId!,
      type: data.type!,
      createdAt: new Date()
    };
  }

  async update(_id: string, _data: Partial<Interaction>): Promise<Interaction> {
    // Interactions are immutable, throw error
    throw new Error('Interactions cannot be updated');
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH ()-[r:INTERACTED {id: $id}]->()
       DELETE r
       RETURN count(r) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
