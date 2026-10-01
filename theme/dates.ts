export function diasParaCaducar(fechaISO: string): number {
  const hoy = new Date();
  const fecha = new Date(fechaISO);
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.ceil((fecha.getTime() - hoy.getTime()) / msPorDia);
}

export function formatearFecha(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}
