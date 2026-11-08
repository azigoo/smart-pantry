export type NuevoProductoInput = {
  nombre: string;
  cantidad: string;
  fecha: string; // formato esperado DD/MM/AAAA
};

export type ResultadoValidacion = {
  valido: boolean;
  errores: string[];
};

const FECHA_DDMMYYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const MAX_CANTIDAD = 99_999;
const MAX_NOMBRE = 80;

function resultado(errores: string[]): ResultadoValidacion {
  return { valido: errores.length === 0, errores };
}

function esNombreValido(nombre: string, etiqueta: string): string[] {
  const limpio = nombre.trim();
  if (!limpio) return [`El ${etiqueta} es obligatorio.`];
  if (limpio.length > MAX_NOMBRE) {
    return [`El ${etiqueta} no puede superar ${MAX_NOMBRE} caracteres.`];
  }
  return [];
}

export function validarCorreo(correo: string): ResultadoValidacion {
  const limpio = correo.trim();
  const errores =
    limpio.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)
      ? []
      : ['Escribe un correo electrónico válido.'];
  return resultado(errores);
}

export function validarContrasena(contrasena: string): ResultadoValidacion {
  const errores: string[] = [];
  if (contrasena.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres.');
  if (contrasena.length > 128) errores.push('La contraseña no puede superar 128 caracteres.');
  return resultado(errores);
}

export function validarInicioSesion(input: {
  correo: string;
  contrasena: string;
}): ResultadoValidacion {
  return resultado([
    ...validarCorreo(input.correo).errores,
    ...validarContrasena(input.contrasena).errores,
  ]);
}

export function validarRegistro(input: {
  nombre: string;
  correo: string;
  contrasena: string;
}): ResultadoValidacion {
  return resultado([
    ...esNombreValido(input.nombre, 'nombre'),
    ...validarCorreo(input.correo).errores,
    ...validarContrasena(input.contrasena).errores,
  ]);
}

export function validarNombrePerfil(nombre: string): ResultadoValidacion {
  return resultado(esNombreValido(nombre, 'nombre'));
}

function esFechaCalendarioValida(fecha: string): Date | null {
  const partes = FECHA_DDMMYYYY.exec(fecha.trim());
  if (!partes) return null;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const anio = Number(partes[3]);
  const fechaLocal = new Date(anio, mes - 1, dia);
  if (
    fechaLocal.getFullYear() !== anio ||
    fechaLocal.getMonth() !== mes - 1 ||
    fechaLocal.getDate() !== dia
  ) {
    return null;
  }
  fechaLocal.setHours(0, 0, 0, 0);
  return fechaLocal;
}

function validarFechaCaducidad(fecha: string): string[] {
  if (!fecha.trim()) return ['La fecha de caducidad es obligatoria.'];
  const fechaValida = esFechaCalendarioValida(fecha);
  if (!fechaValida) {
    return ['La fecha de caducidad debe ser una fecha válida con formato DD/MM/AAAA.'];
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaValida < hoy ? ['La fecha de caducidad no puede ser anterior a hoy.'] : [];
}

function validarCantidadProducto(cantidad: string): string[] {
  const limpia = cantidad.trim();
  const numero = Number(limpia);
  if (
    !/^\d+$/.test(limpia) ||
    !Number.isSafeInteger(numero) ||
    numero < 1 ||
    numero > MAX_CANTIDAD
  ) {
    return [`La cantidad debe ser un número entero entre 1 y ${MAX_CANTIDAD}.`];
  }
  return [];
}

export function validarItemCompra(input: {
  nombre: string;
  cantidad: string;
}): ResultadoValidacion {
  const errores = esNombreValido(input.nombre, 'del producto');
  const cantidad = input.cantidad.trim();
  const partes = /^(\d+(?:[.,]\d+)?)(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)?$/.exec(cantidad);
  const numero = partes ? Number(partes[1].replace(',', '.')) : Number.NaN;
  if (!partes || !Number.isFinite(numero) || numero <= 0 || numero > MAX_CANTIDAD) {
    errores.push(`La cantidad debe ser mayor a 0 y no superar ${MAX_CANTIDAD}.`);
  }
  return resultado(errores);
}

/**
 * Valida los datos del formulario "Agregar producto" según RF-06:
 * el sistema debe permitir registrar un producto indicando como mínimo
 * su nombre, categoría, cantidad y fecha de caducidad.
 */
export function validarNuevoProducto(input: NuevoProductoInput): ResultadoValidacion {
  return resultado([
    ...esNombreValido(input.nombre, 'nombre del producto'),
    ...validarCantidadProducto(input.cantidad),
    ...validarFechaCaducidad(input.fecha),
  ]);
}
