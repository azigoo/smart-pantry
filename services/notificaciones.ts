import Constants from 'expo-constants';
import { Platform } from 'react-native';

const CANAL = 'caducidad';
const HORA_AVISO = 9; // los avisos llegan a las 9:00 am
const MAX_PROGRAMADAS = 60; // iOS permite máximo 64 notificaciones locales

type ProductoAviso = {
  id: string | number;
  nombre: string;
  fechaCaducidad?: string;
};

// En Expo Go (SDK 53+) expo-notifications ya no funciona en Android,
// y ni siquiera se puede importar sin que truene la app.
const esExpoGo = Constants.appOwnership === 'expo';
const disponible = Platform.OS !== 'web' && !(Platform.OS === 'android' && esExpoGo);

let modulo: typeof import('expo-notifications') | null = null;
let handlerListo = false;

function cargar() {
  if (!disponible) return null;
  if (!modulo) {
    try {
      // require() diferido: solo se evalúa cuando el módulo está disponible
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      modulo = require('expo-notifications');
    } catch (e) {
      console.warn('expo-notifications no disponible:', e);
      return null;
    }
  }
  if (modulo && !handlerListo) {
    modulo.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerListo = true;
  }
  return modulo;
}

export function notificacionesDisponibles(): boolean {
  return disponible;
}

async function prepararPermisos(N: typeof import('expo-notifications')): Promise<boolean> {
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CANAL, {
      name: 'Avisos de caducidad',
      importance: N.AndroidImportance.HIGH,
    });
  }
  const actual = await N.getPermissionsAsync();
  if (actual.granted) return true;
  const pedido = await N.requestPermissionsAsync();
  return pedido.granted;
}

/**
 * Cancela los avisos anteriores y programa uno por producto,
 * `diasAntes` días antes de que caduque (a las 9:00 am).
 * Si ese momento ya pasó pero el producto aún no caduca, avisa el día que caduca.
 */
export async function programarAvisos(productos: ProductoAviso[], diasAntes: number) {
  const N = cargar();
  if (!N) return;

  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (productos.length === 0) return;
    if (!(await prepararPermisos(N))) return;

    const ahora = new Date();
    const avisos: { fecha: Date; cuerpo: string }[] = [];

    for (const p of productos) {
      if (!p.fechaCaducidad) continue;
      const cad = new Date(p.fechaCaducidad);
      if (Number.isNaN(cad.getTime())) continue;

      const diaCaduca = new Date(cad.getFullYear(), cad.getMonth(), cad.getDate(), HORA_AVISO);
      const previo = new Date(diaCaduca);
      previo.setDate(previo.getDate() - diasAntes);

      if (previo > ahora) {
        avisos.push({
          fecha: previo,
          cuerpo:
            diasAntes === 1 ? `${p.nombre} caduca mañana` : `${p.nombre} caduca en ${diasAntes} días`,
        });
      } else if (diaCaduca > ahora) {
        avisos.push({ fecha: diaCaduca, cuerpo: `${p.nombre} caduca hoy` });
      }
    }

    avisos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    for (const aviso of avisos.slice(0, MAX_PROGRAMADAS)) {
      await N.scheduleNotificationAsync({
        content: { title: 'Por caducar', body: aviso.cuerpo },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DATE,
          date: aviso.fecha,
          channelId: CANAL,
        },
      });
    }
  } catch (e) {
    console.warn('Error al programar avisos:', e);
  }
}

/** Notificación de prueba que llega a los 5 segundos. */
export async function enviarAvisoDePrueba(): Promise<boolean> {
  const N = cargar();
  if (!N) return false;
  try {
    if (!(await prepararPermisos(N))) return false;
    await N.scheduleNotificationAsync({
      content: { title: 'Por caducar', body: 'Así se verán tus avisos de caducidad' },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: CANAL,
      },
    });
    return true;
  } catch (e) {
    console.warn('Error en el aviso de prueba:', e);
    return false;
  }
}