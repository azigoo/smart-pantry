const dos = (n: number) => String(n).padStart(2, '0');

// Date -> "2026-10-10" (con la fecha local, sin desfase de zona horaria)
export const aClave = (d: Date): string =>
  `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

// "2026-10-10" (o un ISO viejo) -> Date a medianoche local
export const desdeClave = (s: string): Date => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Convierte fechas ISO ya guardadas a "AAAA-MM-DD"
export const normalizarFecha = (s?: string): string | undefined => {
  if (!s) return s;
  return s.length > 10 ? aClave(new Date(s)) : s;
};