/**
 * API Services Exports
 * All API-related services and utilities
 */

export { apiClient } from './client';
export { AuthService } from './authService';
export { GameSyncService } from './gameSyncService';
export { connectivityService, useConnectivity } from './connectivityService';

// Firebase services (new backend)
export { firebaseAuthService } from './firebaseAuthService';
export { firebaseGameSyncService } from './firebaseGameSyncService';

export type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  ActivityProgress,
  GameProgressSync,
  GameProgressResponse,
  SyncQueueItem,
  ApiResponse,
  UserProfile,
} from './types';
