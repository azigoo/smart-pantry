import { aClave, desdeClave, normalizarFecha } from '@/theme/fechaLocal';

describe('fechas locales', () => {
  it('serializa componentes de fecha locales sin desfase de zona horaria', () => {
    expect(aClave(new Date(2026, 0, 5, 23, 45))).toBe('2026-01-05');
  });

  it('reconstruye una clave como medianoche local', () => {
    const fecha = desdeClave('2026-02-03');
    expect([fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours()]).toEqual([
      2026, 1, 3, 0,
    ]);
  });

  it('normaliza fechas ISO, deja intactas las claves y conserva valores vacíos', () => {
    expect(normalizarFecha('2026-04-10')).toBe('2026-04-10');
    expect(normalizarFecha('2026-04-10T00:00:00')).toBe(aClave(new Date('2026-04-10T00:00:00')));
    expect(normalizarFecha(undefined)).toBeUndefined();
    expect(normalizarFecha('')).toBe('');
  });
});
