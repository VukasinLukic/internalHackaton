import { openAIClient } from '../../../infrastructure/external-services/openai/OpenAIClient';
import { DomainConfig } from '../../../config/domain.config';

export interface ItemAnalysisResult {
  attributes: string[];
  vibes: string[];
  cleanliness?: number;
  features?: string[];
}

export interface UserAnalysisResult {
  traits: string[];
  socialStyle?: string;
  lifestyle?: string[];
}

export class VisionService {
  constructor(private config: DomainConfig) {}

  async analyzeItem(imageUrls: string[]): Promise<ItemAnalysisResult> {
    const { systemPrompt, userPromptTemplate } = this.config.vision.itemAnalysis;

    const userPrompt = userPromptTemplate.replace('{imageUrls}', imageUrls.join(', '));

    const responseText = await openAIClient.analyzeImages(
      systemPrompt,
      userPrompt,
      imageUrls
    );

    try {
      const parsed = JSON.parse(responseText);
      return {
        attributes: parsed.attributes || [],
        vibes: parsed.vibes || [],
        cleanliness: parsed.cleanliness,
        features: parsed.features
      };
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      return { attributes: [], vibes: [] };
    }
  }

  async analyzeUser(imageUrls: string[], bio?: string): Promise<UserAnalysisResult> {
    const { systemPrompt, userPromptTemplate } = this.config.vision.userAnalysis;

    const userPrompt = userPromptTemplate
      .replace('{imageUrls}', imageUrls.join(', '))
      .replace('{bio}', bio || 'No bio provided');

    const responseText = await openAIClient.analyzeImages(
      systemPrompt,
      userPrompt,
      imageUrls
    );

    try {
      const parsed = JSON.parse(responseText);
      return {
        traits: parsed.traits || [],
        socialStyle: parsed.socialStyle,
        lifestyle: parsed.lifestyle
      };
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      return { traits: [] };
    }
  }
}
