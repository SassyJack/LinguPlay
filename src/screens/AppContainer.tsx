import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '../components';
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
  LoginScreen,
  SignupScreen,
  AdminDashboardScreen,
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

  const currentScreen = useUIStore(state => state.currentScreen);
  const selectedComponentId = useUIStore(state => state.selectedComponentId);
  const selectedLevelId = useUIStore(state => state.selectedLevelId);
  const selectedActivityId = useUIStore(state => state.selectedActivityId);
  const showNotification = useUIStore(state => state.showNotification);
  const notificationMessage = useUIStore(state => state.notificationMessage);
  const notificationType = useUIStore(state => state.notificationType);

  const gameHydrate = useGameStore(state => state.hydrate);
  const gameIsHydrated = useGameStore(state => state.isHydrated);
  const gameUnlockAchievement = useGameStore(state => state.unlockAchievement);
  const userHydrate = useUserStore.getState().hydrate;
  const userIsAuthenticated = useUserStore(state => state.isAuthenticated);
  const userIsHydrated = useUserStore(state => state.isHydrated);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await notificationService.initialize();

        const gameState = await hydrateGameStore();
        if (gameState) {
          gameHydrate(gameState);
        } else {
          gameHydrate({});
        }

        const userState = await hydrateUserStore();
        if (userState && userState.user) {
          userHydrate(userState);
        } else {
          userHydrate({ user: null, isAuthenticated: false });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        gameHydrate({});
        userHydrate({ user: null, isAuthenticated: false });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    return () => {
      audioService.cleanup();
    };
  }, [gameHydrate, userHydrate]);

  useEffect(() => {
    if (gameIsHydrated && userIsHydrated) {
      const gameState = useGameStore.getState();
      const newAchievements = checkAchievementsToUnlock(
        gameState,
        gameState.unlockedAchievements || []
      );

      for (const achievement of newAchievements) {
        gameUnlockAchievement(achievement);
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
  }, [gameIsHydrated, userIsHydrated, gameUnlockAchievement]);

  useEffect(() => {
    if (isOnline && gameIsHydrated) {
      syncGameProgress();
    }
  }, [isOnline, gameIsHydrated]);

  const syncGameProgress = async () => {
    try {
      const gameState = useGameStore.getState();
      const userState = useUserStore.getState();

      if (!userState.user) {
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

  const renderScreen = () => {
    if (!userIsAuthenticated) {
      switch (currentScreen) {
        case 'signup':
          return <SignupScreen />;
        default:
          return <LoginScreen />;
      }
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen testID="home-screen" />;
      case 'admin_dashboard':
        return <AdminDashboardScreen />;
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
        return (
          <ActivityScreen
            componentId={selectedComponentId || ''}
            levelId={selectedLevelId || ''}
            activityId={selectedActivityId || ''}
            testID="activity-screen"
          />
        );
      case 'results':
        return <ResultsScreen testID="results-screen" />;
      default:
        return <HomeScreen testID="home-screen" />;
    }
  };

  const toastBackgroundColor =
    notificationType === 'success'
      ? theme.colors.success
      : notificationType === 'warning'
        ? theme.colors.warning
        : notificationType === 'error'
          ? theme.colors.error
          : theme.colors.info;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {renderScreen()}
      {showNotification ? (
        <View
          pointerEvents="none"
          style={[styles.toast, { backgroundColor: toastBackgroundColor }]}
        >
          <Text variant="body" color={theme.colors.white} style={styles.toastText}>
            {notificationMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  toastText: {
    lineHeight: 22,
  },
});
