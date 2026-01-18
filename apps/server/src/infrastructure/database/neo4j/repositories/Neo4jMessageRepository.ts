import { Message } from '../../../../core/domain/entities';
import { IMessageRepository } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { randomUUID } from 'crypto';

export class Neo4jMessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    const result = await neo4jConnection.executeQuery<{ msg: any }>(
      `
      MATCH (msg:Message {id: $id})
      RETURN msg
      `,
      { id }
    );

    if (result.length === 0) return null;

    const msgNode = result[0].msg;
    return {
      id: msgNode.id,
      matchId: msgNode.matchId,
      senderId: msgNode.senderId,
      content: msgNode.content,
      createdAt: new Date(msgNode.createdAt),
      readAt: msgNode.readAt ? new Date(msgNode.readAt) : undefined
    };
  }

  async create(data: Partial<Message>): Promise<Message> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const result = await neo4jConnection.executeWrite<{ msg: any }>(
      `
      CREATE (msg:Message {
        id: $id,
        matchId: $matchId,
        senderId: $senderId,
        content: $content,
        createdAt: $createdAt
      })
      RETURN msg
      `,
      {
        id,
        matchId: data.matchId,
        senderId: data.senderId,
        content: data.content,
        createdAt: now
      }
    );

    const msgNode = result[0].msg;
    return {
      id: msgNode.id,
      matchId: msgNode.matchId,
      senderId: msgNode.senderId,
      content: msgNode.content,
      createdAt: new Date(msgNode.createdAt)
    };
  }

  async update(id: string, data: Partial<Message>): Promise<Message> {
    const updates: string[] = [];
    const params: Record<string, any> = { id };

    if (data.content !== undefined) {
      updates.push('msg.content = $content');
      params.content = data.content;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const result = await neo4jConnection.executeWrite<{ msg: any }>(
      `
      MATCH (msg:Message {id: $id})
      SET ${updates.join(', ')}
      RETURN msg
      `,
      params
    );

    const msgNode = result[0].msg;
    return {
      id: msgNode.id,
      matchId: msgNode.matchId,
      senderId: msgNode.senderId,
      content: msgNode.content,
      createdAt: new Date(msgNode.createdAt),
      readAt: msgNode.readAt ? new Date(msgNode.readAt) : undefined
    };
  }

  async delete(id: string): Promise<boolean> {
    await neo4jConnection.executeWrite(
      `
      MATCH (msg:Message {id: $id})
      DELETE msg
      `,
      { id }
    );
    return true;
  }

  async findByMatchId(
    matchId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const result = await neo4jConnection.executeQuery<{ msg: any }>(
      `
      MATCH (msg:Message {matchId: $matchId})
      RETURN msg
      ORDER BY msg.createdAt DESC
      SKIP $offset
      LIMIT $limit
      `,
      { matchId, offset, limit }
    );

    return result.map((row) => ({
      id: row.msg.id,
      matchId: row.msg.matchId,
      senderId: row.msg.senderId,
      content: row.msg.content,
      createdAt: new Date(row.msg.createdAt),
      readAt: row.msg.readAt ? new Date(row.msg.readAt) : undefined
    }));
  }

  async markAsRead(messageId: string): Promise<Message> {
    const now = new Date().toISOString();

    const result = await neo4jConnection.executeWrite<{ msg: any }>(
      `
      MATCH (msg:Message {id: $messageId})
      SET msg.readAt = $readAt
      RETURN msg
      `,
      { messageId, readAt: now }
    );

    const msgNode = result[0].msg;
    return {
      id: msgNode.id,
      matchId: msgNode.matchId,
      senderId: msgNode.senderId,
      content: msgNode.content,
      createdAt: new Date(msgNode.createdAt),
      readAt: new Date(msgNode.readAt)
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await neo4jConnection.executeQuery<{ count: number }>(
      `
      MATCH (m:Match)-[:HAS_MESSAGE]->(msg:Message)
      WHERE (m.seekerId = $userId OR m.providerId = $userId)
        AND msg.senderId <> $userId
        AND msg.readAt IS NULL
      RETURN count(msg) as count
      `,
      { userId }
    );

    return result[0]?.count || 0;
  }
}
