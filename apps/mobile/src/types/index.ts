// User types
export type UserRole = 'seeker' | 'provider';

export interface UserAttribute {
  name: string;
  confidence: number;
}

export interface UserPreferences {
  budget: {
    min: number;
    max: number;
  };
  location?: {
    city: string;
    radius: number; // km
  };
  smoker: boolean;
  pets: boolean;
  cleanliness: number; // 1-5
  sleepSchedule: 'early' | 'night';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  images: string[];
  attributes: UserAttribute[];
  preferences?: UserPreferences;
  createdAt: string;
}

// Apartment/Item types
export interface ApartmentLocation {
  address?: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface Apartment {
  id: string;
  price: number;
  size?: number; // sqm
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  images: string[];
  location: ApartmentLocation;
  attributes: UserAttribute[];
  providerId: string;
  createdAt: string;
}

// Feed types
export interface FeedItemScore {
  apartmentCompatibility: number;
  roommateCompatibility: number;
  total: number;
  reasons: string[];
}

export interface FeedItem {
  item: Apartment;
  provider: {
    id: string;
    name: string;
    images: string[];
    attributes: UserAttribute[];
  };
  score: FeedItemScore;
}

// Match types
export type MatchStatus = 'pending' | 'accepted' | 'rejected';

export interface Match {
  id: string;
  apartment: Apartment;
  seeker: User;
  provider: User;
  score: FeedItemScore;
  status: MatchStatus;
  createdAt: string;
}

// Chat types
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    images: string[];
  };
  apartment: {
    id: string;
    location: string;
    price: number;
  };
  lastMessage?: Message;
  unreadCount: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Swipe action type
export type SwipeAction = 'like' | 'dislike' | 'superlike';
