# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y el
versionado sigue [SemVer 2.0.0](https://semver.org/lang/es/) (ver punto 29 del informe).

## [v0.2.0-auth] - 2026-09-29

### Agregado
- Integración real con **Firebase Authentication** (correo + contraseña) para Login
  y Registro, con persistencia de sesión (`services/firebase.ts`, `services/authService.ts`).
- `context/AuthContext.tsx`: sesión global disponible en toda la app (`useAuth()`).
- Guarda de sesión en el grupo `(tabs)`: si Firebase está configurado y no hay sesión,
  redirige al login.
- Botón para cerrar sesión desde la pantalla de Inicio (ícono superior derecho).
- Mensajes de error de Firebase traducidos al español (`services/authService.ts`).
- Modo demo: si no existe un archivo `.env`, la app sigue funcionando (login avisa
  en vez de fallar) para no bloquear el uso del resto de las pantallas.
- `docs/09-conexion-firebase.md`: guía paso a paso para crear el proyecto de Firebase
  y conectar la app.
- `.env.example` con las variables necesarias.

### Seguridad
- Las contraseñas ya no se manejan de forma local ni se guardan en texto plano en
  ningún lado: las procesa Firebase Authentication (hash del lado del servidor,
  comunicación cifrada), cumpliendo RNF-04 (punto 2.3).

## [v0.1.0-frontend] - 2026-09-17

Primera versión liberada del proyecto: **frontend completo con datos de ejemplo**,
sin backend todavía.

### Agregado
- Configuración base de Expo + TypeScript + Expo Router (rutas `(auth)`, `(tabs)`, modal).
- Sistema de diseño: paleta de colores, tipografía (Baloo 2 / Nunito), tipos de dominio.
- Pantallas: Login, Registro, Inicio (resumen), Productos, Lista de compras, Categorías.
- Modal "Agregar producto" con validación real (nombre, cantidad > 0, formato de fecha).
- 13 pruebas unitarias (Jest / `jest-expo`) sobre validaciones, fechas y categorías.
- Huevo de pascua: modal "Acerca de" al tocar 3 veces el logo del login.

### Corregido
- Conflicto de dependencias `ERESOLVE` entre `react` y `react-dom` al instalar en un
  equipo distinto al de desarrollo (ver incidencia #1, punto 32).

### Pendiente para próximas versiones
- Capa de servicios (`services/`) conectada a una API/base de datos real.
- Autenticación real (JWT) y roles administrador/miembro.
- Edición y eliminación de productos; actualización de cantidades.
- Despensa compartida entre varios integrantes de un hogar.
- Validación con usuarios reales (ver punto 7.3).
