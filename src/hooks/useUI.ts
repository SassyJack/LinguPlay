import { useCallback } from 'react';
import { useUIStore, type ScreenType } from '../store';

/**
 * Custom hook for UI navigation and notifications
 * Provides convenient methods to manage screen navigation and toasts
 */
export const useUI = () => {
  const store = useUIStore();

  // Wrapped actions for better DX
  const navigateTo = useCallback(
    (screen: ScreenType, params?: Record<string, string>) => {
      store.navigateTo(screen, params);
    },
    [store]
  );

  const goBack = useCallback(() => {
    store.goBack();
  }, [store]);

  const goHome = useCallback(() => {
    store.navigateTo('home');
  }, [store]);

  const showToast = useCallback(
    (message: string, type?: 'success' | 'error' | 'info' | 'warning') => {
      store.showToast(message, type);
    },
    [store]
  );

  const hideNotification = useCallback(() => {
    store.hideNotification();
  }, [store]);

  const selectComponent = useCallback(
    (componentId: string) => {
      store.selectComponent(componentId);
    },
    [store]
  );

  const selectLevel = useCallback(
    (levelId: string) => {
      store.selectLevel(levelId);
    },
    [store]
  );

  const selectActivity = useCallback(
    (activityId: string) => {
      store.selectActivity(activityId);
    },
    [store]
  );

  const resetNavigation = useCallback(() => {
    store.resetNavigation();
  }, [store]);

  // Convenience methods for common navigations
  const goToComponent = useCallback(
    (componentId: string) => {
      store.navigateTo('component', { componentId });
    },
    [store]
  );

  const goToLevel = useCallback(
    (componentId: string, levelId: string) => {
      store.navigateTo('level', { componentId, levelId });
    },
    [store]
  );

  const goToActivity = useCallback(
    (componentId: string, levelId: string, activityId: string) => {
      store.navigateTo('activity', { componentId, levelId, activityId });
    },
    [store]
  );

  return {
    // State
    currentScreen: store.currentScreen,
    selectedComponentId: store.selectedComponentId,
    selectedLevelId: store.selectedLevelId,
    selectedActivityId: store.selectedActivityId,
    showNotification: store.showNotification,
    notificationMessage: store.notificationMessage,
    notificationType: store.notificationType,

    // Navigation actions
    navigateTo,
    goBack,
    goHome,
    goToComponent,
    goToLevel,
    goToActivity,

    // Toast/Notification actions
    showToast,
    hideNotification,

    // Selection actions
    selectComponent,
    selectLevel,
    selectActivity,
    resetNavigation,
  };
};
