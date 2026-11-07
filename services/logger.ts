type LogContext = string;

export const logger = {
  error(contexto: LogContext, error: unknown): void {
    if (__DEV__) console.error(`[${contexto}]`, error);
  },
  warn(contexto: LogContext, detalle: string): void {
    if (__DEV__) console.warn(`[${contexto}] ${detalle}`);
  },
};
