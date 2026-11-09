# Smart Pantry – Despensa Inteligente

Aplicación multiplataforma de despensa con Expo SDK 57, React Native, TypeScript,
Expo Router y Firebase Authentication/Firestore. Permite administrar productos,
categorías, avisos de caducidad y listas de compras; sin Firebase configurado puede
ejecutarse en modo demo con datos de ejemplo.

## Requisitos

- Node.js 20 o superior y npm 10 o superior.
- Expo Go en Android/iOS o un development build para funciones nativas que Expo Go
  no incluye. Para desarrollo web basta un navegador moderno.
- Un proyecto Firebase para habilitar autenticación y sincronización de datos.

## Instalación desde cero

Desde la raíz del repositorio:

```powershell
npm install
Copy-Item .env.example .env
```

Completa en `.env` las seis variables que aparecen en `.env.example`, usando la
configuración de tu aplicación web de Firebase:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Activa correo/contraseña en Firebase Authentication y despliega las reglas de
`firestore.rules` según la [guía de conexión con Firebase](./docs/09-conexion-firebase.md).
`.env` está excluido por Git; no compartas ni subas ese archivo. Las variables
`EXPO_PUBLIC_*` se incorporan al cliente, por lo que las reglas de Firestore son
necesarias para proteger los datos.

Inicia Metro:

```powershell
npx expo start -c
```

Escanea el QR con Expo Go, usa `w` para abrir web o `a`/`i` para un emulador Android
o simulador iOS configurado. También están disponibles `npm run web`,
`npm run android` y `npm run ios`.

Sin credenciales válidas, la app conserva el modo demo. Los avisos nativos no están
disponibles en web ni en Expo Go para Android; Android requiere un development build.

## Verificación y exportación web

```powershell
npm run verify
npm run test:coverage
npx expo export -p web
```

`npm run verify` ejecuta TypeScript, ESLint y Jest. La última ejecución aprobó 41
pruebas en 11 suites; la cobertura medida fue 89,17 % de sentencias, 79,03 % de ramas,
91,37 % de funciones y 93,03 % de líneas. La cobertura genera archivos locales en
`coverage/`, ignorados por Git. `npx expo export -p web` compiló 1.025 módulos y
exportó a `dist`; el detalle está en [`docs/06-verificacion.md`](./docs/06-verificacion.md).

## Documentación

El índice de los informes está en [`docs/README.md`](./docs/README.md). Incluye
integración, verificación, validación, liberación, la guía de Firebase y el informe
del modelo de calidad de Boehm.

## Estructura principal

```text
app/                    Rutas Expo Router, autenticación y pestañas
components/             Componentes reutilizables de interfaz
context/                Estado de autenticación y despensa
services/               Firebase, notificaciones y abstracciones de plataforma
theme/                  Tipos, colores, validadores, fechas y datos demo
firestore.rules         Reglas de acceso por usuario
```

La app conserva el huevo de Pascua del logo de inicio de sesión: tres toques abren
`AboutModal`.
