import {
  validarContrasena,
  validarCorreo,
  validarInicioSesion,
  validarItemCompra,
  validarNombrePerfil,
  validarNuevoProducto,
  validarRegistro,
} from '@/theme/validators';

describe('validarNuevoProducto (RF-06 / RU-01: registro de productos)', () => {
  const fechaFutura = '31/12/2099';

  it('CP-01.1 - rechaza un producto sin nombre', () => {
    const resultado = validarNuevoProducto({ nombre: '', cantidad: '1', fecha: fechaFutura });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El nombre del producto es obligatorio.');
  });

  it('CP-01.2 - rechaza una cantidad no numérica', () => {
    const resultado = validarNuevoProducto({
      nombre: 'Leche',
      cantidad: 'abc',
      fecha: fechaFutura,
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser un número entero entre 1 y 99999.');
  });

  it('CP-01.3 - rechaza una cantidad menor o igual a 0', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '0', fecha: fechaFutura });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser un número entero entre 1 y 99999.');
  });

  it('CP-01.4 - rechaza una fecha vacía', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La fecha de caducidad es obligatoria.');
  });

  it('CP-01.5 - rechaza una fecha con formato inválido', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '2026-09-20' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain(
      'La fecha de caducidad debe ser una fecha válida con formato DD/MM/AAAA.',
    );
  });

  it('CP-01.6 - acepta un producto válido con todos los campos correctos', () => {
    const resultado = validarNuevoProducto({ nombre: 'Leche', cantidad: '2', fecha: fechaFutura });
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  it('CP-01.7 - acumula todos los errores cuando varios campos son inválidos', () => {
    const resultado = validarNuevoProducto({ nombre: '', cantidad: '-1', fecha: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveLength(3);
  });

  it('rechaza fechas inexistentes y fechas anteriores a hoy', () => {
    expect(
      validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '31/02/2099' }).valido,
    ).toBe(false);
    expect(
      validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: '01/01/2000' }).errores,
    ).toContain('La fecha de caducidad no puede ser anterior a hoy.');
  });

  it('acepta los límites de cantidad y rechaza el exceso', () => {
    expect(
      validarNuevoProducto({ nombre: 'Leche', cantidad: '1', fecha: fechaFutura }).valido,
    ).toBe(true);
    expect(
      validarNuevoProducto({ nombre: 'Leche', cantidad: '99999', fecha: fechaFutura }).valido,
    ).toBe(true);
    expect(
      validarNuevoProducto({ nombre: 'Leche', cantidad: '100000', fecha: fechaFutura }).valido,
    ).toBe(false);
  });

  it('rechaza cantidades negativas, fraccionarias y en blanco', () => {
    for (const cantidad of ['-1', '1.5', '']) {
      expect(validarNuevoProducto({ nombre: 'Leche', cantidad, fecha: fechaFutura }).valido).toBe(
        false,
      );
    }
  });

  it('acepta la fecha de hoy y rechaza el día anterior', () => {
    const hoy = new Date();
    const fechaFormatoLocal = (fecha: Date) =>
      `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
    const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const ayer = new Date(hoyLocal);
    ayer.setDate(ayer.getDate() - 1);

    expect(
      validarNuevoProducto({
        nombre: 'Leche',
        cantidad: '1',
        fecha: fechaFormatoLocal(hoyLocal),
      }).valido,
    ).toBe(true);
    expect(
      validarNuevoProducto({
        nombre: 'Leche',
        cantidad: '1',
        fecha: fechaFormatoLocal(ayer),
      }).valido,
    ).toBe(false);
  });

  it('rechaza nombres que superan el límite de longitud', () => {
    expect(validarNombrePerfil('a'.repeat(80)).valido).toBe(true);
    expect(validarNombrePerfil('a'.repeat(81)).valido).toBe(false);
  });
});

describe('validación de los demás formularios', () => {
  it('valida correo, contraseña y registro', () => {
    expect(validarCorreo('persona@ejemplo.com').valido).toBe(true);
    expect(validarCorreo('persona@').valido).toBe(false);
    expect(validarContrasena('12345').valido).toBe(false);
    expect(validarContrasena('123456').valido).toBe(true);
    expect(
      validarInicioSesion({ correo: 'persona@ejemplo.com', contrasena: '123456' }).valido,
    ).toBe(true);
    expect(
      validarRegistro({ nombre: 'Ana', correo: 'persona@ejemplo.com', contrasena: '123456' })
        .valido,
    ).toBe(true);
  });

  it('valida el nombre de perfil y cantidades de lista compatibles con unidades', () => {
    expect(validarNombrePerfil('  Ana  ').valido).toBe(true);
    expect(validarNombrePerfil(' ').valido).toBe(false);
    expect(validarItemCompra({ nombre: 'Huevos', cantidad: '1 docena' }).valido).toBe(true);
    expect(validarItemCompra({ nombre: 'Huevos', cantidad: '0' }).valido).toBe(false);
    expect(validarItemCompra({ nombre: 'Huevos', cantidad: '-2' }).valido).toBe(false);
    expect(validarItemCompra({ nombre: 'Huevos', cantidad: '100000' }).valido).toBe(false);
  });
});
