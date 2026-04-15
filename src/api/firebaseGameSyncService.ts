/**
 * Firebase Game Sync Service
 * Synchronizes game progress with Firebase Realtime Database
 * Handles offline queue and conflict resolution
 */

import { ref, set, get, update, push, remove } from 'firebase/database';
import { database } from './firebaseConfig';
import { GameProgressSync, GameProgressResponse, SyncQueueItem } from './types';
import { apiClient } from './client';

const SYNC_QUEUE_KEY = '@linguaplay/sync_queue_firebase';

export class FirebaseGameSyncService {
  /**
   * Sync game progress to Firebase
   */
  static async syncProgress(
    progress: GameProgressSync
  ): Promise<GameProgressResponse> {
    try {
      // Check if online
      if (!apiClient.getIsOnline()) {
        // Queue for later
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

      // Write to Firebase
      const userProgressRef = ref(
        database,
        `gameProgress/${progress.userId}/current`
      );

      await set(userProgressRef, {
        ...progress,
        lastSyncAt: new Date().toISOString(),
      });

      // Also keep a history entry
      const historyRef = ref(
        database,
        `gameProgress/${progress.userId}/history`
      );
      await push(historyRef, {
        ...progress,
        syncedAt: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          synced: true,
          conflictResolution: 'server',
          serverState: progress,
        },
      };
    } catch (error: any) {
      console.error('Firebase sync error:', error);

      // Queue for retry
      await this.queueSync({
        type: 'activity_complete',
        data: progress,
      });

      return {
        success: false,
        data: {
          synced: false,
        },
      };
    }
  }

  /**
   * Get game progress from Firebase
   */
  static async getProgress(
    userId: string
  ): Promise<GameProgressSync | null> {
    try {
      if (!apiClient.getIsOnline()) {
        console.warn('Offline: cannot fetch progress');
        return null;
      }

      const progressRef = ref(
        database,
        `gameProgress/${userId}/current`
      );
      const snapshot = await get(progressRef);

      return snapshot.val() || null;
    } catch (error: any) {
      console.error('Get progress error:', error);
      return null;
    }
  }

  /**
   * Queue sync item for later
   */
  static async queueSync(item: any): Promise<void> {
    try {
      const queue = await this.getSyncQueue();

      const queueItem: SyncQueueItem = {
        id: Math.random().toString(36),
        type: item.type,
        timestamp: new Date().toISOString(),
        data: item.data,
        retries: 0,
      };

      queue.push(queueItem);

      // Save to storage
      const jsonQueue = JSON.stringify(queue);
      // In a real app, would use AsyncStorage here
      localStorage.setItem(SYNC_QUEUE_KEY, jsonQueue);
    } catch (error) {
      console.error('Queue sync error:', error);
    }
  }

  /**
   * Get sync queue
   */
  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const jsonQueue = localStorage.getItem(SYNC_QUEUE_KEY);
      return jsonQueue ? JSON.parse(jsonQueue) : [];
    } catch (error) {
      console.error('Get sync queue error:', error);
      return [];
    }
  }

  /**
   * Process sync queue when back online
   */
  static async processSyncQueue(): Promise<number> {
    try {
      const queue = await this.getSyncQueue();

      if (!apiClient.getIsOnline() || queue.length === 0) {
        return 0;
      }

      let successCount = 0;
      const failedItems: SyncQueueItem[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'activity_complete') {
            const result = await this.syncProgress(item.data);
            if (result.success && result.data.synced) {
              successCount++;
            } else {
              item.retries++;
              if (item.retries < 3) {
                failedItems.push(item);
              }
            }
          }
        } catch (error) {
          item.retries++;
          if (item.retries < 3) {
            failedItems.push(item);
          }
        }
      }

      // Save remaining failed items
      const jsonQueue = JSON.stringify(failedItems);
      localStorage.setItem(SYNC_QUEUE_KEY, jsonQueue);

      return successCount;
    } catch (error) {
      console.error('Process sync queue error:', error);
      return 0;
    }
  }

  /**
   * Clear sync queue
   */
  static async clearSyncQueue(): Promise<void> {
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Clear sync queue error:', error);
    }
  }
}

// Export singleton
export const firebaseGameSyncService = FirebaseGameSyncService;
