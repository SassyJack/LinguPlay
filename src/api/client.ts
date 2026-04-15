import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Client
 * Handles all HTTP communication with backend
 * Includes authentication, error handling, and offline detection
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.linguaplay.local';
const AUTH_TOKEN_KEY = '@linguaplay/auth_token';

export class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      async config => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );

    // Load auth token from storage
    this.loadAuthToken();
  }

  /**
   * Load stored auth token
   */
  private async loadAuthToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  /**
   * Save auth token
   */
  private async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      this.authToken = token;
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  /**
   * Clear auth token
   */
  private async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      this.authToken = null;
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Promise<never> {
    if (!error.response) {
      // Network error - offline
      this.isOnline = false;
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'No internet connection',
        isOffline: true,
      });
    }

    const status = error.response.status;
    const data = error.response.data as any;

    if (status === 401) {
      // Unauthorized - clear token and redirect to login
      this.clearAuthToken();
      return Promise.reject({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
        status,
      });
    }

    if (status === 403) {
      return Promise.reject({
        code: 'FORBIDDEN',
        message: 'Access denied',
        status,
      });
    }

    if (status >= 500) {
      return Promise.reject({
        code: 'SERVER_ERROR',
        message: data?.error?.message || 'Server error',
        status,
      });
    }

    return Promise.reject({
      code: 'API_ERROR',
      message: data?.error?.message || 'Request failed',
      status,
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.saveAuthToken(token);
  }

  /**
   * Check if online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Set online status
   */
  setIsOnline(online: boolean): void {
    this.isOnline = online;
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get(url, config);
    this.isOnline = true;
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    this.isOnline = true;
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put(url, data, config);
    this.isOnline = true;
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch(url, data, config);
    this.isOnline = true;
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    this.isOnline = true;
    return response.data;
  }

  /**
   * Logout and clear token
   */
  async logout(): Promise<void> {
    await this.clearAuthToken();
  }
}

// Singleton instance
export const apiClient = new APIClient();
