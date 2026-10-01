## 27. Implementación de Requisitos en el Código Fuente

La implementación del sistema se estructura mediante el sistema de rutas de **Expo
Router** dentro del directorio `app/`. A continuación se presenta el mapeo de los
archivos físicos del proyecto frente a los requisitos, indicando el estado real de avance
en el repositorio.

| Módulo / Archivo Fuente | Rol en la Arquitectura | Requisitos Implementados | Estado de Avance |
|---|---|---|---|
| `app/_layout.tsx` | Layout raíz: carga de fuentes (Baloo 2 / Nunito), splash screen y stack de navegación global | RNF-03, RNF-08 | 100% (Completado) |
| `app/index.tsx` | Punto de entrada; redirige al flujo de autenticación | RF-02 | 100% (Completado) |
| `app/(auth)/_layout.tsx` | Contenedor de rutas Stack del flujo de autenticación | RF-01, RF-02 | 100% (Completado) |
| `app/(auth)/login.tsx` | Inicio de sesión con correo y contraseña | RF-02, RNF-03 | 100% (frontend, sin validar contra backend) |
| `app/(auth)/register.tsx` | Registro de nuevos usuarios | RF-01, RNF-03 | 100% (frontend, sin validar contra backend) |
| `app/(tabs)/_layout.tsx` | Barra de navegación inferior (Inicio, Productos, Compras, Categorías) | RU-10, RNF-03 | 100% (Completado) |
| `app/(tabs)/index.tsx` | Dashboard de inicio: resumen de la despensa, tarjetas de estadísticas y productos por vencer | RF-07, RU-02 | 100% (frontend con datos de ejemplo) |
| `app/(tabs)/productos.tsx` | Consulta y búsqueda de productos registrados | RF-07, RU-02 | 100% (frontend con datos de ejemplo) |
| `app/(tabs)/lista-compras.tsx` | Lista de compras compartida: agregar y marcar como comprado | RF-15, RU-07 | 100% (frontend, estado local en memoria) |
| `app/(tabs)/categorias.tsx` | Clasificación de productos por categoría | RF-12, RU-08 | 100% (frontend con datos de ejemplo) |
| `app/producto/nuevo.tsx` | Modal para el registro de un nuevo producto | RF-06, RU-01 | 80% (formulario funcional, aún no persiste datos) |
| `components/*.tsx` | Componentes de interfaz reutilizables (botones, campos de texto, tarjetas, filas de lista) | RNF-03, RNF-08 | 100% (Completado) |
| `theme/*.ts` | Sistema de diseño (colores, tipografía), tipos de dominio y datos de ejemplo (mock) | RNF-08 | 100% (Completado) |
| `services/` (pendiente) | Comunicación con la API / base de datos | RF-01, RF-06, RF-15, RNF-04, RNF-05 | 0% (No iniciado) |

> **Nota:** Todas las pantallas actuales corresponden a la etapa de **frontend**. Los
> datos que se muestran provienen de `theme/mockData.ts`; aún no existe una capa de
> servicios conectada a una API o base de datos real, por lo que los requisitos de
> persistencia, autenticación real y roles de usuario (RF-01 a RF-05, RNF-04, RNF-05)
> permanecen pendientes para la siguiente etapa del proyecto.

---

## 28. Control de Versiones del Código Fuente (Git y GitHub)

El ciclo de desarrollo utiliza **Git** como sistema de control de versiones distribuido.
Al tratarse de un proyecto desarrollado de manera **individual** (ver punto 1.7,
Responsables del proyecto), la estrategia de ramas se mantiene simplificada, priorizando
la trazabilidad de los cambios sobre la coordinación entre varios desarrolladores.

**Estrategia de ramas del repositorio (Git Workflow)**

- **main:** Contiene el código fuente estable. Actualmente concentra todo el
  desarrollo, dado que el proyecto se encuentra en su primera etapa (planificación,
  análisis y primeras pantallas de frontend).
- **develop** *(propuesta para la siguiente etapa):* Rama de integración donde se
  incorporarán las funcionalidades de backend (autenticación, base de datos) antes de
  fusionarse a `main`.
- **feature/\*** *(propuesta para la siguiente etapa):* Ramas temporales para
  construir de forma aislada cada módulo nuevo, por ejemplo `feature/auth-api`,
  `feature/persistencia-productos`, integrándose a `develop` una vez finalizadas y
  probadas.

Esta estructura se documenta como política a seguir a partir de la etapa de desarrollo
del backend, cuando el volumen de cambios simultáneos lo justifique.

---

## 29. Control de Versiones del Software (Historial de Versiones)

El control de versiones del proyecto se gestionará bajo el estándar **Versionado
Semántico 2.0.0 (SemVer: X.Y.Z)**, complementado con etiquetas en el repositorio (Git
Tags) y este mismo documento como registro de cambios (changelog).

**A. Política de versionado semántico (SemVer)**

- **MAJOR (X.0.0):** Cambios de arquitectura que rompen compatibilidad, o la
  liberación de la versión final del proyecto.
- **MINOR (0.Y.0):** Incorporación de nuevos módulos o requisitos funcionales
  completados al 100% (por ejemplo, cierre del módulo de gestión de productos con
  persistencia real).
- **PATCH (0.0.Z):** Correcciones menores de errores, ajustes visuales o
  actualización de dependencias (por ejemplo, la corrección de la versión de
  `react-dom` descrita en el punto 33).

**B. Mecanismo de etiquetado en Git (Git Tags)**

```bash
# Ejemplo de etiquetado de corte de versión
git checkout main
git tag -a v0.1.0 -m "Release v0.1.0: primeras pantallas de frontend (login, inicio,
productos, categorias, lista de compras)"
git push origin v0.1.0
```

Al momento de este corte, el repositorio no cuenta aún con etiquetas formales; se
propone `v0.1.0` como primer hito, correspondiente al estado descrito en el punto 27.

---

## 30. Proceso y Evidencia de Revisiones de Código (Code Reviews & PR)

Dado que el proyecto es desarrollado por una sola persona, no existe un flujo de Pull
Request entre distintos integrantes. En su lugar, se aplica un proceso de
**autorrevisión** antes de cada confirmación (commit), utilizando la misma lista de
verificación que se seguiría en un equipo de trabajo, con el fin de mantener la
disciplina de calidad del código.

**A. Lista de comprobación para revisión de código (Code Review Checklist)**

Previo a cada confirmación relevante, se verifica:

- **Tipado estricto:** ausencia de `any` implícito; `tsconfig.json` configurado con
  `"strict": true`.
- **Compilación limpia:** ejecución de `npx tsc --noEmit` sin errores antes de
  confirmar cambios.
- **Build funcional:** ejecución de `npx expo export -p web` para validar que el
  proyecto compila y empaqueta sin errores de bundling.
- **Estilo y buenas prácticas:** componentes funcionales, sin `console.log`
  innecesarios, uso de `StyleSheet.create` para los estilos.

**B. Bitácora de revisiones**

| ID | Título | Autora / Revisora | Criterios validados | Estado |
|---|---|---|---|---|
| REV-01 | Scaffold inicial de Expo Router + primeras pantallas | Grisel Ivonne Zárate Ángeles | `tsc --noEmit` sin errores; `expo export -p web` compila (911 módulos) | Aprobado |
| REV-02 | Corrección de conflicto de dependencias `react-dom` | Grisel Ivonne Zárate Ángeles | Instalación limpia con `npm install` sin banderas adicionales; recompilación exitosa | Aprobado |

---

## 31. Estándares y Reglas de Codificación del Software

**A. Herramientas de análisis estático y configuración**

- **TypeScript (`tsconfig.json`):** modo estricto (`"strict": true`), con alias de
  rutas `@/*` configurado para importaciones limpias (`@/theme/colors`,
  `@/components/PrimaryButton`).
- **ESLint** *(pendiente de configurar):* se incorporará en la siguiente etapa junto
  con la capa de servicios, para mantener consistencia entre las reglas de estilo de
  las pantallas y la lógica de negocio.

**B. Convenciones de nomenclatura y tipografía**

| Elemento de código | Convención | Regla aplicada | Ejemplo en el proyecto |
|---|---|---|---|
| Pantallas (rutas) | camelCase / kebab-case | Segmentos de archivo para Expo Router dentro de `app/` | `login.tsx`, `lista-compras.tsx`, `producto/nuevo.tsx` |
| Componentes | PascalCase | Nombre descriptivo de la vista o elemento de interfaz | `PrimaryButton.tsx`, `ProductListItem.tsx`, `CategoryTile.tsx` |
| Módulos de dominio y estilo | camelCase | Archivos orientados a datos, tipos o configuración visual | `colors.ts`, `mockData.ts`, `dates.ts` |
| Interfaces y tipos | PascalCase | Contratos formales de datos | `Producto`, `Category`, `ItemCompra` |
| Funciones y hooks | camelCase | Verbos de acción o prefijo `use` para hooks | `getCategoria()`, `diasParaCaducar()`, `formatearFecha()` |
| Colores y tokens de diseño | camelCase | Definidos en `theme/colors.ts` como constantes tipadas | `colors.primary`, `colors.cardYellow` |

**C. Reglas de arquitectura y estructura de componentes**

1. **Uso exclusivo de componentes funcionales y hooks:** no se utilizan componentes
   basados en clases; el estado se maneja con `useState` y los efectos con
   `useEffect`, junto con los hooks de navegación de Expo Router (`router`, `Link`).
2. **Tipado estricto de props:** cada componente reutilizable define su propio tipo
   `Props` (por ejemplo, en `PrimaryButton.tsx` y `ProductListItem.tsx`).
3. **Separación de responsabilidades:** las pantallas dentro de `app/` no contienen
   lógica de acceso a datos; por ahora consumen directamente los arreglos de
   `theme/mockData.ts`, en previsión de que esta capa sea reemplazada por un
   directorio `services/` cuando se integre la API/base de datos.
4. **Inmutabilidad:** las actualizaciones de listas (por ejemplo, marcar un producto
   de la lista de compras como comprado en `lista-compras.tsx`) se realizan mediante
   `map` sobre el arreglo de estado, sin mutar directamente los objetos originales.

---

## 32. Sistema de Gestión y Control de Incidencias (Defect Tracking)

Se adoptará **GitHub Issues** del repositorio como herramienta centralizada para
registrar y dar seguimiento a anomalías detectadas durante las pruebas, siguiendo el
ciclo de estados:

`[1. Abierta / Reportada] → [2. En Análisis / Reproducción] → [3. En Corrección] → [4. Verificada en Pruebas] → [5. Cerrada / Resuelta]`

**Criterios de clasificación por severidad**

- **Alta:** anomalías que impiden ejecutar la aplicación o rompen la compilación
  (`tsc` o `expo export` fallan).
- **Media:** comportamientos inesperados en la interfaz (por ejemplo, un componente
  que no respeta la paleta de colores) que no detienen el flujo general.
- **Baja:** desajustes cosméticos o advertencias informativas en consola.

**Bitácora de incidencias registradas**

| ID | Título / Defecto | Módulo afectado | Severidad | Causa raíz | Solución aplicada | Estado |
|---|---|---|---|---|---|---|
| #1 | `npm install` falla con `ERESOLVE` por conflicto de peer dependencies | `package.json` | Alta | `react-dom` quedó fijado en una versión (`^19.2.8`) distinta a `react` (`19.2.3`) tras instalar soporte web | Se fijó `react-dom` a la misma versión exacta que `react` (`19.2.3`) y se regeneró `package-lock.json` | Cerrado (Resuelto) |
| #2 | Advertencia "Node.js is outdated" al ejecutar `npx expo start` | Entorno de desarrollo | Media | Node.js 18 instalado en el equipo de la desarrolladora, por debajo del mínimo requerido por Expo SDK 57 (`>=20.19.4`) | Se documentó la actualización a Node.js LTS (20.x o superior) en el README | En verificación |

---

## 33. Control de Cambios en el Código Fuente (Commits)

Cada confirmación representa una unidad lógica de cambio, siguiendo la convención de
prefijos descriptivos (`feat:`, `fix:`, `docs:`). A continuación se presenta el historial
real de confirmaciones registradas en la rama `main` del repositorio.

| Hash | Fecha | Mensaje del commit | Tipo / Alcance | Elemento asociado |
|---|---|---|---|---|
| `d725723` | 06/09/2026 | fix: fijar react-dom a la misma version que react (evita ERESOLVE en npm install) | Corrección (fix) | Incidencia #1 (punto 32) |
| `4cffb0e` | 05/09/2026 | docs: agregar README con instrucciones de instalación y estado del proyecto | Documentación (docs) | Guía de instalación y estado del proyecto |
| `664089f` | 05/09/2026 | feat: scaffold Smart Pantry con Expo Router + primeras pantallas de frontend | Funcionalidad (feat) | RF-06, RF-07, RF-12, RF-15, RU-01, RU-02, RU-07, RU-08 (ver punto 27) |

---

## 34. Identificación de Versiones Mediante Etiquetas (Git Tags)

El repositorio aún no cuenta con etiquetas formales, ya que el proyecto se encuentra en
su primer hito de desarrollo. Se propone el siguiente corte como primera versión
etiquetable, una vez validado el funcionamiento en el entorno de la desarrolladora:

| Identificador (Tag) | Hash / Commit | Fecha de corte propuesta | Descripción del hito |
|---|---|---|---|
| `v0.1.0-frontend` | `d725723` | Pendiente de asignar | Primeras pantallas de frontend completadas: Login, Registro, Inicio (resumen), Productos, Lista de compras, Categorías y modal de Agregar producto, con sistema de diseño (colores, tipografía) y datos de ejemplo. |

---

## 35. Manual Técnico para el Mantenimiento y Despliegue del Software

**1. Ficha técnica y stack tecnológico**

| Componente | Tecnología / Versión | Propósito en el sistema |
|---|---|---|
| Plataforma objetivo | React Native / Expo (SDK 57) | Aplicación móvil multiplataforma (Android / iOS / Web) |
| Enrutamiento | Expo Router | Navegación declarativa basada en el sistema de archivos (`app/`) |
| Lenguaje | TypeScript (modo `"strict": true`) | Tipado estático para prevenir errores en tiempo de compilación |
| Tipografía | `@expo-google-fonts/baloo-2`, `@expo-google-fonts/nunito` | Identidad visual de la aplicación (títulos redondeados / cuerpo de texto) |
| Iconografía | `@expo/vector-icons` (MaterialCommunityIcons) | Íconos de categorías, navegación y estados |
| Backend as a Service | *Por definir (siguiente etapa)* | Autenticación y almacenamiento de usuarios, hogares y productos |
| Base de datos | *Por definir (siguiente etapa)* | Persistencia de productos, categorías y lista de compras |

**2. Arquitectura de software y separación de responsabilidades (SoC)**

- **Capa de presentación (`app/`):** rutas organizadas por grupos de navegación:
  `(auth)` para el flujo de acceso/registro y `(tabs)` para el flujo principal de la
  despensa. Los componentes son puramente funcionales y, por ahora, consumen datos de
  ejemplo directamente.
- **Capa de componentes de interfaz (`components/`):** elementos visuales
  reutilizables (botones, campos de texto, tarjetas, filas de lista) desacoplados de
  la lógica de negocio.
- **Capa de sistema de diseño y dominio (`theme/`):** centraliza colores, tipografía,
  tipos de datos (`Producto`, `Category`, `ItemCompra`) y utilidades (cálculo de días
  para caducar, formateo de fechas).
- **Capa de servicios (`services/`, pendiente):** en la siguiente etapa concentrará la
  comunicación con la API o base de datos, desacoplando el cliente visual del origen
  de los datos.

**3. Modelo de datos previsto**

De acuerdo con el diseño de la base de datos definido en el punto 3.4 (Arquitectura de
datos), la siguiente etapa de desarrollo implementará las siguientes entidades:

- **usuarios:** perfil, correo, contraseña (con hash) y rol.
- **hogares:** espacio compartido y administrador.
- **integrantes:** relación entre usuarios y hogares, con su rol.
- **productos:** nombre, categoría, cantidad y fecha de caducidad, asociados a un
  hogar.
- **categorías:** catálogo de clasificación de productos.
- **lista de compras:** productos pendientes de adquirir por hogar.

**4. Guía de instalación, configuración y despliegue local**

```bash
# 1. Clonación del repositorio (una vez publicado en GitHub)
git clone <url-del-repositorio>
cd smart-pantry

# 2. Instalación de dependencias
npm install

# 3. Ejecución del servidor de desarrollo
npx expo start
```

Desde el Metro Bundler puede escanearse el código QR con la app **Expo Go**, o
presionar `w` para abrir la versión web del proyecto.

**5. Políticas de seguridad, calidad y mantenimiento**

- **Seguridad de secretos:** cuando se integre el backend, las credenciales (API keys,
  cadenas de conexión) se manejarán mediante variables de entorno (`.env`), excluidas
  del control de versiones mediante `.gitignore`, siguiendo lo establecido en el punto
  1.6 (Restricciones legales y de seguridad).
- **Privacidad de datos:** de acuerdo con RNF-05, los datos registrados dentro de cada
  hogar deberán estar disponibles únicamente para sus integrantes autorizados.
- **Análisis estático y estándares de código:** validación continua mediante
  `npx tsc --noEmit` antes de cada confirmación relevante, conforme a lo descrito en el
  punto 30.
