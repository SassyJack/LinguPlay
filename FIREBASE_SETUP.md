# Firebase Setup Guide para LinguaPlay

## 🚀 Beginner Steps

### 1. Crear Proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Haz clic en "Create Project"
3. Nombre: `linguaplay`
4. Opción "Enable Google Analytics": Desactiva este checkbox
5. Haz clic en "Create Project"
6. Espera a que termine de crear (puede tomar 1-2 minutos)

### 2. Agregar Aplicación Web

1. En la página principal del proyecto, haz clic en el ícono `<>`
2. Nombre de la app: `linguaplay-web`
3. Marca "Also set up Firebase Hosting"
4. Haz clic en "Register App"
5. En la página "Add SDK", deberías ver tu configuración:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "linguaplay-xxx.firebaseapp.com",
  databaseURL: "https://linguaplay-xxx.firebaseio.com",
  projectId: "linguaplay-xxx",
  storageBucket: "linguaplay-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

6. **Copia estos valores**

### 3. Configurar Variables de Entorno

1. En tu editor, crea (o abre) `.env.local` en la raíz del proyecto:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=linguaplay-xxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://linguaplay-xxx.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=linguaplay-xxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=linguaplay-xxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

2. Reemplaza los valores con los de tu proyecto
3. Guarda el archivo

### 4. Habilitar Realtime Database

1. En Firebase Console, ve a **Realtime Database** (en el menú izq)
2. Haz clic en **"Create Database"**
3. Selecciona región: **us-central1** (por defecto)
4. Modo: **Start in test mode**
5. Haz clic en **Enable**

⚠️ **Importante**: Test mode permite lectura/escritura sin restricciones. Es solo para desarrollo.

### 5. Habilitar Email/Password Authentication

1. Ve a **Authentication** en el menú izquierdo
2. Haz clic en **Get Started**
3. En la pestaña "Sign-in method", haz clic en **Email/Password**
4. Habilita **Email/Password** (primer toggle)
5. Haz clic en **Save**

### 6. Configurar Reglas de Base de Datos (Desarrollo)

1. Ve a **Realtime Database**
2. Haz clic en la pestaña **Rules**
3. Reemplaza el contenido con:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Haz clic en **Publish**

⚠️ Esto solo es para **DESARROLLO**. En producción, configura reglas más restrictivas.

---

## 📱 Uso en la App

### Instalar Firebase

```bash
npm install firebase
```

### Usar Firebase Auth

```typescript
import { firebaseAuthService } from '@/api';

// Sign up
const response = await firebaseAuthService.signup({
  displayName: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  age: 25
});

// Sign in
const response = await firebaseAuthService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Logout
await firebaseAuthService.logout();

// Get current user
const user = firebaseAuthService.getCurrentUser();
```

### Usar Firebase Game Sync

```typescript
import { firebaseGameSyncService } from '@/api';
import { useGameStore, useUserStore } from '@/store';

// Sync progress
const gameState = useGameStore.getState();
const userState = useUserStore.getState();

await firebaseGameSyncService.syncProgress({
  userId: userState.user.id,
  completedActivities: gameState.completedActivities,
  score: gameState.score,
  stars: gameState.stars,
  streak: gameState.streak,
  totalAttempts: gameState.totalAttempts,
  totalCorrect: gameState.totalCorrect,
  componentMistakes: gameState.componentMistakes,
  unlockedAchievements: gameState.unlockedAchievements,
  lastSyncAt: new Date().toISOString(),
});

// Get progress
const progress = await firebaseGameSyncService.getProgress(userId);

// Process sync queue (when back online)
const syncedCount = await firebaseGameSyncService.processSyncQueue();
console.log(`Synced ${syncedCount} offline items`);
```

---

## 🔐 Reglas de Producción (Después)

Una vez que la app esté lista para producción, actualiza las reglas:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        ".validate": "newData.hasChildren(['displayName', 'email', 'subscriptionTier'])"
      }
    },
    "gameProgress": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "current": {
          ".validate": "newData.hasChildren(['userId', 'completedActivities', 'score'])"
        },
        "history": {
          "$key": {
            ".validate": "newData.hasChildren(['userId', 'completedActivities', 'score'])"
          }
        }
      }
    }
  }
}
```

---

## ✅ Checklist

- [ ] Crear proyecto Firebase
- [ ] Agregar aplicación web
- [ ] Copiar configuración
- [ ] Crear .env.local con variables
- [ ] Habilitar Realtime Database
- [ ] Habilitar Email/Password Auth
- [ ] Configurar reglas de test
- [ ] npm install firebase
- [ ] Probar signup/login en la app
- [ ] Probar sync de progreso
- [ ] Configurar reglas de producción antes de deploy

---

## 🐛 Troubleshooting

### Error: "API key not found"
- Asegúrate que las variables están en `.env.local`
- Reinicia el servidor de Expo
- Verifica que los valores están correctos

### Error: "Permission denied"
- Verifica que las reglas de Realtime Database están en "test mode"
- Revisa que `"write": true` está en las reglas

### Error: "User not found"
- Crea un usuario nuevo con signup primero
- Verifica que el email existe en Firebase Console > Authentication

### La app no sincroniza
- Verifica que `useConnectivity()` devuelve `isOnline: true`
- Revisa los logs en Firebase Console > Realtime Database
- Confirma que el data se está escribiendo correctamente

---

## 📚 Recursos Útiles

- [Firebase Console](https://console.firebase.google.com)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**¡Firebase está listo! Tu app puede sincronizar con la nube ahora.** 🎉
