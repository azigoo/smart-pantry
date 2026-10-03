import { useAuth } from '@/context/AuthContext';
import { firebaseEstaConfigurado, getFirebaseDb } from '@/services/firebase';
import {
  categorias as categoriasMock,
  listaCompras as listaMock,
  productos as productosMock,
} from '@/theme/mockData';
import type { ItemCompra } from '@/theme/types';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
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

export type Producto = (typeof productosMock)[number];
type Categoria = (typeof categoriasMock)[number];

export type CategoriaConConteo = Categoria & { cantidad: number };

type DespensaContextValue = {
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  listaCompras: ItemCompra[];
  setListaCompras: React.Dispatch<React.SetStateAction<ItemCompra[]>>;
  categorias: CategoriaConConteo[];
  nombreUsuario: string | null;
  setNombreUsuario: React.Dispatch<React.SetStateAction<string | null>>;
};

const DespensaContext = createContext<DespensaContextValue | null>(null);

// Ajusta esto si tu producto guarda la categoría con otro nombre de campo
const categoriaDe = (p: Producto) => (p as any).categoria;

// Firestore no acepta valores `undefined`, así que se eliminan antes de guardar
const limpiar = <T,>(item: T): T => JSON.parse(JSON.stringify(item));

type ConId = { id: string | number };

// Ordena de más nuevo a más viejo (los ids nuevos son Date.now())
const masNuevoPrimero = <T extends ConId>(lista: T[]): T[] =>
  [...lista].sort((a, b) =>
    String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
  );

export function DespensaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const uid: string | undefined = usuario?.uid;
  const usaFirestore = firebaseEstaConfigurado();

  // Con Firestore se empieza vacío; sin Firebase (modo demo) se usan los datos de ejemplo
  const [productos, setProductosState] = useState<Producto[]>(() =>
    usaFirestore ? [] : (productosMock as Producto[])
  );
  const [listaCompras, setListaComprasState] = useState<ItemCompra[]>(() =>
    usaFirestore ? [] : listaMock
  );
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

  const productosRef = useRef(productos);
  const listaRef = useRef(listaCompras);

  // Escucha en tiempo real los datos del usuario
  useEffect(() => {
    if (!usaFirestore) return;

    if (!uid) {
      productosRef.current = [];
      listaRef.current = [];
      setProductosState([]);
      setListaComprasState([]);
      return;
    }

    const db = getFirebaseDb();

    const unsubProductos = onSnapshot(
      collection(db, 'usuarios', uid, 'productos'),
      (snap) => {
        const datos = masNuevoPrimero(
          snap.docs.map((d) => ({ ...d.data(), id: d.id }) as unknown as Producto)
        );
        productosRef.current = datos;
        setProductosState(datos);
      },
      (error) => console.warn('Error al leer productos:', error)
    );

    const unsubLista = onSnapshot(
      collection(db, 'usuarios', uid, 'listaCompras'),
      (snap) => {
        const datos = masNuevoPrimero(
          snap.docs.map((d) => ({ ...d.data(), id: d.id }) as unknown as ItemCompra)
        );
        listaRef.current = datos;
        setListaComprasState(datos);
      },
      (error) => console.warn('Error al leer la lista de compras:', error)
    );

    return () => {
      unsubProductos();
      unsubLista();
    };
  }, [uid, usaFirestore]);

  // Compara la lista anterior con la nueva y guarda solo lo que cambió
  const sincronizar = useCallback(
    <T extends ConId>(coleccion: string, prev: T[], next: T[]) => {
      if (!usaFirestore || !uid) return;
      const db = getFirebaseDb();

      const anteriores = new Map(prev.map((i) => [String(i.id), JSON.stringify(limpiar(i))]));
      const idsNuevos = new Set<string>();

      next.forEach((item) => {
        const id = String(item.id);
        idsNuevos.add(id);
        const datos = limpiar(item);
        if (anteriores.get(id) !== JSON.stringify(datos)) {
          setDoc(doc(db, 'usuarios', uid, coleccion, id), { ...datos, id }).catch((e) =>
            console.warn('Error al guardar:', e)
          );
        }
      });

      prev.forEach((item) => {
        const id = String(item.id);
        if (!idsNuevos.has(id)) {
          deleteDoc(doc(db, 'usuarios', uid, coleccion, id)).catch((e) =>
            console.warn('Error al eliminar:', e)
          );
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
      sincronizar('productos', prev as unknown as ConId[], next as unknown as ConId[]);
    },
    [sincronizar]
  );

  const setListaCompras = useCallback<React.Dispatch<React.SetStateAction<ItemCompra[]>>>(
    (accion) => {
      const prev = listaRef.current;
      const next = typeof accion === 'function' ? accion(prev) : accion;
      listaRef.current = next;
      setListaComprasState(next);
      sincronizar('listaCompras', prev as unknown as ConId[], next as unknown as ConId[]);
    },
    [sincronizar]
  );

  // El conteo de cada categoría se calcula a partir de los productos actuales
  const categorias = useMemo<CategoriaConConteo[]>(
    () =>
      categoriasMock.map((c) => ({
        ...c,
        cantidad: productos.filter(
          (p) => categoriaDe(p) === (c as any).id || categoriaDe(p) === (c as any).nombre
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
    }),
    [productos, setProductos, listaCompras, setListaCompras, categorias, nombreUsuario]
  );

  return <DespensaContext.Provider value={value}>{children}</DespensaContext.Provider>;
}

export function useDespensa() {
  const ctx = useContext(DespensaContext);
  if (!ctx) throw new Error('useDespensa debe usarse dentro de <DespensaProvider>');
  return ctx;
}