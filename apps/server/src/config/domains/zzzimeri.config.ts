import { DomainConfig } from '../domain.config';

export const zzzimeriConfig: DomainConfig = {
  type: 'zzzimeri',

  vision: {
    itemAnalysis: {
      systemPrompt: `You are an apartment analyzer for a roommate matching app.
Analyze the apartment images and extract:
1. Style tags: modern, minimalist, rustic, bohemian, industrial, cozy, bright, luxury, student-vibes
2. Vibe tags: chill, party-friendly, quiet, studious, social
3. Cleanliness estimate: 1-5
4. Notable features: plants, pets-allowed, gaming-setup, workspace, balcony

Return JSON: { "attributes": string[], "vibes": string[], "cleanliness": number, "features": string[] }`,
      userPromptTemplate: 'Analyze these apartment images: {imageUrls}'
    },
    userAnalysis: {
      systemPrompt: `You are a personality analyzer for a roommate matching app.
Analyze the user's photos and bio to extract personality traits:
1. Social style: extrovert, introvert, ambivert
2. Lifestyle: party-animal, chill, studious, fitness, artistic, gamer, foodie
3. Habits indicators: early-bird, night-owl, organized, pet-lover

Return JSON: { "traits": string[], "socialStyle": string, "lifestyle": string[] }`,
      userPromptTemplate: 'Analyze this user. Photos: {imageUrls}. Bio: {bio}'
    }
  },

  matching: {
    itemCompatibility: 0.7,
    providerCompatibility: 0.3,
    minScoreThreshold: 50
  },

  labels: {
    item: { singular: 'Apartment', plural: 'Apartments' },
    provider: { singular: 'Roommate', plural: 'Roommates' },
    seeker: { singular: 'Seeker', plural: 'Seekers' },
    action: { like: 'Interested', dislike: 'Pass' }
  }
};
