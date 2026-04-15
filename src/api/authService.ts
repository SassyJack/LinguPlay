import { apiClient } from './client';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UserProfile,
  ApiResponse,
} from './types';

/**
 * Authentication Service
 * Handles user login, signup, and profile management
 */

export const AuthService = {
  /**
   * User login
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        request
      );

      if (response.success && response.data) {
        const { token } = response.data;
        apiClient.setAuthToken(token);
        return response.data;
      }

      throw new Error(response.error?.message || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * User signup
   */
  async signup(request: SignupRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/signup',
        request
      );

      if (response.success && response.data) {
        const { token } = response.data;
        apiClient.setAuthToken(token);
        return response.data;
      }

      throw new Error(response.error?.message || 'Signup failed');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>(
        '/auth/profile'
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error?.message || 'Failed to fetch profile');
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        '/auth/profile',
        updates
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error?.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      // Optional: notify server of logout
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      await apiClient.logout();
    }
  },
};
