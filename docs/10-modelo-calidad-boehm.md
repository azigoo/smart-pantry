# Modelo de calidad de Boehm (1978): trazabilidad y evidencia

## Árbol de calidad aplicado

El modelo de Boehm organiza la calidad desde la **utilidad general** del software:

- **Utilidad tal cual (as-is utility):** fiabilidad (exactitud, completitud,
  robustez/integridad y consistencia), eficiencia (uso del dispositivo,
  accesibilidad y responsabilidad/rendición de cuentas) e ingeniería humana
  (accesibilidad y comunicatividad).
- **Mantenibilidad:** capacidad de prueba, comprensibilidad (estructura, concisión,
  legibilidad y autodescripción) y modificabilidad (aumentabilidad).
- **Portabilidad:** independencia del dispositivo y autocontención.

La tabla documenta evidencia del estado del repositorio al cierre de las seis fases.
“Cumple” se reserva para resultados observables de alcance acotado; no implica una
certificación formal ni sustituye pruebas de producción.

## Trazabilidad

| Característica | Subcaracterística | Qué se hizo | Evidencia (archivo/commit/comando) | Estado |
|---|---|---|---|---|
| Fiabilidad | Exactitud | Validación compartida de correo, contraseñas, nombres, cantidades y fechas reales; pruebas de límites. | [`theme/validators.ts`](../theme/validators.ts), [`theme/__tests__/validators.test.ts`](../theme/__tests__/validators.test.ts), commit `1f39be5` | Cumple |
| Fiabilidad | Completitud | Pantallas reportan carga, vacío y errores; se valida la operación local y el guardado. | [`context/DespensaContext.tsx`](../context/DespensaContext.tsx), [`components/ErrorMessage.tsx`](../components/ErrorMessage.tsx), [`docs/06-verificacion.md`](./06-verificacion.md) | Parcial |
| Fiabilidad | Robustez e integridad | Errores Auth/Firestore se manejan y comunican; logger solo en desarrollo; reglas limitan datos al UID autenticado. | [`services/logger.ts`](../services/logger.ts), [`services/despensaFirestore.ts`](../services/despensaFirestore.ts), [`firestore.rules`](../firestore.rules), commit `1f39be5` | Parcial |
| Fiabilidad | Consistencia | Suscripciones Firestore se cancelan al desmontar; las listas sincronizan solo diferencias y evitan lecturas `getDocs` adicionales. | [`context/DespensaContext.tsx`](../context/DespensaContext.tsx), [`services/despensaFirestore.ts`](../services/despensaFirestore.ts), commit `85cef38` | Parcial |
| Eficiencia | Eficiencia del dispositivo | Listas usan `FlatList`, claves y callbacks estables; filas se memorizan donde aportaba. No se midió consumo en dispositivo. | [`app/(tabs)/productos.tsx`](../app/(tabs)/productos.tsx), [`app/(tabs)/lista-compras.tsx`](../app/(tabs)/lista-compras.tsx), commit `85cef38` | Parcial |
| Eficiencia | Accesibilidad | Controles interactivos tienen etiquetas/roles, áreas táctiles y contraste estático AA en las combinaciones documentadas. | [`components/PrimaryButton.tsx`](../components/PrimaryButton.tsx), [`components/TextField.tsx`](../components/TextField.tsx), sección 6.12 de [`docs/06-verificacion.md`](./06-verificacion.md), commit `cc2cf03` | Parcial |
| Eficiencia | Responsabilidad / rendición de cuentas | Se muestran errores y confirmaciones; los errores técnicos se registran en desarrollo. No existe bitácora administrativa de cambios. | [`services/logger.ts`](../services/logger.ts), [`services/platform.tsx`](../services/platform.tsx), [`app/(tabs)/perfil.tsx`](../app/(tabs)/perfil.tsx) | Parcial |
| Ingeniería humana | Accesibilidad | Campos y botones exponen nombres y roles; el control de contraseña tiene etiquetas de mostrar/ocultar. | [`components/TextField.tsx`](../components/TextField.tsx), [`components/__tests__/TextField.test.tsx`](../components/__tests__/TextField.test.tsx), commits `cc2cf03`, `f470812` | Parcial |
| Ingeniería humana | Comunicatividad | Mensajes en español para carga, errores, confirmaciones y guardados; permanecen limitados los estudios con usuarios. | [`app/(tabs)/productos.tsx`](../app/(tabs)/productos.tsx), [`app/(tabs)/lista-compras.tsx`](../app/(tabs)/lista-compras.tsx), [`app/(tabs)/perfil.tsx`](../app/(tabs)/perfil.tsx) | Parcial |
| Mantenibilidad | Capacidad de prueba | Jest cubre lógica, validadores, notificaciones con mocks y componentes; RNTL prueba interacciones. | `npm run test:coverage -- --runInBand`: 11 suites, 41 pruebas; [`components/__tests__/`](../components/__tests__/), [`services/__tests__/`](../services/__tests__/) | Cumple |
| Mantenibilidad | Comprensibilidad: estructura | Pantallas se dividieron en componentes y Firestore se separó de la UI; plataforma se concentra en un servicio. | [`components/`](../components/), [`services/platform.tsx`](../services/platform.tsx), commit `dfff5dc` | Cumple |
| Mantenibilidad | Comprensibilidad: concisión | Entre los cuatro archivos grandes identificados, el mayor pasó de 583 a 262 líneas. Se reporta el máximo entre código `.ts/.tsx` de producción, no Markdown ni pruebas. | Baseline `d54a12b` y estado actual; conteo PowerShell con `Get-Content`/`Measure-Object -Line` | Cumple |
| Mantenibilidad | Comprensibilidad: legibilidad y autodescripción | ESLint Expo y Prettier configurados; validación TypeScript estricta y nombres/tipos explícitos. | [`eslint.config.js`](../eslint.config.js), [`package.json`](../package.json), `npm run lint`, `npx tsc --noEmit` | Cumple |
| Mantenibilidad | Modificabilidad / aumentabilidad | Servicios reutilizables para Firestore y diferencias de plataforma permiten cambiar la UI sin duplicar la lógica de esas APIs. | [`services/despensaFirestore.ts`](../services/despensaFirestore.ts), [`services/platform.tsx`](../services/platform.tsx) | Parcial |
| Portabilidad | Independencia del dispositivo | Se centralizaron confirmaciones, avisos, picker, teclado, persistencia Firebase y disponibilidad de notificaciones. El export web terminó satisfactoriamente. | [`services/platform.tsx`](../services/platform.tsx), `npx expo export -p web` | Parcial |
| Portabilidad | Autocontención | Se documentaron requisitos, instalación y las seis variables de `.env.example`; `.env` permanece ignorado. La app requiere credenciales Firebase para salir del modo demo. | [`README.md`](../README.md), [`.env.example`](../.env.example), [`.gitignore`](../.gitignore), `git check-ignore .env` | Parcial |

## Métricas observadas

| Métrica | Resultado | Evidencia y alcance |
|---|---:|---|
| Pruebas | 41 aprobadas, 11 suites | `npm run test:coverage -- --runInBand`; incluye mocks de notificaciones y pruebas de componentes. |
| Cobertura de sentencias | 89,17 % | Informe de Jest actual. |
| Cobertura de ramas | 79,03 % | Informe de Jest actual. |
| Cobertura de funciones | 91,37 % | Informe de Jest actual. |
| Cobertura de líneas | 93,03 % | Informe de Jest actual. |
| Casts `as any` y parámetros `(c: any)` | 28 antes / 0 después | Antes: `git grep -n -E 'as any|\(c: any\)' d54a12b -- '*.ts' '*.tsx'`; después: búsqueda `rg` en `app`, `components`, `context`, `services` y `theme`, sin coincidencias. |
| Errores ESLint | 0 | `npm run lint` terminó con código 0 y sin diagnósticos. |
| Archivo de producción más grande | 583 líneas antes / 262 después | Medición de `.ts/.tsx` sin `__tests__` en `app`, `components`, `context`, `services` y `theme`; máximo antes y después: `app/(tabs)/productos.tsx`. |
| TypeScript | Sin errores | `npx tsc --noEmit` y `npm run verify`. |
| Export web | Éxito, 1.025 módulos | `npx expo export -p web`; bundle JavaScript web informado de 2,8 MB, salida en `dist/`. |
| Verificación integrada | Éxito | `npm run verify` encadena TypeScript, ESLint y Jest. |

La cobertura es la que reportó Jest para los módulos que instrumentó al ejecutar las
pruebas; no representa cobertura de integración con Firebase ni de todos los flujos
posibles de la aplicación.

## Limitaciones y asuntos pendientes

- No se verificó la app en un dispositivo físico, lector de pantalla ni con usuarios
  reales. Los contrastes documentados son cálculos estáticos; no cubren todas las
  combinaciones de interfaz.
- El export web acredita que Metro empaqueta la aplicación; no demuestra una sesión
  interactiva completa en navegador.
- No se conectó un proyecto Firebase ni un emulador durante esta verificación. Las
  reglas están en el repositorio, pero su despliegue y validación con usuarios
  autenticados siguen pendientes.
- Las notificaciones se probaron con mocks; no se solicitó permiso ni se recibió un
  aviso en hardware.
- `npm install --save-dev @testing-library/react-native` informó 40 vulnerabilidades
  en el árbol de dependencias (9 bajas, 16 moderadas, 14 altas y 1 crítica). No se
  ejecutó `npm audit fix` ni se atribuyeron esas alertas a un paquete específico.
- No se creó un tag de liberación: las verificaciones locales son satisfactorias,
  pero aún faltan validaciones de dispositivo y de Firebase para declarar un release
  final bajo la política SemVer del proyecto.
