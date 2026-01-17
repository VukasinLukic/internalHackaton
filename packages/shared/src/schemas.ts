import { z } from 'zod';

// User Schemas
export const UserRoleSchema = z.enum(['seeker', 'provider']);

export const UserPreferencesSchema = z.object({
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  location: z.object({
    city: z.string(),
    radius: z.number().min(0).max(50), // km
  }),
  moveInDate: z.string().datetime().optional(),
  lifestyle: z.object({
    smoker: z.boolean(),
    pets: z.boolean(),
    earlyBird: z.boolean(),
    cleanliness: z.number().min(1).max(5),
  }),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  preferences: UserPreferencesSchema.optional(),
  aiTags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});

// Apartment Schemas
export const ApartmentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  price: z.number().min(0),
  size: z.number().min(0), // m2
  location: z.object({
    address: z.string(),
    city: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  description: z.string().optional(),
  images: z.array(z.string().url()),
  aiTags: z.array(z.string()).default([]),
  vibes: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});

// Match/Swipe Schemas
export const SwipeActionSchema = z.enum(['like', 'dislike']);

export const SwipeSchema = z.object({
  userId: z.string(),
  apartmentId: z.string(),
  action: SwipeActionSchema,
  timestamp: z.string().datetime(),
});

// Chat Schemas
export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  timestamp: z.string().datetime(),
});

// API Response Schemas
export const MatchScoreSchema = z.object({
  apartmentCompatibility: z.number().min(0).max(100),
  roommateCompatibility: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
});
