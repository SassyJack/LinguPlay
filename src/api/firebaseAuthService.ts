/**
 * Firebase Authentication Service
 * Handles user sign up, sign in, and profile management
 * Replaces the basic authService.ts with Firebase backend
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from './firebaseConfig';
import { apiClient } from './client';
import { LoginRequest, LoginResponse, SignupRequest, UserProfile } from './types';

export class FirebaseAuthService {
  private static getReadableAuthErrorMessage(error: unknown): string {
    if (!(error instanceof FirebaseError)) {
      return 'No fue posible completar la autenticacion. Intenta de nuevo.';
    }

    switch (error.code) {
      case 'auth/invalid-email':
        return 'El correo electronico no tiene un formato valido.';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta registrada con este correo electronico.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'El correo o la contrasena son incorrectos.';
      case 'auth/weak-password':
        return 'La contrasena es demasiado debil. Debe tener al menos 6 caracteres.';
      case 'auth/missing-password':
        return 'Debes ingresar una contrasena.';
      case 'auth/network-request-failed':
        return 'No se pudo conectar con el servidor. Revisa tu conexion a internet.';
      case 'auth/too-many-requests':
        return 'Se bloquearon temporalmente los intentos. Espera un momento e intenta de nuevo.';
      default:
        return 'No fue posible completar la autenticacion. Intenta de nuevo.';
    }
  }

  private static async saveUserProfile(
    userId: string,
    profile: UserProfile
  ): Promise<void> {
    await set(ref(database, `users/${userId}`), profile);
  }

  /**
   * Sign up a new user
   */
  static async signup(request: SignupRequest): Promise<LoginResponse> {
    try {
      const normalizedEmail = request.email.trim().toLowerCase();
      console.log('Iniciando registro en Firebase Auth para:', normalizedEmail);
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        request.password
      );

      const user = userCredential.user;
      console.log('Usuario creado en Auth con UID:', user.uid);

      // Update profile
      await updateFirebaseProfile(user, {
        displayName: request.displayName,
      });

      // Save user data to database
      const userProfile: UserProfile = {
        id: user.uid,
        displayName: request.displayName,
        email: normalizedEmail,
        subscriptionTier: 'free',
        role: request.role || 'user',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        console.log('Intentando guardar perfil en Realtime Database...', userProfile);
        await this.saveUserProfile(user.uid, userProfile);
        console.log('Perfil guardado exitosamente en Database');
      } catch (profileError) {
        console.warn('No se pudo guardar el perfil en Realtime Database durante el registro:', profileError);
      }

      // Get token (for compatibility)
      const token = await user.getIdToken();
      apiClient.setAuthToken(token);

      return {
        token,
        user: {
          id: user.uid,
          displayName: request.displayName,
          email: normalizedEmail,
          role: userProfile.role,
        },
        subscriptionTier: 'free',
      };
    } catch (error) {
      console.error('Error detallado en Signup:', error);
      throw new Error(this.getReadableAuthErrorMessage(error));
    }
  }

  /**
   * Sign in user
   */
  static async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const normalizedEmail = request.email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        request.password
      );

      const user = userCredential.user;

      // Get user profile from database
      let userProfile: UserProfile;

      try {
        const snapshot = await get(ref(database, `users/${user.uid}`));
        if (snapshot.exists()) {
          userProfile = snapshot.val();
        } else {
          userProfile = {
            id: user.uid,
            displayName: user.displayName || 'Usuario',
            email: user.email || '',
            subscriptionTier: 'free',
            role: 'user',
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await this.saveUserProfile(user.uid, userProfile);
        }
      } catch (profileError) {
        console.warn('No se pudo leer el perfil desde Realtime Database durante el login:', profileError);
        userProfile = {
          id: user.uid,
          displayName: user.displayName || 'Usuario',
          email: user.email || '',
          subscriptionTier: 'free',
          role: 'user',
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      if (userProfile.accountStatus === 'deleted') {
        await signOut(auth);
        throw new Error('Esta cuenta fue desactivada por un administrador.');
      }

      // Get token
      const token = await user.getIdToken();
      apiClient.setAuthToken(token);

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
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(this.getReadableAuthErrorMessage(error));
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
        await updateFirebaseProfile(user, {
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
