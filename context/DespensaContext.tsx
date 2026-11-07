import { useAuth } from '@/context/AuthContext';
import { firebaseEstaConfigurado, getFirebaseDb } from '@/services/firebase';
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
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
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
};

const DespensaContext = createContext<DespensaContextValue | null>(null);

const CLAVE_DIAS_AVISO = 'diasAviso';

// Firestore no acepta valores `undefined`, así que se eliminan antes de guardar
const limpiar = <T,>(item: T): T => JSON.parse(JSON.stringify(item));

type ConId = { id: string };

// Ordena de más nuevo a más viejo (los ids nuevos son Date.now())
const masNuevoPrimero = <T extends ConId>(lista: T[]): T[] =>
  [...lista].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function normalizarCategoria(valor: unknown): CategoryId | undefined {
  if (typeof valor !== 'string') return undefined;
  return categoriasMock.find((categoria) => categoria.id === valor || categoria.nombre === valor)?.id;
}

function productoDesdeFirestore(id: string, valor: unknown): Producto | null {
  if (!esObjeto(valor)) return null;
  if (
    typeof valor.nombre !== 'string' ||
    typeof valor.cantidad !== 'number' ||
    !Number.isFinite(valor.cantidad) ||
    valor.cantidad < 1 ||
    typeof valor.fechaCaducidad !== 'string'
  ) {
    return null;
  }
  return {
    id,
    nombre: valor.nombre,
    cantidad: valor.cantidad,
    unidad: typeof valor.unidad === 'string' ? valor.unidad : 'pzas',
    fechaCaducidad: valor.fechaCaducidad,
    categoria: normalizarCategoria(valor.categoria),
  };
}

function itemCompraDesdeFirestore(id: string, valor: unknown): ItemCompra | null {
  if (!esObjeto(valor)) return null;
  if (
    typeof valor.nombre !== 'string' ||
    (typeof valor.cantidad !== 'string' && typeof valor.cantidad !== 'number') ||
    typeof valor.comprado !== 'boolean'
  ) {
    return null;
  }
  return {
    id,
    nombre: valor.nombre,
    cantidad: String(valor.cantidad),
    comprado: valor.comprado,
    unidad: typeof valor.unidad === 'string' ? valor.unidad : undefined,
    categoria: normalizarCategoria(valor.categoria),
  };
}

export function DespensaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const uid: string | undefined = usuario?.uid;
  const usaFirestore = firebaseEstaConfigurado();

  // Con Firestore se empieza vacío; sin Firebase (modo demo) se usan los datos de ejemplo
  const [productos, setProductosState] = useState<Producto[]>(() =>
    usaFirestore ? [] : productosMock
  );
  const [listaCompras, setListaComprasState] = useState<ItemCompra[]>(() =>
    usaFirestore ? [] : listaMock
  );
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [diasAviso, setDiasAvisoState] = useState<DiasAviso>(3);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);

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
      return;
    }

    let cancelarProductos: (() => void) | undefined;
    let cancelarLista: (() => void) | undefined;

    try {
      const db = getFirebaseDb();
      cancelarProductos = onSnapshot(
        collection(db, 'usuarios', uid, 'productos'),
        (snap) => {
          const datos = snap.docs
            .map((documento) => productoDesdeFirestore(documento.id, documento.data()))
            .filter((producto): producto is Producto => producto !== null);
          if (datos.length !== snap.size) {
            logger.warn('Firestore', 'Se omitieron documentos de producto con datos incompletos.');
            setErrorDatos('Algunos productos no se pudieron mostrar porque sus datos están incompletos.');
          }
          const ordenados = masNuevoPrimero(datos);
          productosRef.current = ordenados;
          setProductosState(ordenados);
        },
        (error: Error) => {
          logger.error('Lectura de productos', error);
          setErrorDatos('No se pudieron cargar tus productos. Revisa tu conexión y las reglas de Firestore.');
        },
      );

      cancelarLista = onSnapshot(
        collection(db, 'usuarios', uid, 'listaCompras'),
        (snap) => {
          const datos = snap.docs
            .map((documento) => itemCompraDesdeFirestore(documento.id, documento.data()))
            .filter((item): item is ItemCompra => item !== null);
          if (datos.length !== snap.size) {
            logger.warn('Firestore', 'Se omitieron documentos de compra con datos incompletos.');
            setErrorDatos('Algunos artículos no se pudieron mostrar porque sus datos están incompletos.');
          }
          const ordenados = masNuevoPrimero(datos);
          listaRef.current = ordenados;
          setListaComprasState(ordenados);
        },
        (error: Error) => {
          logger.error('Lectura de compras', error);
          setErrorDatos('No se pudo cargar tu lista de compras. Revisa tu conexión y las reglas de Firestore.');
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
      setErrorDatos('No se pudieron abrir tus datos. Revisa la configuración y las reglas de Firestore.');
    }
  }, [uid, usaFirestore]);

  // Reprograma los avisos de caducidad cuando cambian los productos o el tiempo de aviso
  useEffect(() => {
    programarAvisos(productos, diasAviso);
  }, [productos, diasAviso]);

  // Compara la lista anterior con la nueva y guarda solo lo que cambió
  const sincronizar = useCallback(
    <T extends ConId>(coleccion: string, prev: T[], next: T[]) => {
      if (!usaFirestore || !uid) return;
      let db: Firestore;
      try {
        db = getFirebaseDb();
      } catch (error) {
        logger.error('Conexión con Firestore', error);
        setErrorDatos('No se pudo conectar con Firestore. Revisa la configuración del proyecto.');
        return;
      }

      const anteriores = new Map(prev.map((i) => [String(i.id), JSON.stringify(limpiar(i))]));
      const idsNuevos = new Set<string>();
      const informarErrorEscritura = (error: unknown) => {
        logger.error('Escritura en Firestore', error);
        setErrorDatos('No se pudo guardar un cambio. Revisa tu conexión y las reglas de Firestore.');
      };
      const informarErrorEliminacion = (error: unknown) => {
        logger.error('Eliminación en Firestore', error);
        setErrorDatos('No se pudo eliminar un dato. Revisa tu conexión y las reglas de Firestore.');
      };

      next.forEach((item) => {
        const id = String(item.id);
        idsNuevos.add(id);
        const datos = limpiar(item);
        if (anteriores.get(id) !== JSON.stringify(datos)) {
          try {
            void setDoc(doc(db, 'usuarios', uid, coleccion, id), { ...datos, id }).catch(
              informarErrorEscritura,
            );
          } catch (error) {
            informarErrorEscritura(error);
          }
        }
      });

      prev.forEach((item) => {
        const id = String(item.id);
        if (!idsNuevos.has(id)) {
          try {
            void deleteDoc(doc(db, 'usuarios', uid, coleccion, id)).catch(informarErrorEliminacion);
          } catch (error) {
            informarErrorEliminacion(error);
          }
        }
      });
    },
    [uid, usaFirestore]
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
    [sincronizar]
  );

  const setListaCompras = useCallback<React.Dispatch<React.SetStateAction<ItemCompra[]>>>(
    (accion) => {
      const prev = listaRef.current;
      const next = typeof accion === 'function' ? accion(prev) : accion;
      listaRef.current = next;
      setListaComprasState(next);
      sincronizar('listaCompras', prev, next);
    },
    [sincronizar]
  );

  // El conteo de cada categoría se calcula a partir de los productos actuales
  const categorias = useMemo<CategoriaConConteo[]>(
    () =>
      categoriasMock.map((c) => ({
        ...c,
        cantidad: productos.filter(
          (p) => p.categoria === c.id
        ).length,
      })),
    [productos]
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
    ]
  );

  return <DespensaContext.Provider value={value}>{children}</DespensaContext.Provider>;
}

export function useDespensa() {
  const ctx = useContext(DespensaContext);
  if (!ctx) throw new Error('useDespensa debe usarse dentro de <DespensaProvider>');
  return ctx;
}