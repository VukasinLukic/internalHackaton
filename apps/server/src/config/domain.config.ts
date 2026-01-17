// Domain types
export type DomainType = 'zzzimeri' | 'tradey';

export interface VisionPromptConfig {
  itemAnalysis: {
    systemPrompt: string;
    userPromptTemplate: string;
  };
  userAnalysis: {
    systemPrompt: string;
    userPromptTemplate: string;
  };
}

export interface MatchingWeightsConfig {
  itemCompatibility: number;      // 0.7 for zzzimeri
  providerCompatibility: number;  // 0.3 for zzzimeri
  minScoreThreshold: number;      // 50
}

export interface UILabelsConfig {
  item: {
    singular: string;    // "Apartment" / "Item"
    plural: string;      // "Apartments" / "Items"
  };
  provider: {
    singular: string;    // "Roommate" / "Seller"
    plural: string;
  };
  seeker: {
    singular: string;    // "Seeker" / "Buyer"
    plural: string;
  };
  action: {
    like: string;        // "Interested" / "Want"
    dislike: string;     // "Pass" / "Skip"
  };
}

export interface DomainConfig {
  type: DomainType;
  vision: VisionPromptConfig;
  matching: MatchingWeightsConfig;
  labels: UILabelsConfig;
}
