import { useAuth } from '@/context/AuthContext';
import {
  observarListaCompras,
  observarProductos,
  sincronizarColeccion,
} from '@/services/despensaFirestore';
import { firebaseEstaConfigurado } from '@/services/firebase';
import { programarAvisos } from '@/services/notificaciones';
import {
  categorias as categoriasMock,
  listaCompras as listaMock,
  productos as productosMock,
} from '@/theme/mockData';
import type { Category, CategoryId, ItemCompra, Producto as ProductoModelo } from '@/theme/types';
import { logger } from '@/services/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Producto = ProductoModelo;
type Categoria = Category;

export type CategoriaConConteo = Categoria & { cantidad: number };
export type DiasAviso = 1 | 3 | 7;

type DespensaContextValue = {
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  listaCompras: ItemCompra[];
  setListaCompras: React.Dispatch<React.SetStateAction<ItemCompra[]>>;
  categorias: CategoriaConConteo[];
  nombreUsuario: string | null;
  setNombreUsuario: React.Dispatch<React.SetStateAction<string | null>>;
  diasAviso: DiasAviso;
  setDiasAviso: (dias: DiasAviso) => void;
  errorDatos: string | null;
  cargandoDatos: boolean;
};

const DespensaContext = createContext<DespensaContextValue | null>(null);

const CLAVE_DIAS_AVISO = 'diasAviso';

// Firestore no acepta valores `undefined`, así que se eliminan antes de guardar
export function DespensaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const uid: string | undefined = usuario?.uid;
  const usaFirestore = firebaseEstaConfigurado();

  // Con Firestore se empieza vacío; sin Firebase (modo demo) se usan los datos de ejemplo
  const [productos, setProductosState] = useState<Producto[]>(() =>
    usaFirestore ? [] : productosMock,
  );
  const [listaCompras, setListaComprasState] = useState<ItemCompra[]>(() =>
    usaFirestore ? [] : listaMock,
  );
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [diasAviso, setDiasAvisoState] = useState<DiasAviso>(3);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(usaFirestore);
  const [coleccionesCargadas, setColeccionesCargadas] = useState({
    productos: !usaFirestore,
    listaCompras: !usaFirestore,
  });

  const productosRef = useRef(productos);
  const listaRef = useRef(listaCompras);

  // Recupera el tiempo de aviso guardado en este dispositivo
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_DIAS_AVISO)
      .then((valor) => {
        const n = Number(valor);
        if (n === 1 || n === 3 || n === 7) setDiasAvisoState(n);
      })
      .catch((error: unknown) => {
        logger.error('Preferencias locales', error);
        setErrorDatos('No se pudo leer la preferencia de avisos guardada en este dispositivo.');
      });
  }, []);

  const setDiasAviso = useCallback((dias: DiasAviso) => {
    setDiasAvisoState(dias);
    AsyncStorage.setItem(CLAVE_DIAS_AVISO, String(dias)).catch((error: unknown) => {
      logger.error('Preferencias locales', error);
      setErrorDatos('No se pudo guardar la preferencia de avisos en este dispositivo.');
    });
  }, []);

  // Escucha en tiempo real los datos del usuario
  useEffect(() => {
    if (!usaFirestore) return;
    setErrorDatos(null);

    if (!uid) {
      productosRef.current = [];
      listaRef.current = [];
      setProductosState([]);
      setListaComprasState([]);
      setErrorDatos(null);
      setCargandoDatos(false);
      setColeccionesCargadas({ productos: true, listaCompras: true });
      return;
    }

    setCargandoDatos(true);
    setColeccionesCargadas({ productos: false, listaCompras: false });
    const marcarColeccionCargada = (coleccion: 'productos' | 'listaCompras') => {
      setColeccionesCargadas((cargadas) => {
        const actualizadas = { ...cargadas, [coleccion]: true };
        if (actualizadas.productos && actualizadas.listaCompras) setCargandoDatos(false);
        return actualizadas;
      });
    };

    let cancelarProductos: (() => void) | undefined;
    let cancelarLista: (() => void) | undefined;
    try {
      cancelarProductos = observarProductos(
        uid,
        (ordenados, cantidadInvalida) => {
          if (cantidadInvalida) {
            logger.warn('Firestore', 'Se omitieron documentos de producto con datos incompletos.');
            setErrorDatos(
              'Algunos productos no se pudieron mostrar porque sus datos están incompletos.',
            );
          }
          productosRef.current = ordenados;
          setProductosState(ordenados);
          marcarColeccionCargada('productos');
        },
        (error) => {
          logger.error('Lectura de productos', error);
          setErrorDatos(
            'No se pudieron cargar tus productos. Revisa tu conexión y las reglas de Firestore.',
          );
          marcarColeccionCargada('productos');
        },
      );

      cancelarLista = observarListaCompras(
        uid,
        (ordenados, cantidadInvalida) => {
          if (cantidadInvalida) {
            logger.warn('Firestore', 'Se omitieron documentos de compra con datos incompletos.');
            setErrorDatos(
              'Algunos artículos no se pudieron mostrar porque sus datos están incompletos.',
            );
          }
          listaRef.current = ordenados;
          setListaComprasState(ordenados);
          marcarColeccionCargada('listaCompras');
        },
        (error) => {
          logger.error('Lectura de compras', error);
          setErrorDatos(
            'No se pudo cargar tu lista de compras. Revisa tu conexión y las reglas de Firestore.',
          );
          marcarColeccionCargada('listaCompras');
        },
      );

      return () => {
        cancelarProductos?.();
        cancelarLista?.();
      };
    } catch (error) {
      cancelarProductos?.();
      cancelarLista?.();
      logger.error('Conexión con Firestore', error);
      setErrorDatos(
        'No se pudieron abrir tus datos. Revisa la configuración y las reglas de Firestore.',
      );
      setCargandoDatos(false);
    }
  }, [uid, usaFirestore]);

  // Reprograma los avisos de caducidad cuando cambian los productos o el tiempo de aviso
  useEffect(() => {
    programarAvisos(productos, diasAviso);
  }, [productos, diasAviso]);

  // Compara la lista anterior con la nueva y guarda solo lo que cambió
  const sincronizar = useCallback(
    <T extends { id: string }>(coleccion: 'productos' | 'listaCompras', prev: T[], next: T[]) => {
      if (!usaFirestore || !uid) return;
      sincronizarColeccion(uid, coleccion, prev, next, (operacion, error) => {
        logger.error(
          operacion === 'conexion'
            ? 'Conexión con Firestore'
            : operacion === 'guardar'
              ? 'Escritura en Firestore'
              : 'Eliminación en Firestore',
          error,
        );
        setErrorDatos(
          operacion === 'conexion'
            ? 'No se pudo conectar con Firestore. Revisa la configuración del proyecto.'
            : operacion === 'guardar'
              ? 'No se pudo guardar un cambio. Revisa tu conexión y las reglas de Firestore.'
              : 'No se pudo eliminar un dato. Revisa tu conexión y las reglas de Firestore.',
        );
      });
    },
    [uid, usaFirestore],
  );

  // Mismas firmas que un setState normal, para que las pantallas no cambien
  const setProductos = useCallback<React.Dispatch<React.SetStateAction<Producto[]>>>(
    (accion) => {
      const prev = productosRef.current;
      const next = typeof accion === 'function' ? accion(prev) : accion;
      productosRef.current = next;
      setProductosState(next);
      sincronizar('productos', prev, next);
    },
    [sincronizar],
  );

  const setListaCompras = useCallback<React.Dispatch<React.SetStateAction<ItemCompra[]>>>(
    (accion) => {
      const prev = listaRef.current;
      const next = typeof accion === 'function' ? accion(prev) : accion;
      listaRef.current = next;
      setListaComprasState(next);
      sincronizar('listaCompras', prev, next);
    },
    [sincronizar],
  );

  // El conteo de cada categoría se calcula a partir de los productos actuales
  const categorias = useMemo<CategoriaConConteo[]>(
    () =>
      categoriasMock.map((c) => ({
        ...c,
        cantidad: productos.filter((p) => p.categoria === c.id).length,
      })),
    [productos],
  );

  const value = useMemo(
    () => ({
      productos,
      setProductos,
      listaCompras,
      setListaCompras,
      categorias,
      nombreUsuario,
      setNombreUsuario,
      diasAviso,
      setDiasAviso,
      errorDatos,
      cargandoDatos,
    }),
    [
      productos,
      setProductos,
      listaCompras,
      setListaCompras,
      categorias,
      nombreUsuario,
      diasAviso,
      setDiasAviso,
      errorDatos,
      cargandoDatos,
    ],
  );

  return <DespensaContext.Provider value={value}>{children}</DespensaContext.Provider>;
}

export function useDespensa() {
  const ctx = useContext(DespensaContext);
  if (!ctx) throw new Error('useDespensa debe usarse dentro de <DespensaProvider>');
  return ctx;
}
