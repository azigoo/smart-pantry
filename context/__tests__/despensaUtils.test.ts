import { contarProductosPorCategoria } from '@/context/despensaUtils';
import type { Category, Producto } from '@/theme/types';

const categorias: Category[] = [
  { id: 'lacteos', nombre: 'Lácteos', icono: 'cheese', color: 'yellow' },
  { id: 'granos', nombre: 'Granos', icono: 'rice', color: 'blue' },
  { id: 'otros', nombre: 'Otros', icono: 'shape-outline', color: 'lavender' },
];

const productos: Producto[] = [
  {
    id: '1',
    nombre: 'Leche',
    categoria: 'lacteos',
    cantidad: 1,
    unidad: 'L',
    fechaCaducidad: '2026-09-20',
  },
  {
    id: '2',
    nombre: 'Yogur',
    categoria: 'lacteos',
    cantidad: 1,
    unidad: 'pza',
    fechaCaducidad: '2026-09-20',
  },
  {
    id: '3',
    nombre: 'Arroz',
    categoria: 'granos',
    cantidad: 1,
    unidad: 'kg',
    fechaCaducidad: '2026-09-20',
  },
  { id: '4', nombre: 'Sin categoría', cantidad: 1, unidad: 'pza', fechaCaducidad: '2026-09-20' },
];

describe('contarProductosPorCategoria', () => {
  it('cuenta categorías con y sin productos e ignora productos sin categoría', () => {
    expect(
      contarProductosPorCategoria(categorias, productos).map(({ id, cantidad }) => [id, cantidad]),
    ).toEqual([
      ['lacteos', 2],
      ['granos', 1],
      ['otros', 0],
    ]);
  });

  it('no modifica las categorías recibidas', () => {
    const originales = structuredClone(categorias);
    contarProductosPorCategoria(categorias, productos);
    expect(categorias).toEqual(originales);
  });
});
