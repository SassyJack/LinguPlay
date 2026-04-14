import { useCallback } from 'react';
import { useGameStore, type GameStoreState } from '../store';

/**
 * Custom hook for game logic
 * Provides convenient methods to interact with game state
 */
export const useGame = () => {
  const store = useGameStore();

  // Wrapped actions with better typing and defaults
  const completeActivity = useCallback(
    (activityId: string, points: number = 10) => {
      store.completeActivity(activityId, points);
    },
    [store]
  );

  const recordAttempt = useCallback(
    (componentId: string, isCorrect: boolean) => {
      store.recordAttempt(componentId, isCorrect);
    },
    [store]
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      store.unlockAchievement(achievementId);
    },
    [store]
  );

  const resetProgress = useCallback(() => {
    store.resetProgress();
  }, [store]);

  // Computed state
  const completionPercentage = store.getCompletionPercentage();
  const activitiesCompleted = store.getActivitiesCompleted();
  const isGameComplete = completionPercentage === 100;

  return {
    // State
    completedActivities: store.completedActivities,
    score: store.score,
    stars: store.stars,
    streak: store.streak,
    totalAttempts: store.totalAttempts,
    totalCorrect: store.totalCorrect,
    unlockedAchievements: store.unlockedAchievements,
    componentMistakes: store.componentMistakes,

    // Computed state
    completionPercentage,
    activitiesCompleted,
    isGameComplete,

    // Actions
    completeActivity,
    recordAttempt,
    unlockAchievement,
    resetProgress,
  };
};
