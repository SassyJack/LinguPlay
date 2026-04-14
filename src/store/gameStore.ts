import { create } from 'zustand';

/**
 * Game store state and actions
 * Manages all game progress, activities, achievements, and game logic
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

  // Actions
  completeActivity: (activityId: string, points: number) => void;
  recordAttempt: (componentId: string, isCorrect: boolean) => void;
  resetProgress: () => void;
  unlockAchievement: (achievementId: string) => void;
  getCompletionPercentage: () => number;
  getActivitiesCompleted: () => number;
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
    set(initialState);
  },

  getCompletionPercentage: () => {
    const completed = Object.keys(get().completedActivities).length;
    return (completed / 24) * 100;
  },

  getActivitiesCompleted: () => {
    return Object.keys(get().completedActivities).length;
  },
}));
