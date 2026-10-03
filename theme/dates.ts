const MS_POR_DIA = 1000 * 60 * 60 * 24;

const dos = (n: number) => String(n).padStart(2, '0');

// Acepta "2026-10-10" o un ISO completo ("2026-10-10T20:33:00.000Z")
// y devuelve la fecha a medianoche en la zona horaria local.
function aFechaLocal(fecha: string): Date {
  if (fecha.length > 10) {
    const d = new Date(fecha);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function diasParaCaducar(fechaISO: string): number {
  const hoy = new Date();
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fecha = aFechaLocal(fechaISO);
  return Math.round((fecha.getTime() - hoyLocal.getTime()) / MS_POR_DIA);
}

export function formatearFecha(fechaISO: string): string {
  const f = aFechaLocal(fechaISO);
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()}`;
}