import { v4 as uuidv4 } from 'uuid';
import { Item, ItemStatus } from '../../../../core/domain/entities';
import { IItemRepository, FindItemsOptions } from '../../../../core/repositories';
import { neo4jConnection } from '../Neo4jConnection';
import { ItemMapper } from '../mappers';

export class Neo4jItemRepository implements IItemRepository {

  async findById(id: string): Promise<Item | null> {
    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item {id: $id}) RETURN i`,
      { id }
    );
    return result[0] ? ItemMapper.toDomain(result[0].i.properties) : null;
  }

  async findByProviderId(providerId: string): Promise<Item[]> {
    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item {providerId: $providerId})
       RETURN i
       ORDER BY i.createdAt DESC`,
      { providerId }
    );
    return result.map(r => ItemMapper.toDomain(r.i.properties));
  }

  async findMany(options: FindItemsOptions): Promise<Item[]> {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.status) {
      conditions.push('i.status = $status');
      params.status = options.status;
    }
    if (options.providerId) {
      conditions.push('i.providerId = $providerId');
      params.providerId = options.providerId;
    }
    if (options.city) {
      conditions.push('i.city = $city');
      params.city = options.city;
    }
    if (options.minPrice !== undefined) {
      conditions.push('i.price >= $minPrice');
      params.minPrice = options.minPrice;
    }
    if (options.maxPrice !== undefined) {
      conditions.push('i.price <= $maxPrice');
      params.maxPrice = options.maxPrice;
    }
    if (options.excludeIds && options.excludeIds.length > 0) {
      conditions.push('NOT i.id IN $excludeIds');
      params.excludeIds = options.excludeIds;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await neo4jConnection.executeQuery<{ i: any }>(
      `MATCH (i:Item)
       ${whereClause}
       RETURN i
       ORDER BY i.createdAt DESC
       SKIP $offset
       LIMIT $limit`,
      {
        ...params,
        offset: options.offset || 0,
        limit: options.limit || 20
      }
    );

    return result.map(r => ItemMapper.toDomain(r.i.properties));
  }

  async create(data: Partial<Item>): Promise<Item> {
    const id = data.id || uuidv4();
    const params = ItemMapper.toNeo4j({ ...data, id });

    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `CREATE (i:Item {
        id: $id,
        providerId: $providerId,
        title: $title,
        description: $description,
        price: $price,
        size: $size,
        address: $address,
        city: $city,
        lat: $lat,
        lng: $lng,
        images: $images,
        attributes: $attributes,
        vibes: $vibes,
        status: $status,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN i`,
      params
    );

    // Create ownership relationship
    await neo4jConnection.executeWrite(
      `MATCH (u:User {id: $providerId}), (i:Item {id: $itemId})
       CREATE (u)-[:OWNS]->(i)`,
      { providerId: data.providerId, itemId: id }
    );

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async update(id: string, data: Partial<Item>): Promise<Item> {
    const setClauses: string[] = ['i.updatedAt = datetime()'];
    const params: Record<string, any> = { id };

    if (data.title) {
      setClauses.push('i.title = $title');
      params.title = data.title;
    }
    if (data.description !== undefined) {
      setClauses.push('i.description = $description');
      params.description = data.description;
    }
    if (data.price !== undefined) {
      setClauses.push('i.price = $price');
      params.price = data.price;
    }
    if (data.status) {
      setClauses.push('i.status = $status');
      params.status = data.status;
    }

    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `MATCH (i:Item {id: $id})
       SET ${setClauses.join(', ')}
       RETURN i`,
      params
    );

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async addAttributes(id: string, attributes: string[], vibes: string[]): Promise<Item> {
    // Update item's attributes and vibes arrays
    const result = await neo4jConnection.executeWrite<{ i: any }>(
      `MATCH (i:Item {id: $id})
       SET i.attributes = $attributes,
           i.vibes = $vibes,
           i.updatedAt = datetime()
       RETURN i`,
      { id, attributes, vibes }
    );

    // Create Attribute nodes and relationships
    for (const attr of [...attributes, ...vibes]) {
      await neo4jConnection.executeWrite(
        `MERGE (a:Attribute {name: $name})
         WITH a
         MATCH (i:Item {id: $itemId})
         MERGE (i)-[:HAS_ATTRIBUTE]->(a)`,
        { name: attr.toLowerCase(), itemId: id }
      );
    }

    return ItemMapper.toDomain(result[0].i.properties);
  }

  async updateStatus(id: string, status: ItemStatus): Promise<Item> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const result = await neo4jConnection.executeWrite(
      `MATCH (i:Item {id: $id})
       DETACH DELETE i
       RETURN count(i) as deleted`,
      { id }
    );
    return (result[0] as any).deleted > 0;
  }
}
