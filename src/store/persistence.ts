import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistence utility for Zustand stores
 * Provides async hydration and persistence of state
 */

const STORAGE_KEYS = {
  GAME_STATE: '@linguaplay/game',
  USER_STATE: '@linguaplay/user',
};

/**
 * Hydrate game store from AsyncStorage
 */
export const hydrateGameStore = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error hydrating game store:', error);
  }
  return null;
};

/**
 * Hydrate user store from AsyncStorage
 */
export const hydrateUserStore = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error hydrating user store:', error);
  }
  return null;
};

/**
 * Persist game state to AsyncStorage
 */
export const persistGameState = async (state: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error persisting game state:', error);
  }
};

/**
 * Persist user state to AsyncStorage
 */
export const persistUserState = async (state: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error persisting user state:', error);
  }
};

/**
 * Clear all persisted data (for logout or reset)
 */
export const clearAllPersistedData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GAME_STATE,
      STORAGE_KEYS.USER_STATE,
    ]);
  } catch (error) {
    console.error('Error clearing persisted data:', error);
  }
};

/**
 * Clear specific store data
 */
export const clearGameStateFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};

export const clearUserStateFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_STATE);
  } catch (error) {
    console.error('Error clearing user state:', error);
  }
};
