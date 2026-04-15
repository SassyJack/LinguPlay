/**
 * API Integration Examples
 * Demonstrates how to use the API services in screens and components
 */

/**
 * EXAMPLE 1: Sync game progress after completing activity
 * 
 * Place this in ActivityScreen after handleSubmit succeeds:
 * 
 * ```typescript
 * import { GameSyncService } from '../api';
 * 
 * const handleSubmit = useCallback(async () => {
 *   try {
 *     // ... existing submit logic ...
 * 
 *     const gameState = useGameStore.getState();
 *     const userState = useUserStore.getState();
 * 
 *     // Sync to server (or queue if offline)
 *     if (userState.user) {
 *       await GameSyncService.syncProgress({
 *         userId: userState.user.id,
 *         completedActivities: gameState.completedActivities,
 *         score: gameState.score,
 *         stars: gameState.stars,
 *         streak: gameState.streak,
 *         totalAttempts: gameState.totalAttempts,
 *         totalCorrect: gameState.totalCorrect,
 *         componentMistakes: gameState.componentMistakes,
 *         unlockedAchievements: gameState.unlockedAchievements,
 *         lastSyncAt: new Date().toISOString(),
 *       });
 *     }
 *   } catch (error) {
 *     // Errors are queued automatically if offline
 *     console.error('Sync error:', error);
 *   }
 * }, []);
 * ```
 */

/**
 * EXAMPLE 2: User login (HomeScreen)
 * 
 * ```typescript
 * import { AuthService } from '../api';
 * import { useUserStore } from '../store/userStore';
 * 
 * const handleLogin = useCallback(async () => {
 *   try {
 *     const response = await AuthService.login({
 *       email: 'user@example.com',
 *       password: 'password123',
 *     });
 * 
 *     // Save user to store
 *     useUserStore.getState().setUser({
 *       id: response.user.id,
 *       displayName: response.user.displayName,
 *       email: response.user.email,
 *     });
 * 
 *     // Update subscription tier
 *     useUserStore.getState().setSubscriptionTier(response.subscriptionTier);
 * 
 *     // Navigate to home
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * }, []);
 * ```
 */

/**
 * EXAMPLE 3: Check connectivity status
 * 
 * ```typescript
 * import { useConnectivity } from '../api';
 * 
 * export const MyComponent: React.FC = () => {
 *   const { isOnline } = useConnectivity();
 * 
 *   return (
 *     <View>
 *       <Text>
 *         Status: {isOnline ? 'Online' : 'Offline'}
 *       </Text>
 *     </View>
 *   );
 * };
 * ```
 */

/**
 * EXAMPLE 4: Get sync queue status
 * 
 * ```typescript
 * import { GameSyncService } from '../api';
 * 
 * const checkSyncQueue = async () => {
 *   const queue = await GameSyncService.getSyncQueue();
 *   console.log(`${queue.length} items pending sync`);
 * };
 * ```
 */

/**
 * EXAMPLE 5: User logout
 * 
 * ```typescript
 * import { AuthService } from '../api';
 * import { useUserStore } from '../store/userStore';
 * 
 * const handleLogout = useCallback(async () => {
 *   try {
 *     await AuthService.logout();
 * 
 *     // Clear user store
 *     useUserStore.getState().logout();
 * 
 *     // Navigate to login
 *   } catch (error) {
 *     console.error('Logout error:', error);
 *   }
 * }, []);
 * ```
 */

export const APIIntegrationExamples = {
  // Placeholder - this file is for documentation only
};
