## 5. Integración

En esta etapa se verifica que los distintos componentes desarrollados (pantallas,
componentes de interfaz, sistema de diseño y navegación) funcionen correctamente en
conjunto dentro de una misma aplicación ejecutable. Dado que el proyecto se encuentra
en la etapa de **frontend** (sin backend ni base de datos conectada aún), la integración
descrita en este punto corresponde a la integración de los módulos de interfaz entre sí
y con el motor de navegación (Expo Router), no a la integración con servicios externos.

| No. | Punto de verificación | Evidencia esperada | Resultado |
|---|---|---|---|
| 5.1 | ¿Se integraron los componentes del sistema de forma controlada? | Registro de integración | ☑ |
| 5.2 | ¿Se verificaron las interfaces entre componentes? | Pruebas de integración | ☑ |
| 5.3 | ¿Se identificaron problemas derivados de la integración? | Incidencias | ☑ |
| 5.4 | ¿Se controlaron las versiones utilizadas durante la integración? | Repositorio / CI-CD | ☑ (repositorio) / ☐ (CI-CD aún no configurado) |
| 5.5 | ¿Se realizaron pruebas después de la integración? | Reportes de pruebas | ☑ |

---

### 5.1 Registro de integración

Los componentes se integraron de forma incremental y controlada, confirmando cada
módulo en Git antes de incorporar el siguiente, conforme a la política de commits
descrita en el punto 33.

| Orden | Módulo integrado | Se integra con | Commit asociado |
|---|---|---|---|
| 1 | Sistema de diseño (`theme/colors.ts`, `typography.ts`, `types.ts`) | Base del proyecto (Expo + TypeScript) | `664089f` |
| 2 | Componentes de interfaz (`components/*.tsx`) | Sistema de diseño (`theme/`) | `664089f` |
| 3 | Layout raíz (`app/_layout.tsx`) | Fuentes Baloo 2 / Nunito, `expo-router`, `SafeAreaProvider` | `664089f` |
| 4 | Flujo de autenticación (`app/(auth)/login.tsx`, `register.tsx`) | Componentes de interfaz, layout raíz | `664089f` |
| 5 | Flujo principal (`app/(tabs)/*.tsx`) | Componentes de interfaz, datos de ejemplo (`theme/mockData.ts`) | `664089f` |
| 6 | Modal "Agregar producto" (`app/producto/nuevo.tsx`) | Componentes de interfaz, categorías (`theme/mockData.ts`) | `664089f` |
| 7 | Corrección de dependencias (`react-dom`) | Todo el proyecto (requerido para poder ejecutar la app integrada) | `d725723` |

---

### 5.2 Pruebas de integración entre componentes

Se verificó que las interfaces entre módulos (navegación, paso de datos entre pantallas
y consumo del sistema de diseño) funcionaran correctamente mediante compilación
completa del proyecto:

| Prueba | Herramienta / Comando | Qué valida | Resultado |
|---|---|---|---|
| Integración de tipos entre módulos | `npx tsc --noEmit` | Que los tipos definidos en `theme/types.ts` sean compatibles con las props recibidas por cada componente (`ProductListItem`, `CategoryTile`, `ShoppingListRow`, etc.) | Sin errores |
| Integración de rutas y navegación | `npx expo export -p web` | Que las rutas de `app/(auth)`, `app/(tabs)` y `app/producto/nuevo.tsx` se registren correctamente en el árbol de Expo Router y el bundle final compile sin romperse | 911 módulos empaquetados correctamente (1.6 MB) |
| Integración visual del sistema de diseño | Revisión manual sobre el bundle exportado | Que los componentes reutilizables apliquen correctamente los tokens de `theme/colors.ts` y `theme/typography.ts` en todas las pantallas | Conforme |
| Integración de la instalación de dependencias | `npm install` (entorno limpio de la desarrolladora) | Que el árbol de dependencias declarado en `package.json` se resuelva sin conflictos en un equipo distinto al de desarrollo | Conforme, tras corrección documentada en 5.3 |

---

### 5.3 Incidencias derivadas de la integración

Al integrar el proyecto en un entorno distinto al de desarrollo (equipo de la
desarrolladora, Windows), se identificaron dos incidencias, ambas registradas y
resueltas conforme al procedimiento del punto 32:

| ID | Incidencia | Causa raíz | Solución aplicada | Estado |
|---|---|---|---|---|
| #1 | `npm install` fallaba con error `ERESOLVE` al instalar en un equipo limpio | `react-dom` quedó fijado en una versión (`^19.2.8`) distinta a `react` (`19.2.3`) | Se fijó `react-dom` a la versión exacta `19.2.3` y se regeneró `package-lock.json` | Cerrado (Resuelto) |
| #2 | Advertencia "Node.js is outdated and unsupported" al ejecutar `npx expo start` | Node.js 18 instalado en el equipo de destino, por debajo del mínimo requerido por Expo SDK 57 (`>=20.19.4`) | Se documentó y guio la actualización a Node.js LTS 20.x en el equipo de la desarrolladora | En verificación |

---

### 5.4 Control de versiones durante la integración

- **Repositorio:** el control de versiones se realizó mediante Git, con confirmaciones
  atómicas por módulo integrado (ver tabla de 5.1) y mensajes descriptivos conforme a
  la convención `feat:` / `fix:` / `docs:` (ver punto 33).
- **Dependencias:** las versiones exactas de todas las librerías quedan fijadas en
  `package-lock.json`, lo que garantiza que cualquier equipo que clone el repositorio
  instale exactamente el mismo árbol de dependencias validado durante la integración.
- **CI/CD:** actualmente **no se cuenta con un pipeline de integración continua**
  (GitHub Actions u otro). La verificación se realiza de forma manual mediante los
  comandos `npx tsc --noEmit` y `npx expo export -p web` antes de cada confirmación.
  Se propone incorporar un flujo de CI en la siguiente etapa (al integrarse la capa de
  servicios/backend), que ejecute automáticamente estas mismas validaciones en cada
  Pull Request.

---

### 5.5 Pruebas realizadas después de la integración

| Prueba | Resultado |
|---|---|
| Compilación de tipos de todo el proyecto integrado (`npx tsc --noEmit`) | Sin errores |
| Exportación del bundle web integrado (`npx expo export -p web`) | Exportado correctamente: 911 módulos, bundle de 1.6 MB, sin errores |
| Instalación limpia de dependencias en un segundo equipo (Windows, Node 18 → 20) | Conforme, tras aplicar la corrección de la incidencia #1 |
| Arranque del servidor de desarrollo (`npx expo start`) en el equipo de la desarrolladora | En verificación (pendiente de confirmar carga en dispositivo vía Expo Go) |

**Evidencia esperada aún pendiente:** captura de pantalla del proyecto integrado
ejecutándose en un dispositivo real mediante Expo Go, una vez que la desarrolladora
confirme la actualización de Node.js en su equipo.
