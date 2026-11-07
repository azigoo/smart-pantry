import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { logger } from './logger';

export type ErrorAutenticacion = {
  codigo: string;
  mensaje: string;
};

// Firebase Auth nunca guarda la contraseña en texto plano: la envía por HTTPS y el
// servidor de Google la almacena con hash (scrypt). Esto satisface RNF-04
// (Seguridad: protección de contraseñas y comunicación cifrada, ver punto 1.6 / 3.6).
const MENSAJES_DE_ERROR: Record<string, string> = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta registrada con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/network-request-failed': 'No hay conexión a internet. Intenta de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Espera un momento e intenta de nuevo.',
  'auth/missing-password': 'Escribe una contraseña.',
};

function traducirError(error: unknown): ErrorAutenticacion {
  const codigo =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : 'auth/desconocido';
  logger.error('Autenticación', error);
  return {
    codigo,
    mensaje: MENSAJES_DE_ERROR[codigo] ?? 'Ocurrió un error inesperado. Intenta de nuevo.',
  };
}

export function esErrorAutenticacion(error: unknown): error is ErrorAutenticacion {
  return (
    typeof error === 'object' &&
    error !== null &&
    'mensaje' in error &&
    typeof error.mensaje === 'string'
  );
}

export async function iniciarSesion(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  } catch (error) {
    throw traducirError(error);
  }
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string,
): Promise<UserCredential> {
  try {
    const credenciales = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password,
    );
    if (nombre.trim()) {
      await updateProfile(credenciales.user, { displayName: nombre.trim() });
    }
    return credenciales;
  } catch (error) {
    throw traducirError(error);
  }
}

export async function cerrarSesion(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch (error) {
    throw traducirError(error);
  }
}
export async function recuperarContrasena(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (error) {
    throw traducirError(error);
  }
}

export function suscribirseAEstadoDeAuth(
  callback: (user: User | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback, onError);
}
