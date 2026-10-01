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

/**
 * Valida los datos del formulario "Agregar producto" según RF-06:
 * el sistema debe permitir registrar un producto indicando como mínimo
 * su nombre, categoría, cantidad y fecha de caducidad.
 */
export function validarNuevoProducto(input: NuevoProductoInput): ResultadoValidacion {
  const errores: string[] = [];

  if (!input.nombre.trim()) {
    errores.push('El nombre del producto es obligatorio.');
  }

  const cantidadNumero = Number(input.cantidad);
  if (!input.cantidad.trim() || Number.isNaN(cantidadNumero) || cantidadNumero <= 0) {
    errores.push('La cantidad debe ser un número mayor a 0.');
  }

  if (!input.fecha.trim()) {
    errores.push('La fecha de caducidad es obligatoria.');
  } else if (!FECHA_DDMMYYYY.test(input.fecha.trim())) {
    errores.push('La fecha de caducidad debe tener el formato DD/MM/AAAA.');
  }

  return { valido: errores.length === 0, errores };
}
