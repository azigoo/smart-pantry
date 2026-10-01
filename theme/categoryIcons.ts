import type { CategoryId } from './types';
import { categorias } from './mockData';

export function getCategoria(id: CategoryId) {
  return categorias.find((c) => c.id === id) ?? categorias[categorias.length - 1];
}
