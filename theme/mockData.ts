import type { Category, ItemCompra, Producto } from './types';

export const categorias: Category[] = [
  { id: 'lacteos', nombre: 'Lácteos', icono: 'cheese', color: 'yellow' },
  { id: 'granos', nombre: 'Granos', icono: 'rice', color: 'blue' },
  { id: 'enlatados', nombre: 'Enlatados', icono: 'food-variant', color: 'pink' },
  { id: 'bebidas', nombre: 'Bebidas', icono: 'bottle-soda-classic', color: 'lavender' },
  { id: 'limpieza', nombre: 'Limpieza', icono: 'spray-bottle', color: 'blue' },
  { id: 'frutas', nombre: 'Frutas', icono: 'fruit-cherries', color: 'pink' },
  { id: 'verduras', nombre: 'Verduras', icono: 'carrot', color: 'yellow' },
  { id: 'otros', nombre: 'Otros', icono: 'shape-outline', color: 'lavender' },
];

export const productos: Producto[] = [
  { id: '1', nombre: 'Leche', categoria: 'lacteos', cantidad: 1, unidad: 'L', fechaCaducidad: '2026-09-20' },
  { id: '2', nombre: 'Arroz', categoria: 'granos', cantidad: 2, unidad: 'kg', fechaCaducidad: '2027-01-10' },
  { id: '3', nombre: 'Frijoles', categoria: 'granos', cantidad: 1, unidad: 'kg', fechaCaducidad: '2026-06-15' },
  { id: '4', nombre: 'Aceite', categoria: 'otros', cantidad: 900, unidad: 'ml', fechaCaducidad: '2026-12-02' },
  { id: '5', nombre: 'Yogurt', categoria: 'lacteos', cantidad: 4, unidad: 'pzas', fechaCaducidad: '2026-09-12' },
  { id: '6', nombre: 'Atún', categoria: 'enlatados', cantidad: 3, unidad: 'latas', fechaCaducidad: '2027-03-01' },
];

export const listaCompras: ItemCompra[] = [
  { id: '1', nombre: 'Huevos', cantidad: '1 docena', comprado: false },
  { id: '2', nombre: 'Pan', cantidad: '1 pieza', comprado: false },
  { id: '3', nombre: 'Azúcar', cantidad: '1 kg', comprado: true },
  { id: '4', nombre: 'Café', cantidad: '250 g', comprado: false },
];
