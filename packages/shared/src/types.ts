import { z } from 'zod';
import {
  UserSchema,
  UserRoleSchema,
  UserPreferencesSchema,
  ApartmentSchema,
  SwipeSchema,
  SwipeActionSchema,
  MessageSchema,
  MatchScoreSchema,
} from './schemas.js';

// Inferred types from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type Apartment = z.infer<typeof ApartmentSchema>;
export type Swipe = z.infer<typeof SwipeSchema>;
export type SwipeAction = z.infer<typeof SwipeActionSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;

// Additional types
export interface AIAnalysisResult {
  tags: string[];
  vibes: string[];
  confidence: number;
}

export interface FeedItem {
  apartment: Apartment;
  owner: User;
  matchScore: MatchScore;
}

export interface ChatRoom {
  id: string;
  participants: [string, string];
  messages: Message[];
  createdAt: string;
}
