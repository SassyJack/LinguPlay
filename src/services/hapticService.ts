import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Service
 * Provides vibration feedback for user interactions
 */

export const HapticService = {
  /**
   * Light tap feedback
   */
  tap: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic tap error:', error);
    }
  },

  /**
   * Medium impact feedback
   */
  impact: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic impact error:', error);
    }
  },

  /**
   * Heavy impact feedback
   */
  heavyImpact: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic heavy impact error:', error);
    }
  },

  /**
   * Success vibration pattern
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic success error:', error);
    }
  },

  /**
   * Warning vibration pattern
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic warning error:', error);
    }
  },

  /**
   * Error vibration pattern
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic error feedback error:', error);
    }
  },

  /**
   * Selection feedback
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic selection error:', error);
    }
  },
};
