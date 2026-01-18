import { create } from 'zustand';
import type { Match, MatchStatus } from '../types';
import { api } from '../services/api';

interface MatchState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;

  // Filtered views
  pendingMatches: Match[];
  acceptedMatches: Match[];

  // Actions
  fetchMatches: () => Promise<void>;
  acceptMatch: (matchId: string) => Promise<boolean>;
  rejectMatch: (matchId: string) => Promise<boolean>;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  get pendingMatches() {
    return get().matches.filter((m) => m.status === 'pending');
  },

  get acceptedMatches() {
    return get().matches.filter((m) => m.status === 'accepted');
  },

  fetchMatches: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getMatches();

      if (response.success && response.data) {
        const matches = response.data.matches || [];
        set({
          matches,
          pendingMatches: matches.filter((m: Match) => m.status === 'pending'),
          acceptedMatches: matches.filter((m: Match) => m.status === 'accepted'),
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch matches',
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

  acceptMatch: async (matchId: string) => {
    try {
      const response = await api.acceptMatch(matchId);

      if (response.success) {
        get().updateMatchStatus(matchId, 'accepted');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Accept match error:', error);
      return false;
    }
  },

  rejectMatch: async (matchId: string) => {
    try {
      const response = await api.rejectMatch(matchId);

      if (response.success) {
        get().updateMatchStatus(matchId, 'rejected');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Reject match error:', error);
      return false;
    }
  },

  updateMatchStatus: (matchId: string, status: MatchStatus) => {
    const matches = get().matches.map((match) =>
      match.id === matchId ? { ...match, status } : match
    );

    set({
      matches,
      pendingMatches: matches.filter((m) => m.status === 'pending'),
      acceptedMatches: matches.filter((m) => m.status === 'accepted'),
    });
  },
}));
