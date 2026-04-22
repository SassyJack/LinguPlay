/**
 * Firebase Authentication Service
 * Handles user sign up, sign in, and profile management
 * Replaces the basic authService.ts with Firebase backend
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from './firebaseConfig';
import { LoginRequest, LoginResponse, SignupRequest, UserProfile } from './types';

export class FirebaseAuthService {
  /**
   * Sign up a new user
   */
  static async signup(request: SignupRequest): Promise<LoginResponse> {
    try {
      console.log('Iniciando registro en Firebase Auth para:', request.email);
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        request.email,
        request.password
      );

      const user = userCredential.user;
      console.log('Usuario creado en Auth con UID:', user.uid);

      // Update profile
      await updateProfile(user, {
        displayName: request.displayName,
      });

      // Save user data to database
      const userProfile: UserProfile = {
        id: user.uid,
        displayName: request.displayName,
        email: request.email,
        subscriptionTier: 'free',
        role: request.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Intentando guardar perfil en Realtime Database...', userProfile);
      await set(ref(database, `users/${user.uid}`), userProfile);
      console.log('Perfil guardado exitosamente en Database');

      // Get token (for compatibility)
      const token = await user.getIdToken();

      return {
        token,
        user: {
          id: user.uid,
          displayName: request.displayName,
          email: request.email,
          role: userProfile.role,
        },
        subscriptionTier: 'free',
      };
    } catch (error: any) {
      console.error('Error detallado en Signup:', error);
      throw new Error(error.message || 'Signup failed');
    }
  }

  /**
   * Sign in user
   */
  static async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        request.email,
        request.password
      );

      const user = userCredential.user;

      // Get user profile from database
      const snapshot = await get(ref(database, `users/${user.uid}`));
      let userProfile: UserProfile;
      
      if (snapshot.exists()) {
        userProfile = snapshot.val();
      } else {
        // Fallback profile if database entry missing
        userProfile = {
          id: user.uid,
          displayName: user.displayName || 'Usuario',
          email: user.email || '',
          subscriptionTier: 'free',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Save it for next time
        await set(ref(database, `users/${user.uid}`), userProfile);
      }

      // Get token
      const token = await user.getIdToken();

      return {
        token,
        user: {
          id: user.uid,
          displayName: userProfile.displayName,
          email: userProfile.email,
          role: userProfile.role,
        },
        subscriptionTier: userProfile.subscriptionTier,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const snapshot = await get(ref(database, `users/${user.uid}`));
      return snapshot.val() || null;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Update display name in auth
      if (updates.displayName) {
        await updateProfile(user, {
          displayName: updates.displayName,
        });
      }

      // Update profile in database
      await update(ref(database, `users/${user.uid}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Update profile failed');
    }
  }

  /**
   * Watch auth state
   */
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get auth token
   */
  static async getIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }
}

// Export singleton
export const firebaseAuthService = FirebaseAuthService;
