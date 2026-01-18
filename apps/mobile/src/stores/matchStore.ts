import { create } from 'zustand';
import type { Match, MatchStatus } from '../types';

// 🎭 DEMO MODE - NO API - Sve fake!
interface MatchState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;

  // Filtered views
  pendingMatches: Match[];
  acceptedMatches: Match[];

  // Actions
  fetchMatches: () => Promise<void>;
  fetchMatch: (matchId: string) => Promise<void>;
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

  // 🎭 FAKE - Samo simulacija
  fetchMatches: async () => {
    console.log('[MATCHES] 🎭 DEMO MODE - No real matches');
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({
      matches: [],
      pendingMatches: [],
      acceptedMatches: [],
      isLoading: false,
    });
  },

  // 🎭 FAKE - Samo simulacija
  fetchMatch: async (matchId: string) => {
    console.log('[MATCHES] 🎭 DEMO MODE - Fake match fetch');
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // 🎭 FAKE - Samo simulacija
  acceptMatch: async (matchId: string) => {
    console.log('[MATCHES] 🎭 DEMO MODE - Fake match accepted');
    await new Promise(resolve => setTimeout(resolve, 300));
    get().updateMatchStatus(matchId, 'accepted');
    return true;
  },

  // 🎭 FAKE - Samo simulacija
  rejectMatch: async (matchId: string) => {
    console.log('[MATCHES] 🎭 DEMO MODE - Fake match rejected');
    await new Promise(resolve => setTimeout(resolve, 300));
    get().updateMatchStatus(matchId, 'rejected');
    return true;
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
