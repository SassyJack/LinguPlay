# Play Store Setup para LinguaPlay

## Estado actual

El proyecto ya tiene una base inicial para publicar con Expo + EAS:

- `app.json` con `android.package`
- `versionCode` inicial
- `ios.bundleIdentifier`
- `eas.json` con perfiles `development`, `preview` y `production`

## Antes del primer build

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Iniciar sesion en Expo

```bash
eas login
```

### 3. Vincular proyecto con Expo

```bash
eas init
```

Esto te dara un `projectId`. Reemplaza en `app.json`:

```json
"projectId": "REPLACE_WITH_EAS_PROJECT_ID"
```

### 4. Verificar identificadores

Actualmente quedaron configurados asi:

- Android package: `com.linguaplay.app`
- iOS bundle identifier: `com.linguaplay.app`

Si deseas otro identificador, cambialo antes del primer release.

## Generar build para Google Play

```bash
eas build --platform android --profile production
```

Ese comando genera un archivo `.aab`, que es el formato recomendado para Play Store.

## Primera subida a Google Play

1. Crear app en Google Play Console
2. Ir a `Test interno` o `Produccion`
3. Crear release
4. Subir el `.aab`
5. Completar:
   - ficha de tienda
   - politica de privacidad
   - clasificacion por edades
   - contenido de la app
   - permisos y seguridad de datos

## Envio automatizado despues de la primera subida

Cuando la app ya exista en Play Console y tengas credenciales configuradas:

```bash
eas submit --platform android --profile production
```

## Recomendacion

Haz primero una publicacion en `Test interno` antes de mandar a produccion.
