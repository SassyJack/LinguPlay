import { apiClient } from './client';
import { GameProgressSync, GameProgressResponse, ApiResponse } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Game Sync Service
 * Synchronizes game progress with backend
 * Supports offline mode with local queue
 */

const SYNC_QUEUE_KEY = '@linguaplay/sync_queue';
const LAST_SYNC_KEY = '@linguaplay/last_sync';

export const GameSyncService = {
  /**
   * Sync game progress to server
   */
  async syncProgress(progress: GameProgressSync): Promise<GameProgressResponse> {
    try {
      if (!apiClient.getIsOnline()) {
        // Store in queue if offline
        await this.queueSync({
          type: 'activity_complete',
          data: progress,
        });

        return {
          success: true,
          data: {
            synced: false,
          },
        };
      }

      // Send to server
      const response = await apiClient.post<ApiResponse<GameProgressResponse>>(
        '/game/progress/sync',
        progress
      );

      if (response.success && response.data) {
        // Save last sync timestamp
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        return response.data;
      }

      throw new Error(response.error?.message || 'Sync failed');
    } catch (error: any) {
      console.error('Sync error:', error);

      // Queue for retry if offline
      if (error.isOffline) {
        await this.queueSync({
          type: 'activity_complete',
          data: progress,
        });
      }

      throw error;
    }
  },

  /**
   * Get game progress from server
   */
  async getProgress(): Promise<GameProgressSync | null> {
    try {
      if (!apiClient.getIsOnline()) {
        console.warn('Offline: cannot fetch progress');
        return null;
      }

      const response = await apiClient.get<ApiResponse<GameProgressSync>>(
        '/game/progress'
      );

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get progress error:', error);
      return null;
    }
  },

  /**
   * Queue sync item for later
   */
  async queueSync(item: any): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const newItem = {
        id: `sync_${Date.now()}`,
        timestamp: new Date().toISOString(),
        retries: 0,
        ...item,
      };
      queue.push(newItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Queue sync error:', error);
    }
  },

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get sync queue error:', error);
      return [];
    }
  },

  /**
   * Process sync queue (when back online)
   */
  async processSyncQueue(): Promise<number> {
    try {
      const queue = await this.getSyncQueue();

      if (!apiClient.getIsOnline() || queue.length === 0) {
        return 0;
      }

      let successCount = 0;
      const failedItems: any[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'activity_complete') {
            await this.syncProgress(item.data);
            successCount++;
          }
        } catch (error) {
          item.retries++;
          if (item.retries < 3) {
            failedItems.push(item);
          }
        }
      }

      // Save remaining failed items
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedItems));
      return successCount;
    } catch (error) {
      console.error('Process sync queue error:', error);
      return 0;
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Get last sync time error:', error);
      return null;
    }
  },

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Clear sync queue error:', error);
    }
  },
};
