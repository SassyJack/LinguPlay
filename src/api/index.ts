/**
 * API Services Exports
 * All API-related services and utilities
 */

export { apiClient } from './client';
// Firebase services (new backend) - Use these as defaults
export { FirebaseAuthService as AuthService } from './firebaseAuthService';
export { FirebaseGameSyncService as GameSyncService } from './firebaseGameSyncService';
export { connectivityService, useConnectivity } from './connectivityService';

// Original mock services (keep for reference if needed)
export { AuthService as MockAuthService } from './authService';
export { GameSyncService as MockGameSyncService } from './gameSyncService';

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
