/**
 * API Types and Models
 * Defines all data structures for communication with backend
 */

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    role: 'user' | 'admin';
  };
  subscriptionTier: 'free' | 'premium';
}

export interface SignupRequest {
  displayName: string;
  email: string;
  password: string;
  age?: number;
  role?: 'user' | 'admin';
}

// Game Progress
export interface ActivityProgress {
  activityId: string;
  componentId: string;
  levelId: number;
  completed: boolean;
  attempts: number;
  correctAttempts: number;
  lastAttemptAt: string;
}

export interface GameProgressSync {
  userId: string;
  completedActivities: Record<string, boolean>;
  score: number;
  stars: number;
  streak: number;
  totalAttempts: number;
  totalCorrect: number;
  componentMistakes: Record<string, number>;
  unlockedAchievements: string[];
  lastSyncAt: string;
}

export interface GameProgressResponse {
  success: boolean;
  data: {
    synced: boolean;
    conflictResolution?: 'server' | 'client' | 'merged';
    serverState?: GameProgressSync;
  };
}

// Sync Queue (offline support)
export interface SyncQueueItem {
  id: string;
  type: 'activity_complete' | 'achievement_unlock' | 'profile_update';
  timestamp: string;
  data: any;
  retries: number;
  lastError?: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// User Profile
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  subscriptionTier: 'free' | 'premium';
  role: 'user' | 'admin';
  accountStatus?: 'active' | 'deleted';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
