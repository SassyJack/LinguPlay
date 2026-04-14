# LinguaPlay

Prototipo de aplicacion movil multiplataforma en Expo/React Native para fortalecer los componentes del lenguaje en ninos de 7 a 9 anos desde un enfoque fonoaudiologico y gamificado.

## Que incluye

- 4 componentes del lenguaje: fonologico, semantico, sintactico y pragmatico.
- 3 niveles progresivos por componente.
- 2 actividades por nivel, para un total de 24 actividades.
- Navegacion por componentes, niveles y actividades.
- Sistema de puntaje, estrellas, racha y logros.
- Retroalimentacion inmediata y apoyo adaptativo basico.
- Apoyo auditivo simulado mediante pistas visibles.

## Estructura

- `App.js`: interfaz principal, flujo de navegacion y logica del juego.
- `src/data/gameData.js`: contenido terapeutico base del videojuego.
- `app.json`: configuracion de Expo.
- `package.json`: dependencias y scripts.
- `dist/`: build web exportado para visualizacion estatica.

## Requisitos previos

- Node.js 20 o superior.
- npm.
- Expo Go en el celular si deseas probar en dispositivo movil.

## Instalacion

```bash
npm install
```

## Como ejecutar la app

### Opcion 1. Modo desarrollo general

Inicia el servidor de Expo:

```bash
npm run start
```

Esto abrira el panel de Expo en terminal. Desde ahi puedes:

- Presionar `w` para abrir la version web.
- Presionar `a` para abrir Android.
- Escanear el codigo QR con Expo Go para probar en celular.

### Opcion 2. Ver la app directamente en navegador

```bash
npm run web
```

Esto inicia la aplicacion en modo web usando Expo.

### Opcion 3. Abrir en Android

```bash
npm run android
```

Requiere emulador Android encendido o dispositivo disponible.

### Opcion 4. Abrir en iOS

```bash
npm run ios
```

Esta opcion depende de contar con entorno compatible para iOS.

## Como ver el build web exportado

El proyecto ya genera una version web compilada en:

- `dist/index.html`

Para regenerar ese build:

```bash
npx expo export --platform web
```

Luego puedes servir la carpeta `dist` con cualquier servidor estatico.

Ejemplo:

```bash
npx serve dist
```

## Validaciones realizadas

Se verifico la integridad del proyecto con estas comprobaciones:

- `npx expo export --platform web`
- `npx expo-doctor`

Resultado:

- La exportacion web compila correctamente.
- La configuracion de Expo y dependencias queda alineada para el prototipo actual.

## Siguientes mejoras sugeridas

- Persistencia real del progreso con almacenamiento local.
- Audio grabado o TTS para instrucciones.
- Drag and drop nativo en actividades de orden.
- Registro por usuario y panel para terapeuta o acudiente.
- Ajuste adaptativo automatico segun errores por componente.
