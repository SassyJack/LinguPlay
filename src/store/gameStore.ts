import { create } from 'zustand';
import { persistGameState } from './persistence';

/**
 * Game store state and actions
 * Manages all game progress, activities, achievements, and game logic
 * State is automatically persisted to AsyncStorage on changes
 */

export interface GameStoreState {
  // State
  completedActivities: Record<string, boolean>;
  score: number;
  stars: number;
  streak: number;
  totalAttempts: number;
  totalCorrect: number;
  componentMistakes: Record<string, number>;
  unlockedAchievements: string[];
  isHydrated: boolean;

  // Actions
  completeActivity: (activityId: string, points: number) => void;
  recordAttempt: (componentId: string, isCorrect: boolean) => void;
  resetProgress: () => void;
  unlockAchievement: (achievementId: string) => void;
  getCompletionPercentage: () => number;
  getActivitiesCompleted: () => number;
  hydrate: (state: Partial<GameStoreState>) => void;
}

const initialState = {
  completedActivities: {},
  score: 0,
  stars: 0,
  streak: 0,
  totalAttempts: 0,
  totalCorrect: 0,
  componentMistakes: {},
  unlockedAchievements: [],
  isHydrated: false,
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialState,

  completeActivity: (activityId: string, points: number) => {
    set(state => ({
      completedActivities: {
        ...state.completedActivities,
        [activityId]: true,
      },
      score: state.score + points,
      stars: state.stars + 2,
      totalCorrect: state.totalCorrect + 1,
      totalAttempts: state.totalAttempts + 1,
    }));
  },

  recordAttempt: (componentId: string, isCorrect: boolean) => {
    set(state => ({
      totalAttempts: state.totalAttempts + 1,
      totalCorrect: isCorrect ? state.totalCorrect + 1 : state.totalCorrect,
      componentMistakes: {
        ...state.componentMistakes,
        [componentId]:
          (state.componentMistakes[componentId] || 0) + (isCorrect ? 0 : 1),
      },
      streak: isCorrect ? state.streak + 1 : 0,
    }));
  },

  unlockAchievement: (achievementId: string) => {
    set(state => {
      if (state.unlockedAchievements.includes(achievementId)) {
        return state;
      }
      return {
        unlockedAchievements: [...state.unlockedAchievements, achievementId],
      };
    });
  },

  resetProgress: () => {
    set({ ...initialState, isHydrated: true });
  },

  getCompletionPercentage: () => {
    const completed = Object.keys(get().completedActivities).length;
    return (completed / 24) * 100;
  },

  getActivitiesCompleted: () => {
    return Object.keys(get().completedActivities).length;
  },

  hydrate: (state: Partial<GameStoreState>) => {
    set({ ...state, isHydrated: true });
  },
}));

// Subscribe to state changes and persist to AsyncStorage
useGameStore.subscribe((state: GameStoreState) => {
  // Only persist data-related state, not UI flags
  persistGameState({
    completedActivities: state.completedActivities,
    score: state.score,
    stars: state.stars,
    streak: state.streak,
    totalAttempts: state.totalAttempts,
    totalCorrect: state.totalCorrect,
    componentMistakes: state.componentMistakes,
    unlockedAchievements: state.unlockedAchievements,
  });
});
