import { DomainConfig } from '../config/domain.config';
import { loadDomainConfig } from '../config/domains';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';

// Repository interfaces
import {
  IUserRepository,
  IItemRepository,
  IInteractionRepository,
  IMatchRepository,
  IMessageRepository
} from '../core/repositories';

/**
 * Dependency Injection Container
 * DELL sets up the shell, LEGION implements the actual repositories/services
 */
class Container {
  private static instance: Container;

  // Config
  public domainConfig: DomainConfig;

  // Repositories (LEGION implements these)
  public userRepository!: IUserRepository;
  public itemRepository!: IItemRepository;
  public interactionRepository!: IInteractionRepository;
  public matchRepository!: IMatchRepository;
  public messageRepository!: IMessageRepository;

  // Services (LEGION implements these)
  // public visionService!: VisionService;
  // public matchingEngine!: MatchingEngine;
  // public feedService!: FeedService;

  private constructor() {
    this.domainConfig = loadDomainConfig();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(): Promise<void> {
    // Connect to database
    await neo4jConnection.connect();

    // TODO: LEGION initializes repositories here
    // this.userRepository = new Neo4jUserRepository(neo4jConnection);
    // this.itemRepository = new Neo4jItemRepository(neo4jConnection);
    // etc.

    console.log('✅ Container initialized');
  }
}

export const container = Container.getInstance();
