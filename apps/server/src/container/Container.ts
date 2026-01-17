import { DomainConfig } from '../config/domain.config';
import { loadDomainConfig } from '../config/domains';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';

// Repositories
import {
  Neo4jUserRepository,
  Neo4jItemRepository,
  Neo4jInteractionRepository,
  Neo4jMatchRepository
} from '../infrastructure/database/neo4j/repositories';

// Services
import { VisionService } from '../core/services/vision/VisionService';
import { MatchingEngine } from '../core/services/matching/MatchingEngine';
import { GraphMatchingStrategy } from '../core/services/matching/strategies/GraphMatchingStrategy';
import { FeedService } from '../core/services/recommendation/FeedService';

// Use Cases
import {
  CreateUserUseCase,
  AnalyzeUserProfileUseCase,
  UpdatePreferencesUseCase,
  CreateItemUseCase,
  GetItemUseCase,
  RecordInteractionUseCase,
  GetInteractionHistoryUseCase,
  GetFeedUseCase,
  GetMatchesUseCase,
  AcceptMatchUseCase
} from '../core/use-cases';

class Container {
  private static instance: Container;

  // Config
  public domainConfig: DomainConfig;

  // Repositories
  public userRepository!: Neo4jUserRepository;
  public itemRepository!: Neo4jItemRepository;
  public interactionRepository!: Neo4jInteractionRepository;
  public matchRepository!: Neo4jMatchRepository;

  // Services
  public visionService!: VisionService;
  public matchingEngine!: MatchingEngine;
  public feedService!: FeedService;

  // Use Cases
  public createUserUseCase!: CreateUserUseCase;
  public analyzeUserProfileUseCase!: AnalyzeUserProfileUseCase;
  public updatePreferencesUseCase!: UpdatePreferencesUseCase;
  public createItemUseCase!: CreateItemUseCase;
  public getItemUseCase!: GetItemUseCase;
  public recordInteractionUseCase!: RecordInteractionUseCase;
  public getInteractionHistoryUseCase!: GetInteractionHistoryUseCase;
  public getFeedUseCase!: GetFeedUseCase;
  public getMatchesUseCase!: GetMatchesUseCase;
  public acceptMatchUseCase!: AcceptMatchUseCase;

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

    // Initialize repositories
    this.userRepository = new Neo4jUserRepository();
    this.itemRepository = new Neo4jItemRepository();
    this.interactionRepository = new Neo4jInteractionRepository();
    this.matchRepository = new Neo4jMatchRepository();

    // Initialize services
    this.visionService = new VisionService(this.domainConfig);

    const matchingStrategy = new GraphMatchingStrategy(this.domainConfig);
    this.matchingEngine = new MatchingEngine(matchingStrategy);

    this.feedService = new FeedService(
      this.userRepository,
      this.itemRepository,
      this.interactionRepository,
      this.matchingEngine
    );

    // Initialize use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);

    this.analyzeUserProfileUseCase = new AnalyzeUserProfileUseCase(
      this.userRepository,
      this.visionService
    );

    this.updatePreferencesUseCase = new UpdatePreferencesUseCase(
      this.userRepository
    );

    this.createItemUseCase = new CreateItemUseCase(
      this.itemRepository,
      this.userRepository,
      this.visionService
    );

    this.getItemUseCase = new GetItemUseCase(this.itemRepository);

    this.recordInteractionUseCase = new RecordInteractionUseCase(
      this.interactionRepository,
      this.itemRepository,
      this.userRepository,
      this.matchRepository,
      this.matchingEngine
    );

    this.getInteractionHistoryUseCase = new GetInteractionHistoryUseCase(
      this.interactionRepository
    );

    this.getFeedUseCase = new GetFeedUseCase(this.feedService);

    this.getMatchesUseCase = new GetMatchesUseCase(this.matchRepository);

    this.acceptMatchUseCase = new AcceptMatchUseCase(this.matchRepository);

    console.log('✅ Container initialized');
  }
}

export const container = Container.getInstance();
