import { diasParaCaducar, formatearFecha } from '@/theme/dates';

describe('diasParaCaducar (RU-05 / RF-11: control de fechas de caducidad)', () => {
  it('CP-05.1 - devuelve un número positivo para una fecha futura', () => {
    const hoy = new Date();
    const futura = new Date(hoy.getTime() + 10 * 24 * 60 * 60 * 1000);
    const fechaISO = futura.toISOString().slice(0, 10);
    expect(diasParaCaducar(fechaISO)).toBeGreaterThanOrEqual(9);
  });

  it('CP-05.2 - devuelve un número negativo o cero para una fecha ya vencida', () => {
    const hoy = new Date();
    const pasada = new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fechaISO = pasada.toISOString().slice(0, 10);
    expect(diasParaCaducar(fechaISO)).toBeLessThanOrEqual(0);
  });
});

describe('formatearFecha (RU-05: consulta de fecha de caducidad)', () => {
  it('CP-05.3 - convierte una fecha ISO a formato DD/MM/AAAA', () => {
    expect(formatearFecha('2026-09-20')).toBe('20/09/2026');
  });

  it('CP-05.4 - conserva ceros a la izquierda en día y mes', () => {
    expect(formatearFecha('2026-01-05')).toBe('05/01/2026');
  });
});
