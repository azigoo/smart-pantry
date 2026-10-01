import {
  categorias as categoriasMock,
  listaCompras as listaMock,
  productos as productosMock,
} from '@/theme/mockData';
import type { ItemCompra } from '@/theme/types';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type Producto = (typeof productosMock)[number];
type Categoria = (typeof categoriasMock)[number];

export type CategoriaConConteo = Categoria & { cantidad: number };

type DespensaContextValue = {
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  listaCompras: ItemCompra[];
  setListaCompras: React.Dispatch<React.SetStateAction<ItemCompra[]>>;
  categorias: CategoriaConConteo[];
};

const DespensaContext = createContext<DespensaContextValue | null>(null);

// Ajusta esto si tu producto guarda la categoría con otro nombre de campo
const categoriaDe = (p: Producto) => (p as any).categoria;

export function DespensaProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>(() => productosMock as Producto[]);
  const [listaCompras, setListaCompras] = useState<ItemCompra[]>(() => listaMock);

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
    () => ({ productos, setProductos, listaCompras, setListaCompras, categorias }),
    [productos, listaCompras, categorias]
  );

  return <DespensaContext.Provider value={value}>{children}</DespensaContext.Provider>;
}

export function useDespensa() {
  const ctx = useContext(DespensaContext);
  if (!ctx) throw new Error('useDespensa debe usarse dentro de <DespensaProvider>');
  return ctx;
}