import { create } from 'zustand';
import { persistUserState } from './persistence';

/**
 * User store state and actions
 * Manages user authentication, preferences, and subscription tier
 * Persists: user, subscriptionTier, theme
 * Does NOT persist: attemptsUsedToday (resets daily)
 */

export interface User {
  id: string;
  displayName: string;
  email?: string;
}

export type SubscriptionTier = 'free' | 'premium';

export interface UserStoreState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  theme: 'light' | 'dark' | 'system';
  attemptsUsedToday: number;
  isHydrated: boolean;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  incrementDailyAttempts: () => void;
  resetDailyAttempts: () => void;
  canAttemptActivity: () => boolean;
  hydrate: (state: Partial<UserStoreState>) => void;
}

const DAILY_ATTEMPTS_LIMIT_FREE = 5;

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  subscriptionTier: 'free' as SubscriptionTier,
  theme: 'system' as const,
  attemptsUsedToday: 0,
  isHydrated: false,

  setUser: (user: User) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      attemptsUsedToday: 0,
    });
  },

  setSubscriptionTier: (tier: SubscriptionTier) => {
    set({
      subscriptionTier: tier,
    });
  },

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({
      theme,
    });
  },

  incrementDailyAttempts: () => {
    set(state => ({
      attemptsUsedToday: state.attemptsUsedToday + 1,
    }));
  },

  resetDailyAttempts: () => {
    set({
      attemptsUsedToday: 0,
    });
  },

  canAttemptActivity: () => {
    const state = get();
    const { subscriptionTier, attemptsUsedToday } = state;

    if (subscriptionTier === 'premium') {
      return true; // Premium has unlimited attempts
    }

    return attemptsUsedToday < DAILY_ATTEMPTS_LIMIT_FREE;
  },

  hydrate: (state: Partial<UserStoreState>) => {
    set({ ...state, isHydrated: true, attemptsUsedToday: 0 });
  },
}));

// Subscribe to state changes and persist to AsyncStorage (excluding attemptsUsedToday)
useUserStore.subscribe((state: UserStoreState) => {
  // Only persist user data, not attempt count (resets daily)
  persistUserState({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    subscriptionTier: state.subscriptionTier,
    theme: state.theme,
  });
});
