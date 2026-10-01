# Smart Pantry – Despensa Inteligente

App móvil (Expo + React Native + TypeScript) para administrar de forma compartida los
productos de la despensa de un hogar, reducir el desperdicio de alimentos y llevar una
lista de compras.

Este repo contiene, por ahora, **solo el frontend** (sin backend/API ni base de datos):
las pantallas usan datos de ejemplo en `theme/mockData.ts`.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- App **Expo Go** en tu teléfono (Android/iOS) para probar la app, o un emulador

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npx expo start
```

Esto abre el Metro Bundler. Desde ahí puedes:

- Escanear el QR con la app **Expo Go** en tu celular.
- Presionar `w` para abrir la versión web.
- Presionar `a` / `i` para abrir en emulador Android / simulador iOS (si están configurados).

## Ejecutar las pruebas unitarias

```bash
npm test
```

Esto corre las pruebas con Jest (`jest-expo`) sobre la lógica de `theme/`
(validaciones del formulario de producto, cálculo de fechas de caducidad y
resolución de categorías). Deberías ver `13 passed, 13 total`.

## Configuración (Firebase Authentication)

Esta versión **ya incluye la integración con Firebase Authentication** para el login
y registro (correo + contraseña), con las contraseñas protegidas por Firebase (nunca
se guardan en texto plano). Para activarla en tu propio proyecto de Firebase:

```bash
cp .env.example .env
# edita .env con las credenciales de tu proyecto de Firebase
npx expo start -c
```

La guía completa, paso a paso (crear el proyecto en Firebase, activar el método de
correo/contraseña, obtener las credenciales), está en
[`docs/09-conexion-firebase.md`](./docs/09-conexion-firebase.md).

**Si no configuras Firebase**, la app sigue funcionando en modo demo: el login te
avisa que falta configurarlo (en vez de fallar) y el resto de las pantallas
(Productos, Categorías, Lista de compras) siguen mostrando los datos de ejemplo de
`theme/mockData.ts`.

## Documentación completa del proyecto

Todos los puntos de la rúbrica (Integración, Verificación, Validación, Liberación,
control de versiones, estándares de código, etc.) están documentados en
[`docs/`](./docs/README.md).

## Estructura del proyecto

```
app/                     Pantallas y navegación (expo-router)
  _layout.tsx            Layout raíz: carga fuentes y define el stack de navegación
  index.tsx              Redirige al login
  (auth)/
    login.tsx            Pantalla de inicio de sesión
    register.tsx         Pantalla de registro
  (tabs)/
    _layout.tsx           Barra de navegación inferior
    index.tsx             Inicio / resumen de la despensa
    productos.tsx          Lista de productos + buscador
    lista-compras.tsx      Lista de compras compartida
    categorias.tsx         Categorías de productos
  producto/
    nuevo.tsx              Modal para agregar un producto

components/              Componentes reutilizables de UI
  PrimaryButton.tsx
  TextField.tsx
  StatCard.tsx
  ScreenHeader.tsx
  ProductListItem.tsx
  CategoryTile.tsx
  ShoppingListRow.tsx

theme/                    Sistema de diseño y datos
  colors.ts                Paleta de colores
  typography.ts            Tipografías (Baloo 2 / Nunito) y escala tipográfica
  types.ts                 Tipos (Producto, Category, ItemCompra)
  mockData.ts               Datos de ejemplo (productos, categorías, lista de compras)
  dates.ts                  Utilidades de fecha (días para caducar, formateo)
  categoryIcons.ts          Helper para obtener la categoría por id
  validators.ts             Validación del formulario "Agregar producto" (RF-06)
  __tests__/                Pruebas unitarias (Jest) de las utilidades de arriba

services/                 Integración con servicios externos
  firebase.ts               Inicialización de Firebase (App + Auth con persistencia)
  authService.ts             Iniciar sesión, registrar y cerrar sesión (Firebase Auth)

context/
  AuthContext.tsx           Sesión global: usuario actual, si Firebase está configurado

docs/                      Documentación del proyecto (ver docs/README.md)
```

## Estado actual (frontend)

- [x] Configuración de Expo Router (rutas con grupos `(auth)` y `(tabs)`, modal)
- [x] Sistema de diseño (colores, tipografía, componentes base)
- [x] Login y Registro
- [x] Inicio con resumen (tarjetas de estadísticas + productos por vencer)
- [x] Productos (lista + buscador)
- [x] Lista de compras (agregar / marcar como comprado)
- [x] Categorías (grilla)
- [x] Modal "Agregar producto" (con validación real: nombre, cantidad y fecha)
- [x] Pruebas unitarias (Jest) para validaciones, fechas y categorías (13/13 aprobadas)
- [x] Autenticación real con Firebase (login, registro, cerrar sesión, contraseñas
      protegidas por Firebase) — requiere tu propio archivo `.env` (ver arriba)
- [x] Huevo de pascua: modal "Acerca de" al tocar 3 veces el logo del login
- [ ] Conexión a una base de datos real para productos, categorías y lista de compras
- [ ] Roles administrador / miembro (requiere modelo de datos de "hogares")
- [ ] Edición y eliminación de productos
- [ ] Persistencia de la lista de compras y productos

## Notas técnicas

- Los productos, categorías y lista de compras siguen siendo **mock**
  (`theme/mockData.ts`); no hay persistencia todavía. La autenticación (login/registro)
  ya es real, vía Firebase.
- Sin un archivo `.env` configurado, el botón "Iniciar sesión" muestra un aviso en vez
  de navegar (ver `docs/09-conexion-firebase.md`).
- Verificado: `npx tsc --noEmit` sin errores, `npx expo export -p web` compila
  correctamente y `npm test` pasa 13/13 pruebas unitarias (todo re-verificado después
  de agregar Firebase).
