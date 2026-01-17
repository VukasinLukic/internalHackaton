export type UserRole = 'provider' | 'seeker';

export interface UserPreferences {
  budget: { min: number; max: number };
  location: { city: string; radius: number; lat?: number; lng?: number };
  moveInDate?: string;
  lifestyle: {
    smoker: boolean;
    pets: boolean;
    earlyBird: boolean;
    cleanliness: number; // 1-5
  };
}

export interface User {
  id: string;
  clerkId?: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  images: string[];
  attributes: string[];      // AI-extracted traits
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
