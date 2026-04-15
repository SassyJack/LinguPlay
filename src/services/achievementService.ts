/**
 * Achievements System
 * Defines and manages achievement unlocking
 */

export type AchievementType =
  | 'first_activity'
  | 'first_component_complete'
  | 'all_components_complete'
  | 'perfect_score'
  | 'streak_5'
  | 'streak_10'
  | 'fifty_points'
  | 'hundred_points'
  | 'ten_stars';

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  points: number;
  condition: (state: any) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
}

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS: Record<AchievementType, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  first_activity: {
    id: 'first_activity',
    title: 'Primer Paso',
    description: 'Completa tu primera actividad',
    icon: '🎯',
    points: 10,
    condition: (state: any) => state.totalAttempts > 0 && state.totalCorrect > 0,
  },

  first_component_complete: {
    id: 'first_component_complete',
    title: 'Componente Dominado',
    description: 'Completa todos los niveles de un componente',
    icon: '🏆',
    points: 50,
    condition: (state: any) => {
      // Check if any component has all activities completed
      const componentMistakes = state.componentMistakes || {};
      return Object.keys(componentMistakes).length > 0;
    },
  },

  all_components_complete: {
    id: 'all_components_complete',
    title: 'Maestro Lingüístico',
    description: 'Completa todos los componentes del lenguaje',
    icon: '🎓',
    points: 200,
    condition: (state: any) => {
      const completed = Object.keys(state.completedActivities || {}).length;
      return completed >= 24; // All 4 components × 3 levels × 2 activities
    },
  },

  perfect_score: {
    id: 'perfect_score',
    title: 'Perfección',
    description: 'Completa una actividad sin errores',
    icon: '⭐',
    points: 30,
    condition: (state: any) => state.totalAttempts === state.totalCorrect && state.totalAttempts > 0,
  },

  streak_5: {
    id: 'streak_5',
    title: 'Racha de 5',
    description: 'Consigue 5 intentos seguidos correctos',
    icon: '🔥',
    points: 25,
    condition: (state: any) => state.streak >= 5,
  },

  streak_10: {
    id: 'streak_10',
    title: 'Racha de 10',
    description: 'Consigue 10 intentos seguidos correctos',
    icon: '🌟',
    points: 100,
    condition: (state: any) => state.streak >= 10,
  },

  fifty_points: {
    id: 'fifty_points',
    title: 'Cincuenta y Uno',
    description: 'Acumula 50 puntos',
    icon: '💰',
    points: 0,
    condition: (state: any) => state.score >= 50,
  },

  hundred_points: {
    id: 'hundred_points',
    title: 'Centésimo',
    description: 'Acumula 100 puntos',
    icon: '💎',
    points: 50,
    condition: (state: any) => state.score >= 100,
  },

  ten_stars: {
    id: 'ten_stars',
    title: 'Diez Estrellas',
    description: 'Consigue 10 estrellas',
    icon: '✨',
    points: 75,
    condition: (state: any) => state.stars >= 10,
  },
};

/**
 * Check which achievements should be unlocked
 */
export const checkAchievementsToUnlock = (
  gameState: any,
  unlockedAchievements: string[]
): AchievementType[] => {
  const newlyUnlocked: AchievementType[] = [];

  for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
    const isAlreadyUnlocked = unlockedAchievements.includes(achievementId);

    if (!isAlreadyUnlocked && achievement.condition(gameState)) {
      newlyUnlocked.push(achievementId as AchievementType);
    }
  }

  return newlyUnlocked;
};

/**
 * Get achievement by ID with full details
 */
export const getAchievementDetails = (
  achievementId: AchievementType,
  isUnlocked: boolean,
  unlockedAt?: string
): Achievement => {
  const base = ACHIEVEMENTS[achievementId];
  return {
    ...base,
    unlocked: isUnlocked,
    unlockedAt,
  };
};

/**
 * Get all achievements with unlock status
 */
export const getAllAchievementsWithStatus = (
  unlockedAchievements: Array<{ id: string; unlockedAt?: string }>
): Achievement[] => {
  return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const unlocked = unlockedAchievements.find(a => a.id === id);
    return {
      ...achievement,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt,
    };
  });
};
