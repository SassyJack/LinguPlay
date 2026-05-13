/**
 * Services Exports
 * All business logic services
 */

export {
  useFadeInAnimation,
  useSlideInAnimation,
  useScaleAnimation,
  useBounceAnimation,
  usePulseAnimation,
  useShakeAnimation,
  useRotateAnimation,
  springConfig,
  timingConfig,
} from './animationService';

export { HapticService } from './hapticService';
export { audioService, type AudioService as AudioServiceType } from './audioService';
export { speechService } from './speechService';
export {
  ACHIEVEMENTS,
  checkAchievementsToUnlock,
  getAchievementDetails,
  getAllAchievementsWithStatus,
  type Achievement,
  type AchievementType,
} from './achievementService';

export { notificationService } from './notificationService';
export { wompiService } from './wompiService';
