import { getFirebaseDb } from '@/services/firebase';
import { categorias } from '@/theme/mockData';
import type { CategoryId, ItemCompra, Producto } from '@/theme/types';
import { collection, deleteDoc, doc, onSnapshot, setDoc, type Firestore } from 'firebase/firestore';

type ConId = { id: string };
type ColeccionDespensa = 'productos' | 'listaCompras';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function normalizarCategoria(valor: unknown): CategoryId | undefined {
  if (typeof valor !== 'string') return undefined;
  return categorias.find((categoria) => categoria.id === valor || categoria.nombre === valor)?.id;
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

const masNuevoPrimero = <T extends ConId>(lista: T[]): T[] =>
  [...lista].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

function observarColeccion<T extends ConId>(
  uid: string,
  nombre: ColeccionDespensa,
  convertir: (id: string, valor: unknown) => T | null,
  alCambiar: (items: T[], cantidadInvalida: boolean) => void,
  alError: (error: Error) => void,
): () => void {
  const db = getFirebaseDb();
  return onSnapshot(
    collection(db, 'usuarios', uid, nombre),
    (snap) => {
      const datos = snap.docs
        .map((documento) => convertir(documento.id, documento.data()))
        .filter((item): item is T => item !== null);
      alCambiar(masNuevoPrimero(datos), datos.length !== snap.size);
    },
    alError,
  );
}

export function observarProductos(
  uid: string,
  alCambiar: (productos: Producto[], cantidadInvalida: boolean) => void,
  alError: (error: Error) => void,
): () => void {
  return observarColeccion(uid, 'productos', productoDesdeFirestore, alCambiar, alError);
}

export function observarListaCompras(
  uid: string,
  alCambiar: (items: ItemCompra[], cantidadInvalida: boolean) => void,
  alError: (error: Error) => void,
): () => void {
  return observarColeccion(uid, 'listaCompras', itemCompraDesdeFirestore, alCambiar, alError);
}

const limpiar = <T>(item: T): T => JSON.parse(JSON.stringify(item));

export function sincronizarColeccion<T extends ConId>(
  uid: string,
  nombre: ColeccionDespensa,
  anteriores: T[],
  siguientes: T[],
  alError: (operacion: 'conexion' | 'guardar' | 'eliminar', error: unknown) => void,
): void {
  let db: Firestore;
  try {
    db = getFirebaseDb();
  } catch (error) {
    alError('conexion', error);
    return;
  }

  const previosPorId = new Map(
    anteriores.map((item) => [String(item.id), JSON.stringify(limpiar(item))]),
  );
  const idsSiguientes = new Set<string>();

  siguientes.forEach((item) => {
    const id = String(item.id);
    idsSiguientes.add(id);
    const datos = limpiar(item);
    if (previosPorId.get(id) === JSON.stringify(datos)) return;

    try {
      void setDoc(doc(db, 'usuarios', uid, nombre, id), { ...datos, id }).catch((error: unknown) =>
        alError('guardar', error),
      );
    } catch (error) {
      alError('guardar', error);
    }
  });

  anteriores.forEach((item) => {
    const id = String(item.id);
    if (idsSiguientes.has(id)) return;

    try {
      void deleteDoc(doc(db, 'usuarios', uid, nombre, id)).catch((error: unknown) =>
        alError('eliminar', error),
      );
    } catch (error) {
      alError('eliminar', error);
    }
  });
}
