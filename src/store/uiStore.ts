import { create } from 'zustand';

/**
 * UI store state and actions
 * Manages UI state like theme, notifications, and screen navigation
 */

export type ScreenType =
  | 'home'
  | 'component'
  | 'level'
  | 'activity'
  | 'results'
  | 'login'
  | 'signup'
  | 'admin_dashboard';

export interface UIStoreState {
  // State
  currentScreen: ScreenType;
  selectedComponentId: string | null;
  selectedLevelId: string | null;
  selectedActivityId: string | null;
  showNotification: boolean;
  notificationMessage: string;
  notificationType: 'success' | 'error' | 'info' | 'warning';

  // Actions
  navigateTo: (screen: ScreenType, params?: Record<string, string>) => void;
  goBack: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  hideNotification: () => void;
  selectComponent: (componentId: string) => void;
  selectLevel: (levelId: string) => void;
  selectActivity: (activityId: string) => void;
  resetNavigation: () => void;
}

export const useUIStore = create<UIStoreState>(set => ({
  currentScreen: 'home',
  selectedComponentId: null,
  selectedLevelId: null,
  selectedActivityId: null,
  showNotification: false,
  notificationMessage: '',
  notificationType: 'info',

  navigateTo: (screen: ScreenType, params?: Record<string, string>) => {
    set((state) => ({
      currentScreen: screen,
      selectedComponentId: params?.componentId !== undefined ? params.componentId : state.selectedComponentId,
      selectedLevelId: params?.levelId !== undefined ? params.levelId : state.selectedLevelId,
      selectedActivityId: params?.activityId !== undefined ? params.activityId : state.selectedActivityId,
    }));
  },

  goBack: () => {
    set(state => {
      if (state.currentScreen === 'activity') {
        return { currentScreen: 'level' };
      }
      if (state.currentScreen === 'level') {
        return { currentScreen: 'component' };
      }
      if (state.currentScreen === 'component') {
        return { currentScreen: 'home' };
      }
      if (state.currentScreen === 'results') {
        return { currentScreen: 'home' };
      }
      return state;
    });
  },

  showToast: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    set({
      showNotification: true,
      notificationMessage: message,
      notificationType: type,
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      set({
        showNotification: false,
      });
    }, 3000);
  },

  hideNotification: () => {
    set({
      showNotification: false,
    });
  },

  selectComponent: (componentId: string) => {
    set({
      selectedComponentId: componentId,
    });
  },

  selectLevel: (levelId: string) => {
    set({
      selectedLevelId: levelId,
    });
  },

  selectActivity: (activityId: string) => {
    set({
      selectedActivityId: activityId,
    });
  },

  resetNavigation: () => {
    set({
      currentScreen: 'home',
      selectedComponentId: null,
      selectedLevelId: null,
      selectedActivityId: null,
      showNotification: false,
      notificationMessage: '',
    });
  },
}));
