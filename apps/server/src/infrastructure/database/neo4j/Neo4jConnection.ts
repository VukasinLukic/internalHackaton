import neo4j, { Driver, Session, QueryResult, RecordShape } from 'neo4j-driver';

class Neo4jConnection {
  private static instance: Neo4jConnection;
  private driver: Driver | null = null;

  private constructor() {}

  static getInstance(): Neo4jConnection {
    if (!Neo4jConnection.instance) {
      Neo4jConnection.instance = new Neo4jConnection();
    }
    return Neo4jConnection.instance;
  }

  async connect(): Promise<void> {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Missing Neo4j environment variables');
    }

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    // Verify connection
    await this.driver.verifyConnectivity();
    console.log('✅ Connected to Neo4j');
  }

  getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session();
  }

  async executeQuery<T = RecordShape>(
    cypher: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result: QueryResult = await session.run(cypher, params);
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async executeWrite<T = RecordShape>(
    cypher: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.executeWrite(tx => tx.run(cypher, params));
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('Neo4j connection closed');
    }
  }
}

export const neo4jConnection = Neo4jConnection.getInstance();
