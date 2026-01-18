import { create } from 'zustand';
import type { FeedItem, SwipeAction } from '../types';
import { api } from '../services/api';

interface FeedState {
  feedItems: FeedItem[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Match modal state
  showMatchModal: boolean;
  currentMatch: FeedItem | null;

  // Actions
  fetchFeed: (limit?: number) => Promise<void>;
  swipe: (itemId: string, action: SwipeAction) => Promise<boolean>;
  nextItem: () => void;
  resetFeed: () => void;

  // Match modal actions
  showMatch: (item: FeedItem) => void;
  hideMatchModal: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  feedItems: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  hasMore: true,

  showMatchModal: false,
  currentMatch: null,

  fetchFeed: async (limit = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getFeed(limit);

      if (response.success && response.data) {
        set({
          feedItems: response.data.items,
          currentIndex: 0,
          hasMore: response.data.items.length === limit,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch feed',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Network error. Please check your connection.',
        isLoading: false,
      });
    }
  },

  swipe: async (itemId: string, action: SwipeAction) => {
    try {
      const response = await api.swipe(itemId, action);

      if (response.success) {
        // Check if it's a match (API returns matched: true)
        const isMatch = response.data?.matched === true;

        if (isMatch) {
          const currentItem = get().feedItems[get().currentIndex];
          if (currentItem) {
            get().showMatch(currentItem);
          }
        }

        // Move to next item
        get().nextItem();

        return isMatch;
      }

      return false;
    } catch (error) {
      console.error('Swipe error:', error);
      return false;
    }
  },

  nextItem: () => {
    const { currentIndex, feedItems, hasMore } = get();

    if (currentIndex < feedItems.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else if (hasMore) {
      // Fetch more items when reaching the end
      get().fetchFeed();
    }
  },

  resetFeed: () => {
    set({
      feedItems: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
      hasMore: true,
    });
  },

  showMatch: (item: FeedItem) => {
    set({
      showMatchModal: true,
      currentMatch: item,
    });
  },

  hideMatchModal: () => {
    set({
      showMatchModal: false,
      currentMatch: null,
    });
  },
}));
