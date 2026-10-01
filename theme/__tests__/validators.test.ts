import { validarNuevoProducto } from '@/theme/validators';

describe('validarNuevoProducto (RF-06 / RU-01: registro de productos)', () => {
  it('CP-01.1 - rechaza un producto sin nombre', () => {
    const resultado = validarNuevoProducto({ nombre: '', cantidad: '1', fecha: '20/09/2026' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El nombre del producto es obligatorio.');
  });

  it('CP-01.2 - rechaza una cantidad no numérica', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: 'abc', fecha: '20/09/2026' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser un número mayor a 0.');
  });

  it('CP-01.3 - rechaza una cantidad menor o igual a 0', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '0', fecha: '20/09/2026' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser un número mayor a 0.');
  });

  it('CP-01.4 - rechaza una fecha vacía', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La fecha de caducidad es obligatoria.');
  });

  it('CP-01.5 - rechaza una fecha con formato inválido', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '2026-09-20' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La fecha de caducidad debe tener el formato DD/MM/AAAA.');
  });

  it('CP-01.6 - acepta un producto válido con todos los campos correctos', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '2', fecha: '20/09/2026' });
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  it('CP-01.7 - acumula todos los errores cuando varios campos son inválidos', () => {
    const resultado = validarNuevoProducto({ nombre: '', cantidad: '-1', fecha: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveLength(3);
  });
});
