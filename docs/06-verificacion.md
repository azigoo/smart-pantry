## 6. Verificación

> ¿El software fue construido correctamente respecto de los requisitos y
> especificaciones?

| No. | Punto de verificación | Evidencia esperada | Resultado |
|---|---|---|---|
| 6.1 | ¿Existe un plan de pruebas? | Plan de pruebas | ☑ |
| 6.2 | ¿Se definieron casos de prueba? | Casos de prueba | ☑ |
| 6.3 | ¿Los casos de prueba están relacionados con requisitos? | Matriz de trazabilidad | ☑ |
| 6.4 | ¿Se realizaron pruebas unitarias? | Resultados | ☑ |
| 6.5 | ¿Se realizaron pruebas de integración? | Resultados | ☑ |
| 6.6 | ¿Se realizaron pruebas funcionales? | Resultados | ☑ (manuales) |
| 6.7 | ¿Se registraron los defectos encontrados? | Incidencias | ☑ |
| 6.8 | ¿Se corrigieron los defectos críticos? | Tickets / evidencias | ☑ |
| 6.9 | ¿Se realizaron pruebas de regresión? | Reportes | ☑ |
| 6.10 | ¿Se documentaron los resultados de las pruebas? | Informe de pruebas | ☑ |

> **Alcance de esta verificación:** el proyecto incluye integración con Firebase Auth
> y Firestore, pero las pruebas automatizadas descritas aquí no se conectan a un
> proyecto Firebase ni a un emulador. Por ello, los casos que requieren usuarios,
> reglas desplegadas o múltiples hogares (CP-03, CP-06, CP-09) permanecen
> **pendientes**; no se consideran aprobados por las pruebas unitarias locales.

---

### 6.1 Plan de pruebas

| Elemento | Descripción |
|---|---|
| Objetivo | Verificar que las pantallas y la lógica de negocio ya implementadas cumplan con los requisitos de usuario (RU) y funcionales (RF) definidos en el punto 2, antes de avanzar a la etapa de backend. |
| Alcance | Componentes de interfaz, navegación (Expo Router), lógica de validación de formularios y utilidades de dominio (`theme/`). Quedan fuera de alcance, por ahora, los requisitos que dependen de una API/base de datos real. |
| Estrategia | Combinación de **pruebas unitarias automatizadas** (Jest, para lógica pura: validaciones, fechas, categorías) y **pruebas funcionales manuales** (revisión guiada de cada pantalla contra su requisito, apoyada en el bundle exportado con `expo export -p web`). |
| Herramientas | `jest` + `jest-expo` (unitarias), `npx tsc --noEmit` (tipado), `npx expo export -p web` (integración/compilación). |
| Criterio de entrada | El módulo a probar debe compilar sin errores de TypeScript. |
| Criterio de salida | 100% de las pruebas unitarias definidas deben pasar; los casos de prueba manuales deben quedar documentados con su resultado, aunque el resultado sea "pendiente" por dependencia de backend. |

---

### 6.2 Casos de prueba

| ID | Caso de prueba | Requisito relacionado | Tipo |
|---|---|---|---|
| CP-01 | Registrar un producto validando nombre, cantidad y fecha de caducidad | RU-01 / RF-06 | Unitaria (automatizada) |
| CP-02 | Consultar productos registrados y filtrarlos por nombre | RU-02 / RF-07 | Funcional (manual) |
| CP-03 | Editar y eliminar un producto registrado | RU-03 / RF-08, RF-09 | Funcional (pendiente: pantalla no implementada aún) |
| CP-04 | Actualizar la cantidad disponible de un producto | RU-04 / RF-10 | Funcional (parcial: solo en el alta, falta edición) |
| CP-05 | Registrar y consultar la fecha de caducidad de un producto | RU-05 / RF-11 | Unitaria (automatizada) |
| CP-06 | Acceder a una despensa compartida entre varios integrantes | RU-06 / RF-03, RF-04 | Funcional (pendiente: requiere backend/hogares) |
| CP-07 | Agregar y marcar como comprado un producto en la lista de compras | RU-07 / RF-15, RF-16 | Funcional (manual) |
| CP-08 | Clasificar y consultar productos por categoría | RU-08 / RF-12 | Unitaria (automatizada) |
| CP-09 | Diferenciar acciones entre rol administrador y miembro | RU-09 / RF-05 | Funcional (pendiente: requiere autenticación real) |
| CP-10 | Registrar un producto y consultar la despensa sin capacitación previa | RU-10 / RNF-03 | Usabilidad (pendiente de prueba con usuario real) |

---

### 6.3 Matriz de trazabilidad (requisito → caso de prueba → resultado)

| Requisito | Descripción | Caso de prueba | Resultado |
|---|---|---|---|
| RU-01 | Registro de productos | CP-01 | ☑ Aprobado (9/9 pruebas unitarias de producto) |
| RU-02 | Consulta de productos | CP-02 | ☑ Aprobado (manual) |
| RU-03 | Administración de productos | CP-03 | ☐ Pendiente (funcionalidad no construida) |
| RU-04 | Control de cantidades | CP-04 | ◐ Parcial (validado solo en alta de producto) |
| RU-05 | Control de fechas de caducidad | CP-05 | ☑ Aprobado (4/4 pruebas unitarias) |
| RU-06 | Despensa compartida | CP-06 | ☐ Pendiente (requiere backend) |
| RU-07 | Lista de compras | CP-07 | ☑ Aprobado (manual) |
| RU-08 | Categorías | CP-08 | ☑ Aprobado (2/2 pruebas unitarias) |
| RU-09 | Roles | CP-09 | ☐ Pendiente (requiere autenticación real) |
| RU-10 | Facilidad de uso | CP-10 | ☐ Pendiente (requiere prueba con usuario real) |

---

### 6.4 Resultados de pruebas unitarias

Se implementaron y ejecutaron **17 pruebas unitarias** con Jest (`preset: jest-expo`)
sobre la lógica pura del proyecto (`theme/`). Resultado observado en la Fase 1:

```
PASS theme/__tests__/validators.test.ts
PASS theme/__tests__/dates.test.ts
PASS theme/__tests__/categoryIcons.test.ts

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
Snapshots:   0 total
```

| Archivo de prueba | Caso de prueba | Requisito | Casos cubiertos | Resultado |
|---|---|---|---|---|
| `theme/__tests__/validators.test.ts` | CP-01 | RU-01 / RF-06 | Nombre, cantidad, calendario, fecha pasada, límites y validación de login, registro, perfil y lista de compras | 11/11 aprobadas |
| `theme/__tests__/dates.test.ts` | CP-05 | RU-05 / RF-11 | Días para caducar (fecha futura y vencida), formateo de fecha ISO a DD/MM/AAAA | 4/4 aprobadas |
| `theme/__tests__/categoryIcons.test.ts` | CP-08 | RU-08 / RF-12 | Búsqueda de categoría existente, categoría de respaldo ante un id inválido | 2/2 aprobadas |

**Cómo ejecutarlas:** `npm test` (equivalente a `npx jest`) desde la raíz del proyecto.

---

### 6.5 Resultados de pruebas de integración

Documentadas a detalle en el punto 5 (Integración) de este mismo informe. En resumen:

- `npx tsc --noEmit` → sin errores, incluyendo los nuevos módulos de pruebas.
- `npx expo export -p web` → exporta correctamente (911 módulos, ~1.6 MB), confirmando
  que el flujo de autenticación, tabs y el modal de nuevo producto se integran sin
  romper el árbol de rutas de Expo Router.

---

### 6.6 Resultados de pruebas funcionales

Al no contarse todavía con backend, las pruebas funcionales se realizaron de forma
**manual**, mediante revisión guiada del comportamiento esperado de cada pantalla
contra el bundle exportado:

| Caso de prueba | Pasos ejecutados | Resultado |
|---|---|---|
| CP-02 – Consulta y búsqueda de productos | Cargar `productos.tsx`; escribir un término en el buscador; verificar que la lista se filtre por nombre | Conforme: el filtro (`Array.filter` sobre `nombre`) responde correctamente sobre los datos de ejemplo |
| CP-07 – Lista de compras | Agregar un producto nuevo desde el campo de texto; presionar el checkbox de un producto existente | Conforme: el nuevo producto aparece al inicio de la lista; el producto marcado cambia visualmente (tachado y check verde) |
| CP-08 – Categorías | Abrir la pantalla de Categorías; verificar el conteo de productos por categoría | Conforme: el conteo coincide con los productos de ejemplo asignados a cada categoría |
| CP-01 (complemento manual) – Modal de nuevo producto | Intentar guardar con campos vacíos; completar los campos correctamente | Conforme: el botón "Guardar" permanece deshabilitado y se listan los errores hasta que los datos son válidos |

> Estas pruebas se realizaron sobre el bundle exportado, no sobre un dispositivo físico
> con Expo Go. La verificación en dispositivo real está pendiente de que la
> desarrolladora confirme la ejecución de `npx expo start` en su equipo (ver punto 5.5).

---

### 6.7 Defectos encontrados

Durante la implementación de la Fase 1, las primeras ejecuciones detectaron errores
de tipos y expectativas de validación; se corrigieron y la última ejecución registró
17/17 pruebas aprobadas y `npx tsc --noEmit` sin errores. Las incidencias vigentes
son las ya documentadas en el punto 32:

| ID | Incidencia | Severidad | Estado |
|---|---|---|---|
| #1 | `ERESOLVE` en `npm install` por conflicto de versión de `react-dom` | Alta | Cerrado (Resuelto) |
| #2 | Advertencia de versión de Node.js desactualizada | Media | En verificación |

---

### 6.8 Corrección de defectos críticos

El único defecto de severidad **Alta** identificado hasta ahora (#1, `ERESOLVE`)
impedía completamente instalar el proyecto en un equipo distinto al de desarrollo, por
lo que se consideró crítico. Fue corregido fijando `react-dom` a la misma versión
exacta que `react` (commit `d725723`) y validado con una instalación limpia
(`npm install` sin banderas adicionales). **No existen defectos críticos abiertos** al
cierre de este informe.

---

### 6.9 Pruebas de regresión

Después de incorporar la capa de validaciones (`theme/validators.ts`) y las pruebas
unitarias, se repitieron las verificaciones generales del proyecto para confirmar que
no se introdujeron regresiones:

| Verificación | Resultado antes del cambio | Resultado después del cambio |
|---|---|---|
| `npx tsc --noEmit` | Sin errores | Sin errores (tras agregar `"types": ["jest"]` en `tsconfig.json`) |
| `npx expo export -p web` | Exporta correctamente | Exporta correctamente (911 módulos) |
| Comportamiento del modal "Agregar producto" | Validación simple (nombre y fecha no vacíos) | Validación de nombre, entero de 1 a 99999 y fecha real no anterior a hoy |

---

### 6.10 Informe de resultados

**Resumen general:** de los 10 requisitos de usuario definidos en el punto 2.1, **6**
cuentan con al menos un caso de prueba aprobado en esta etapa (RU-01, RU-02, RU-05,
RU-07, RU-08, y parcialmente RU-04), mientras que **4** dependen de la etapa de backend
para poder verificarse por completo (RU-03, RU-06, RU-09, RU-10). Este resultado es
consistente con el alcance declarado del proyecto en su estado actual (frontend con
datos de ejemplo) y deberá actualizarse conforme avance la integración con la API y la
base de datos.

---

### 6.11 Revisión estática de eficiencia (Fase 2)

Comparación del código en el commit previo a esta fase (`1f39be5`) con el código
actual. Las cifras siguientes son recuentos estáticos de implementaciones; no son
mediciones de tiempo de ejecución ni de facturación de Firebase.

| Indicador inspeccionable | Antes | Después |
|---|---:|---:|
| Listas de productos/compras/categorías implementadas con `FlatList` | 3/3 | 3/3 |
| `renderItem` creado directamente en el render de pantalla | 3 | 0; los 3 usan `useCallback` |
| `keyExtractor` estable en esas listas | 0/3 | 3/3 |
| Filas de listas memorizadas (`React.memo`) | 0 | 3: productos, compras y resumen de producto |
| Escuchas Firestore por usuario autenticado | 2 | 2: una para `productos` y otra para `listaCompras` |
| Llamadas `getDocs` adicionales encontradas | 0 | 0 |

Evidencia: `app/(tabs)/productos.tsx`, `app/(tabs)/lista-compras.tsx`,
`app/(tabs)/categorias.tsx`, `components/InventoryProductRow.tsx`,
`components/ShoppingListRow.tsx`, `components/ProductListItem.tsx` y
`context/DespensaContext.tsx`. Los cálculos de pendientes/comprados ahora comparten
un recorrido de la lista; la ordenación conserva su paso independiente.

La escucha de cada colección sigue cancelándose al desmontar o cambiar de usuario.
También se liberan las escuchas que ya se alcanzaron a crear si falla la inicialización
de la segunda. No se midieron renders reales, latencia, consumo de dispositivo ni
lecturas facturables: para ello se requiere ejecutar la app y observar un emulador o
proyecto Firebase configurado, y las pruebas locales de esta fase no realizan esas
conexiones.

### 6.12 Revisión de accesibilidad y experiencia de uso (Fase 3)

Se añadieron nombres accesibles y roles a los controles interactivos y campos de las
pantallas de acceso, inicio, productos, compras, categorías y perfil, además de los
componentes reutilizables. Los mensajes de error se exponen como alertas accesibles y
los controles de selección comunican su estado. Las pantallas principales muestran
indicadores durante la carga, mensajes cuando no hay elementos y errores de carga
cuando corresponde. Los cambios conservan el huevo de Pascua del logo de inicio y su
`AboutModal`.

Los controles principales modificados usan dimensiones mínimas de 44 puntos o más.
Las eliminaciones siguen pidiendo confirmación en web y móvil; guardar y otras
mutaciones muestran mensajes de retroalimentación mientras se sincronizan los cambios.

Se calcularon ratios WCAG con la fórmula de luminancia relativa sRGB, usando los
valores de `theme/colors.ts`. Los colores principales de texto, acciones y estados
alcanzan al menos 4.94:1 sobre el fondo de la app y 5.45:1 sobre blanco. Los colores
de texto de las cuatro tarjetas, medidos sobre su tarjeta correspondiente, alcanzan
entre 4.92:1 y 5.97:1. El texto de la etiqueta de caducidad medida alcanza 5.85:1.
Estos resultados estáticos exceden 4.5:1 para texto normal en las combinaciones
indicadas; no certifican cada combinación de color posible ni el contraste en un
dispositivo físico.

Evidencia: estilos y controles en `components/PrimaryButton.tsx`,
`components/TextField.tsx`, `components/InventoryProductRow.tsx`,
`components/ShoppingListRow.tsx`, `app/(auth)/login.tsx`,
`app/(auth)/register.tsx` y las pantallas de `app/(tabs)/`. Los ratios se calcularon
con Node.js sobre los colores declarados en `theme/colors.ts`; no se midieron con
capturas de pantalla. No se hicieron pruebas con lector de pantalla, teclado físico,
usuarios reales ni dispositivos físicos.

Verificación de cierre de fase: `npx tsc --noEmit` terminó sin errores y `npm test`
aprobó 3 suites con 17 pruebas.
