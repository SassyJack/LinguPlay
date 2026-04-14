import { create } from 'zustand';

/**
 * User store state and actions
 * Manages user authentication, preferences, and subscription tier
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

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  incrementDailyAttempts: () => void;
  resetDailyAttempts: () => void;
  canAttemptActivity: () => boolean;
}

const DAILY_ATTEMPTS_LIMIT_FREE = 5;

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  subscriptionTier: 'free',
  theme: 'system',
  attemptsUsedToday: 0,

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
}));
