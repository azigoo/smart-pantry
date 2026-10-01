# 09. Conexión con Firebase (Autenticación)

Esta guía explica cómo conectar las pantallas de **Login** y **Registro** (ya
preparadas en el código) con un proyecto real de Firebase, para que el inicio de
sesión funcione de verdad y las contraseñas queden protegidas (nunca se guardan en
texto plano; Firebase las recibe por HTTPS y las almacena con hash en sus
servidores).

## 1. Crear el proyecto en Firebase

1. Entra a [console.firebase.google.com](https://console.firebase.google.com/) con tu
   cuenta de Google.
2. Haz clic en **Agregar proyecto**, ponle un nombre (por ejemplo
   `smart-pantry`) y sigue el asistente (puedes desactivar Google Analytics, no es
   necesario para este proyecto).
3. Espera a que termine de crearse.

## 2. Registrar una app "Web" dentro del proyecto

Aunque Smart Pantry es una app móvil, el SDK de Firebase para Expo/React Native se
configura como si fuera una app **Web** (esto es normal, no afecta que corra en
Android/iOS):

1. En el panel del proyecto, haz clic en el ícono **</>** ("Web").
2. Ponle un apodo a la app (por ejemplo `smart-pantry-app`) y haz clic en
   **Registrar app**. No necesitas activar Firebase Hosting.
3. Firebase te mostrará un bloque `firebaseConfig` como este:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "smart-pantry-xxxxx.firebaseapp.com",
     projectId: "smart-pantry-xxxxx",
     storageBucket: "smart-pantry-xxxxx.appspot.com",
     messagingSenderId: "000000000000",
     appId: "1:000000000000:web:abcdef123456",
   };
   ```

   **Guarda estos valores**, los vas a necesitar en el paso 4.

## 3. Activar el método de acceso "Correo electrónico/contraseña"

1. En el menú lateral, ve a **Build → Authentication**.
2. Haz clic en **Comenzar** (si es la primera vez).
3. En la pestaña **Sign-in method**, selecciona **Correo electrónico/contraseña**.
4. Actívalo (el interruptor de "Habilitar") y haz clic en **Guardar**.

Con esto, Firebase ya puede crear cuentas y validar inicios de sesión con correo y
contraseña, aplicando automáticamente sus reglas de seguridad (contraseña mínima de 6
caracteres, protección contra fuerza bruta, etc.).

## 4. Configurar las variables de entorno en el proyecto

1. En la raíz del proyecto (`smart-pantry/`), copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

   (En Windows CMD: `copy .env.example .env`)

2. Abre `.env` y pega los valores del paso 2, uno por variable:

   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=smart-pantry-xxxxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=smart-pantry-xxxxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=smart-pantry-xxxxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
   EXPO_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef123456
   ```

3. **Nunca subas el archivo `.env` a GitHub.** Ya está excluido en `.gitignore`; solo
   se sube `.env.example` (sin valores reales) como referencia para quien clone el
   repositorio.

## 5. Reiniciar el proyecto con caché limpio

Las variables de entorno se incrustan en el bundle al compilar, así que después de
crear o modificar `.env` siempre reinicia con `-c` (clear cache):

```bash
npx expo start -c
```

## 6. Probar que funciona

1. Abre la app (Expo Go o web) y ve a **Regístrate**.
2. Crea una cuenta de prueba con tu nombre, un correo y una contraseña de al menos 6
   caracteres.
3. Deberías entrar directo a la pantalla de Inicio. Para confirmarlo del lado de
   Firebase: ve a **Authentication → Users** en la consola de Firebase — ahí debe
   aparecer el usuario que acabas de crear (sin que la contraseña sea visible en
   ningún lado: Firebase nunca la expone, solo un `uid` y el correo).
4. Cierra sesión tocando el ícono de la esquina superior derecha en Inicio (te pedirá
   confirmación) y vuelve a iniciar sesión con el mismo correo y contraseña.

## 7. ¿Qué pasa si no configuro Firebase?

Nada se rompe: la app detecta que faltan las variables de entorno
(`firebaseEstaConfigurado()` en `services/firebase.ts`) y, en ese caso, el botón de
"Iniciar sesión" muestra un mensaje pidiendo completar esta guía, en lugar de
fallar con un error confuso. Esto permite seguir usando el resto de la app en modo
demo (con los datos de ejemplo de `theme/mockData.ts`) mientras se configura Firebase.

## 8. Notas de seguridad (relacionadas con RNF-04 del punto 2.3)

- Firebase Authentication nunca almacena la contraseña en texto plano: la envía
  cifrada por HTTPS y la guarda con un hash (scrypt) en sus servidores. La
  aplicación tampoco la guarda en ningún lado del lado del cliente.
- El archivo `.env` con las claves reales queda excluido del control de versiones
  (`.gitignore`), tal como se documentó en el punto 35 (Políticas de seguridad).
- Los códigos de error de Firebase (por ejemplo, `auth/wrong-password`) se traducen a
  mensajes en español en `services/authService.ts`, sin exponer detalles técnicos al
  usuario final.
