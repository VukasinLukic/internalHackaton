import { useAuthStore } from '../stores/authStore';
import type {
  ApiResponse,
  User,
  UserPreferences,
  Apartment,
  FeedItem,
  Match,
  Message,
  Conversation,
  SwipeAction,
  UserAttribute,
} from '../types';

// API Configuration
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Helper function to get user ID and role for backend auth
const getAuthHeaders = (): HeadersInit => {
  const { user } = useAuthStore.getState();
  if (!user) return {};

  return {
    'X-User-Id': user.id,
    'X-User-Role': user.role,
  };
};

// Generic request function with auth
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const authHeaders = getAuthHeaders();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null as T,
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      data: null as T,
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// HTTP method helpers
function GET<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'GET' });
}

function POST<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

function PATCH<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

function DELETE<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}

// API Endpoints
export const api = {
  // ============ AUTH ============
  login: (email: string, password: string) =>
    POST<{ token: string; user: User }>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string }) =>
    POST<{ token: string; user: User }>('/auth/register', data),

  // ============ USERS ============
  createUser: (data: {
    name: string;
    email: string;
    role: 'seeker' | 'provider';
    bio?: string;
    images: string[];
  }) => POST<User>('/users', data),

  getUser: (userId: string) => GET<{ user: User }>(`/users/${userId}`),

  updateUser: (userId: string, data: Partial<User>) =>
    PATCH<{ user: User }>(`/users/${userId}`, data),

  analyzeProfile: (userId: string, images?: string[], bio?: string) =>
    POST<{ attributes: UserAttribute[] }>(`/users/${userId}/analyze`, {
      images,
      bio,
    }),

  updatePreferences: (userId: string, preferences: any) =>
    PATCH<User>(`/users/${userId}/preferences`, preferences),

  // Note: Image upload is handled client-side via Cloudinary SDK
  // This is a placeholder for direct Cloudinary upload from mobile
  uploadImage: async (imageUri: string): Promise<ApiResponse<{ url: string }>> => {
    try {
      // For now, we'll return the local URI as we'll implement Cloudinary SDK separately
      // TODO: Implement Cloudinary direct upload from mobile
      return {
        data: { url: imageUri },
        success: true,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  // ============ APARTMENTS/ITEMS ============
  createItem: (data: {
    price: number;
    size?: number;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    images: string[];
    location: {
      address?: string;
      city: string;
      lat?: number;
      lng?: number;
    };
  }) => POST<{ item: Apartment; attributes: UserAttribute[] }>('/items', data),

  getItem: (itemId: string) => GET<{ item: Apartment }>(`/items/${itemId}`),

  updateItem: (itemId: string, data: Partial<Apartment>) =>
    PATCH<{ item: Apartment }>(`/items/${itemId}`, data),

  deleteItem: (itemId: string) => DELETE<{ success: boolean }>(`/items/${itemId}`),

  getMyItems: () => GET<{ items: Apartment[] }>('/items/my'),

  // ============ FEED ============
  getFeed: (limit = 20) => GET<{ items: FeedItem[] }>(`/feed?limit=${limit}`),

  // ============ INTERACTIONS ============
  swipe: (itemId: string, action: SwipeAction) =>
    POST<{ matched: boolean; match?: Match }>('/interactions/swipe', {
      itemId,
      action,
    }),

  // ============ MATCHES ============
  getMatches: () => GET<{ matches: Match[] }>('/matches'),

  getMatch: (matchId: string) => GET<{ match: Match }>(`/matches/${matchId}`),

  acceptMatch: (matchId: string) =>
    POST<{ match: Match }>(`/matches/${matchId}/accept`),

  rejectMatch: (matchId: string) =>
    POST<{ success: boolean }>(`/matches/${matchId}/reject`),

  // ============ MESSAGES ============
  getConversations: () => GET<{ conversations: Conversation[] }>('/conversations'),

  getMessages: (matchId: string) =>
    GET<{ messages: Message[] }>(`/messages/${matchId}`),

  sendMessage: (matchId: string, content: string) =>
    POST<{ message: Message }>('/messages', { matchId, content }),

  markMessageAsRead: (messageId: string) =>
    PATCH<{ success: boolean }>(`/messages/${messageId}/read`, {}),
};

export default api;
