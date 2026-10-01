import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Todas las variables deben llevar el prefijo EXPO_PUBLIC_ para que Expo las
// incluya en el cliente (ver https://docs.expo.dev/guides/environment-variables/).
// Se configuran en un archivo .env en la raíz del proyecto (ver .env.example
// y docs/09-conexion-firebase.md para la guía paso a paso).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function firebaseEstaConfigurado(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Devuelve la instancia de Firebase Auth, inicializándola con persistencia en
 * AsyncStorage para React Native (Android/iOS) y con la persistencia por
 * defecto del navegador en la versión web.
 *
 * Lanza un error explícito si el proyecto todavía no tiene configuradas las
 * variables de entorno de Firebase, en vez de fallar de forma confusa más
 * adelante.
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseEstaConfigurado()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env con tus credenciales ' +
        '(ver .env.example y docs/09-conexion-firebase.md) y reinicia `npx expo start -c`.',
    );
  }

  if (!auth) {
    const firebaseApp = getFirebaseApp();

    if (Platform.OS === 'web') {
      auth = getAuth(firebaseApp);
    } else {
      // require() diferido: @react-native-async-storage/async-storage no debe
      // evaluarse en el bundle web.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getReactNativePersistence } = require('firebase/auth');
      auth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  }

  return auth;
}
