import { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { apiClient } from './client';
import { GameSyncService } from './gameSyncService';

/**
 * Network Connectivity Service
 * Monitors network status and triggers sync when back online
 */

export class ConnectivityService {
  private subscribers: Set<(isOnline: boolean) => void> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;
  private isMonitoring = false;

  /**
   * Start monitoring network status
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const isOnline = isConnected && (state.isInternetReachable ?? true);

      // Update API client
      apiClient.setIsOnline(isOnline);

      // Notify subscribers
      this.subscribers.forEach(callback => {
        callback(isOnline);
      });

      // If going online, process sync queue
      if (isOnline) {
        this.processSyncQueue();
      }
    });
  }

  /**
   * Stop monitoring network status
   */
  stopMonitoring(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Subscribe to connectivity changes
   */
  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    try {
      const synced = await GameSyncService.processSyncQueue();
      if (synced > 0) {
        console.log(`Synced ${synced} items`);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }
}

// Singleton instance
export const connectivityService = new ConnectivityService();

/**
 * Hook to monitor connectivity
 */
export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    connectivityService.startMonitoring();
    const unsubscribe = connectivityService.subscribe(setIsOnline);

    return () => {
      unsubscribe();
      connectivityService.stopMonitoring();
    };
  }, []);

  return { isOnline };
};
