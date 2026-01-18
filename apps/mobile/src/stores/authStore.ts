import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole, UserPreferences } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Onboarding state
  onboardingRole: UserRole | null;
  onboardingPhotos: string[];
  onboardingName: string;
  onboardingBio: string;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;

  // Onboarding actions
  setOnboardingRole: (role: UserRole) => void;
  setOnboardingPhotos: (photos: string[]) => void;
  addOnboardingPhoto: (photo: string) => void;
  setOnboardingName: (name: string) => void;
  setOnboardingBio: (bio: string) => void;
  clearOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Onboarding state
      onboardingRole: null,
      onboardingPhotos: [],
      onboardingName: '',
      onboardingBio: '',

      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          onboardingRole: null,
          onboardingPhotos: [],
          onboardingName: '',
          onboardingBio: '',
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setToken: (token: string) => {
        set({ token });
      },

      // Onboarding actions
      setOnboardingRole: (role: UserRole) => {
        set({ onboardingRole: role });
      },

      setOnboardingPhotos: (photos: string[]) => {
        set({ onboardingPhotos: photos });
      },

      addOnboardingPhoto: (photo: string) => {
        const currentPhotos = get().onboardingPhotos;
        set({ onboardingPhotos: [...currentPhotos, photo] });
      },

      setOnboardingName: (name: string) => {
        set({ onboardingName: name });
      },

      setOnboardingBio: (bio: string) => {
        set({ onboardingBio: bio });
      },

      clearOnboarding: () => {
        set({
          onboardingRole: null,
          onboardingPhotos: [],
          onboardingName: '',
          onboardingBio: '',
        });
      },
    }),
    {
      name: 'zzzimeri-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
