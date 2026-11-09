import type { Category, Producto } from '@/theme/types';

export type CategoriaConConteo = Category & { cantidad: number };

export function contarProductosPorCategoria(
  categorias: Category[],
  productos: Producto[],
): CategoriaConConteo[] {
  const conteos = new Map<Category['id'], number>();
  for (const producto of productos) {
    if (producto.categoria) {
      conteos.set(producto.categoria, (conteos.get(producto.categoria) ?? 0) + 1);
    }
  }

  return categorias.map((categoria) => ({
    ...categoria,
    cantidad: conteos.get(categoria.id) ?? 0,
  }));
}
