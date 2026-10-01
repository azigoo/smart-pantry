import { firebaseEstaConfigurado } from '@/services/firebase';
import { suscribirseAEstadoDeAuth } from '@/services/authService';
import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type AuthContextValue = {
  usuario: User | null;
  cargando: boolean;
  /** false si el proyecto todavía no tiene un .env con credenciales de Firebase */
  firebaseListo: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  usuario: null,
  cargando: true,
  firebaseListo: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseListo = firebaseEstaConfigurado();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(firebaseListo);

  useEffect(() => {
    if (!firebaseListo) {
      // Sin credenciales de Firebase la app sigue siendo usable (modo demo con
      // datos de ejemplo); simplemente no hay sesión que restaurar.
      setCargando(false);
      return;
    }

    const cancelarSuscripcion = suscribirseAEstadoDeAuth((user) => {
      setUsuario(user);
      setCargando(false);
    });

    return cancelarSuscripcion;
  }, [firebaseListo]);

  return (
    <AuthContext.Provider value={{ usuario, cargando, firebaseListo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
