import { useCallback } from 'react';
import { useUserStore, type User, type SubscriptionTier } from '../store';

/**
 * Custom hook for user state and authentication
 * Provides convenient methods to interact with user data
 */
export const useUser = () => {
  const store = useUserStore();

  // Wrapped actions
  const setUser = useCallback(
    (user: User) => {
      store.setUser(user);
    },
    [store]
  );

  const logout = useCallback(() => {
    store.logout();
  }, [store]);

  const setSubscriptionTier = useCallback(
    (tier: SubscriptionTier) => {
      store.setSubscriptionTier(tier);
    },
    [store]
  );

  const setTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      store.setTheme(theme);
    },
    [store]
  );

  const incrementDailyAttempts = useCallback(() => {
    store.incrementDailyAttempts();
  }, [store]);

  const resetDailyAttempts = useCallback(() => {
    store.resetDailyAttempts();
  }, [store]);

  // Computed state
  const isPremium = store.subscriptionTier === 'premium';
  const attemptsRemaining =
    store.subscriptionTier === 'premium'
      ? Infinity
      : 5 - store.attemptsUsedToday;

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    subscriptionTier: store.subscriptionTier,
    theme: store.theme,
    attemptsUsedToday: store.attemptsUsedToday,

    // Computed state
    isPremium,
    attemptsRemaining,

    // Actions
    setUser,
    logout,
    setSubscriptionTier,
    setTheme,
    incrementDailyAttempts,
    resetDailyAttempts,
    canAttemptActivity: store.canAttemptActivity,
  };
};
