import { getCategoria } from '@/theme/categoryIcons';
import { categorias } from '@/theme/mockData';

describe('getCategoria (RU-08 / RF-12: clasificación por categorías)', () => {
  it('CP-08.1 - devuelve la categoría correcta cuando el id existe', () => {
    const categoria = getCategoria('lacteos');
    expect(categoria.id).toBe('lacteos');
    expect(categoria.nombre).toBe('Lácteos');
  });

  it('CP-08.2 - devuelve una categoría de respaldo cuando el id no existe en el catálogo', () => {
    // @ts-expect-error - se prueba intencionalmente un id fuera del catálogo
    const categoria = getCategoria('inexistente');
    expect(categoria).toBeDefined();
    expect(categorias).toContainEqual(categoria);
  });
});
