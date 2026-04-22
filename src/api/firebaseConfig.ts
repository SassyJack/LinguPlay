/**
 * Firebase Configuration
 * Cloud backend setup for LinguaPlay
 * 
 * To use this:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add a web app to the project
 * 3. Copy your config and replace the values below
 * 4. Enable Realtime Database or Firestore
 * 5. Set up authentication (Email/Password)
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// ========== STEP 1: Add your Firebase config here ==========
// Get this from Firebase Console > Project Settings > Your apps > Web
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCPGF5AZhy8Cwr-Zqu_OjcxRE63YO5LAGo',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'linguplay-2d2ae.firebaseapp.com',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://linguplay-2d2ae-default-rtdb.firebaseio.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'linguplay-2d2ae',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'linguplay-2d2ae.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '59070765265',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:59070765265:web:b70d73c991720ffc450df0',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Realtime Database
export const database = getDatabase(app);

// Alternative: Initialize Firestore (uncomment if using Firestore instead)
// export const firestore = getFirestore(app);

export default app;

/**
 * ========== SETUP INSTRUCTIONS ==========
 * 
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Create Project" and name it "linguaplay"
 * 3. Add a Web app and copy the config object
 * 4. In your .env.local file (create if doesn't exist):
 *    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
 *    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *    EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
 *    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
 *    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 *    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
 *    EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
 * 
 * 5. Enable Realtime Database:
 *    - In Firebase Console > Realtime Database > Create Database
 *    - Choose a location (us-central1 is default)
 *    - Select "Start in test mode" for development
 * 
 * 6. Enable Authentication:
 *    - In Firebase Console > Authentication > Get Started
 *    - Enable "Email/Password" provider
 * 
 * 7. Set up Database Rules (Test Mode):
 *    {
 *      "rules": {
 *        ".read": true,
 *        ".write": true
 *      }
 *    }
 *    
 *    Production Rules:
 *    {
 *      "rules": {
 *        "users": {
 *          "$uid": {
 *            ".read": "$uid === auth.uid",
 *            ".write": "$uid === auth.uid"
 *          }
 *        },
 *        "gameProgress": {
 *          "$uid": {
 *            ".read": "$uid === auth.uid",
 *            ".write": "$uid === auth.uid"
 *          }
 *        }
 *      }
 *    }
 * 
 * ========== USAGE ==========
 * 
 * In your services:
 * 
 * import { auth, database } from '@/api/firebaseConfig';
 * import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
 * import { ref, set, get } from 'firebase/database';
 * 
 * // Sign up
 * const userCredential = await createUserWithEmailAndPassword(auth, email, password);
 * 
 * // Sign in
 * const userCredential = await signInWithEmailAndPassword(auth, email, password);
 * 
 * // Save user data
 * await set(ref(database, 'users/' + userId), {
 *   displayName: 'John Doe',
 *   email: email,
 *   createdAt: new Date().toISOString()
 * });
 * 
 * // Get user data
 * const snapshot = await get(ref(database, 'users/' + userId));
 * const userData = snapshot.val();
 */
