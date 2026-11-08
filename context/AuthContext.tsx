import { firebaseEstaConfigurado } from '@/services/firebase';
import { suscribirseAEstadoDeAuth } from '@/services/authService';
import { logger } from '@/services/logger';
import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type AuthContextValue = {
  usuario: User | null;
  cargando: boolean;
  /** false si el proyecto todavía no tiene un .env con credenciales de Firebase */
  firebaseListo: boolean;
  errorAutenticacion: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  usuario: null,
  cargando: true,
  firebaseListo: false,
  errorAutenticacion: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseListo = firebaseEstaConfigurado();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(firebaseListo);
  const [errorAutenticacion, setErrorAutenticacion] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseListo) {
      // Sin credenciales de Firebase la app sigue siendo usable (modo demo con
      // datos de ejemplo); simplemente no hay sesión que restaurar.
      setCargando(false);
      setErrorAutenticacion(null);
      return;
    }

    try {
      return suscribirseAEstadoDeAuth(
        (user) => {
          setUsuario(user);
          setErrorAutenticacion(null);
          setCargando(false);
        },
        (error) => {
          logger.error('Restauración de sesión', error);
          setErrorAutenticacion(
            'No se pudo verificar tu sesión. Revisa tu conexión e intenta de nuevo.',
          );
          setCargando(false);
        },
      );
    } catch (error) {
      logger.error('Restauración de sesión', error);
      setErrorAutenticacion('No se pudo verificar tu sesión. Revisa la configuración de Firebase.');
      setCargando(false);
    }
  }, [firebaseListo]);

  return (
    <AuthContext.Provider value={{ usuario, cargando, firebaseListo, errorAutenticacion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
