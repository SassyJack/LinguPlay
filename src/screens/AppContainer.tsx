import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import { hydrateGameStore, hydrateUserStore } from '../store/persistence';
import {
  HomeScreen,
  ComponentSelectorScreen,
  LevelSelectorScreen,
  ActivityScreen,
  ResultsScreen,
} from './index';
import { useTheme } from '../theme';
import { GameSyncService, useConnectivity } from '../api';
import {
  notificationService,
  audioService,
  checkAchievementsToUnlock,
} from '../services';

/**
 * Main app container component
 * Handles store hydration, screen rendering, navigation, sync, and advanced features
 */
export const AppContainer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { theme } = useTheme();
  const { isOnline } = useConnectivity();

  // Get store states
  const currentScreen = useUIStore(state => state.currentScreen);
  const selectedComponentId = useUIStore(state => state.selectedComponentId);
  const selectedLevelId = useUIStore(state => state.selectedLevelId);
  const selectedActivityId = useUIStore(state => state.selectedActivityId);

  const gameHydrate = useGameStore(state => state.hydrate);
  const gameIsHydrated = useGameStore(state => state.isHydrated);
  const gameUnlockAchievement = useGameStore(state => state.unlockAchievement);
  const userHydrate = useUserStore(state => state.hydrate);
  const userIsHydrated = useUserStore(state => state.isHydrated);

  /**
   * Initialize all services on app launch
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notifications
        await notificationService.initialize();

        // Load persisted game state
        const gameState = await hydrateGameStore();
        if (gameState) {
          gameHydrate(gameState);
        } else {
          gameHydrate({});
        }

        // Load persisted user state
        const userState = await hydrateUserStore();
        if (userState) {
          userHydrate(userState);
        } else {
          // Create demo user for development/testing
          const setUser = useUserStore.getState().setUser;
          setUser({
            id: 'demo-user-' + Date.now(),
            displayName: 'Estudiante Demo',
            email: 'demo@linguaplay.local',
          });
          userHydrate({});
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Set default hydrated state even on error
        gameHydrate({});
        userHydrate({});
        // Create demo user even on error
        const setUser = useUserStore.getState().setUser;
        setUser({
          id: 'demo-user-' + Date.now(),
          displayName: 'Estudiante Demo',
          email: 'demo@linguaplay.local',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      audioService.cleanup();
    };
  }, [gameHydrate, userHydrate]);

  /**
   * Check for new achievements
   */
  useEffect(() => {
    if (gameIsHydrated && userIsHydrated) {
      const gameState = useGameStore.getState();
      const newAchievements = checkAchievementsToUnlock(
        gameState,
        gameState.unlockedAchievements || []
      );

      for (const achievement of newAchievements) {
        gameUnlockAchievement(achievement);
        // Send notification
        const achievementDef = require('../services/achievementService').ACHIEVEMENTS[achievement];
        if (achievementDef) {
          notificationService.sendAchievementNotification(
            achievementDef.title,
            achievementDef.description,
            achievementDef.icon
          );
        }
      }
    }
  }, [gameIsHydrated, gameUnlockAchievement]);

  /**
   * Sync game progress when online status changes
   */
  useEffect(() => {
    if (isOnline && gameIsHydrated) {
      syncGameProgress();
    }
  }, [isOnline, gameIsHydrated]);

  /**
   * Sync game progress to server
   */
  const syncGameProgress = async () => {
    try {
      const gameState = useGameStore.getState();
      const userState = useUserStore.getState();

      if (!userState.user) {
        // Not authenticated, skip sync
        return;
      }

      const progressData = {
        userId: userState.user.id,
        completedActivities: gameState.completedActivities,
        score: gameState.score,
        stars: gameState.stars,
        streak: gameState.streak,
        totalAttempts: gameState.totalAttempts,
        totalCorrect: gameState.totalCorrect,
        componentMistakes: gameState.componentMistakes,
        unlockedAchievements: gameState.unlockedAchievements,
        lastSyncAt: new Date().toISOString(),
      };

      await GameSyncService.syncProgress(progressData);
      console.log('Game progress synced successfully');
    } catch (error) {
      console.error('Error syncing game progress:', error);
    }
  };

  // Show loading indicator while initializing
  if (isInitializing || !gameIsHydrated || !userIsHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          testID="app-initializing"
        />
      </View>
    );
  }

  // Render screens based on current navigation state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen testID="home-screen" />;
      case 'component':
        return <ComponentSelectorScreen testID="component-selector-screen" />;
      case 'level':
        return selectedComponentId ? (
          <LevelSelectorScreen
            componentId={selectedComponentId}
            testID="level-selector-screen"
          />
        ) : (
          <HomeScreen testID="home-screen" />
        );
      case 'activity':
        return selectedActivityId ? (
          <ActivityScreen
            componentId={selectedComponentId || ''}
            levelId={selectedLevelId || ''}
            activityId={selectedActivityId}
            testID="activity-screen"
          />
        ) : (
          <HomeScreen testID="home-screen" />
        );
      case 'results':
        return <ResultsScreen testID="results-screen" />;
      default:
        return <HomeScreen testID="home-screen" />;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {renderScreen()}
    </View>
  );
};
