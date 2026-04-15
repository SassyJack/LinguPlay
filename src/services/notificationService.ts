import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notifications Service
 * Handles push and local notifications
 */

export class NotificationService {
  private initialized = false;

  /**
   * Initialize notifications
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      this.initialized = true;

      // Request permissions on iOS
      if (Platform.OS === 'ios') {
        await this.requestPermissions();
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      return status === 'granted';
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(
    title: string,
    body: string,
    delay = 1000,
    data?: Record<string, any>
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.ceil(delay / 1000),
        },
      });
    } catch (error) {
      console.warn('Send notification error:', error);
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    title: string,
    description: string,
    icon: string
  ) {
    await this.sendLocalNotification(
      `🎉 ${icon} Logro Desbloqueado`,
      `${title}: ${description}`,
      500,
      { type: 'achievement' }
    );
  }

  /**
   * Send activity success notification
   */
  async sendActivitySuccessNotification(points: number) {
    await this.sendLocalNotification(
      '✨ ¡Correcto!',
      `Has ganado ${points} puntos y 1 estrella`,
      500,
      { type: 'activity_success' }
    );
  }

  /**
   * Send streak milestone notification
   */
  async sendStreakMilestoneNotification(streak: number) {
    if (streak % 5 === 0 && streak > 0) {
      await this.sendLocalNotification(
        `🔥 Racha de ${streak}`,
        `¡Sigue así! Llevas ${streak} intentos correctos seguidos`,
        500,
        { type: 'streak_milestone' }
      );
    }
  }

  /**
   * Get last notification response
   */
  async getLastNotificationResponse() {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.warn('Get last notification error:', error);
      return null;
    }
  }

  /**
   * Listen to notification responses
   */
  onNotificationResponse(callback: (response: Notifications.NotificationResponse) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => subscription.remove();
  }
}

// Singleton instance
export const notificationService = new NotificationService();
