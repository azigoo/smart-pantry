## 8. Liberación

> ¿Se libera la versión correcta, de la forma correcta, con la documentación
> necesaria para instalarla y, si algo sale mal, poder regresar atrás?

| No. | Punto de verificación | Evidencia esperada | Resultado |
|---|---|---|---|
| 8.1 | ¿Existe un procedimiento de liberación? | Procedimiento | ☑ |
| 8.2 | ¿La versión liberada está identificada? | Número de versión | ☑ |
| 8.3 | ¿Se verificó que la versión liberada es la correcta? | Checklist de liberación | ☑ |
| 8.4 | ¿Existe un procedimiento de instalación/despliegue? | Manual de instalación | ☑ |
| 8.5 | ¿Se documentaron las configuraciones necesarias? | Configuración | ☑ |
| 8.6 | ¿Existe un mecanismo para regresar a una versión anterior? | Plan de rollback | ☑ |
| 8.7 | ¿Se registró formalmente la liberación? | Acta / registro | ◐ Interno |

> **Nota sobre 8.7:** la liberación quedó registrada formalmente en Git (tag anotado) y
> en este informe. Lo que aún no existe es la **aprobación externa** del docente/asesor
> (esa acta de aceptación quedó como plantilla pendiente en el punto 7.6); por eso se
> marca como registro "interno" y no como acta cerrada por ambas partes.

---

### 8.1 Procedimiento de liberación

Se define el siguiente procedimiento, aplicado tal cual para esta liberación:

1. Confirmar que no existan cambios sin comitear (`git status`).
2. Ejecutar el checklist técnico de liberación (punto 8.3).
3. Actualizar `CHANGELOG.md` con los cambios de la versión.
4. Crear un tag anotado en Git con el número de versión y un resumen del contenido
   (`git tag -a vX.Y.Z -m "..."`).
5. Regenerar el paquete distribuible (`.zip` del proyecto, sin `node_modules`).
6. Compartir el paquete y actualizar la documentación del proyecto.

---

### 8.2 Identificación de la versión liberada

- **Versión:** `v0.1.0-frontend`
- **Commit exacto:** `d2c6176` (`d2c61765c9eb38975167fdcd4c51ecdbedf6e684`)
- **Fecha de corte:** 17/09/2026
- **Tag en Git:** anotado, con mensaje descriptivo del contenido y del checklist
  ejecutado (visible con `git show v0.1.0-frontend` o `git tag -n99 v0.1.0-frontend`).

Este tag reemplaza la propuesta que se había dejado pendiente en el punto 34; ya **no
es una propuesta, es un tag real** en el repositorio.

---

### 8.3 Checklist de liberación ejecutado

Antes de crear el tag `v0.1.0-frontend` se corrió el siguiente checklist técnico sobre
el estado exacto del código a liberar:

| Verificación | Comando | Resultado |
|---|---|---|
| Tipado estricto | `npx tsc --noEmit` | Sin errores |
| Pruebas unitarias | `npx jest` | 13/13 aprobadas (3 suites) |
| Build de integración (web) | `npx expo export -p web` | Exportado sin errores |
| Estado del repositorio | `git status` | Sin cambios pendientes de comitear antes del tag |

El resultado íntegro de este checklist quedó incluido como parte del mensaje del tag
anotado (punto 8.2), de modo que la evidencia viaja pegada a la versión, no solo en
este documento.

---

### 8.4 Procedimiento de instalación / despliegue

Documentado en `README.md` (raíz del repositorio), sección "Instalación" y "Ejecutar en
desarrollo":

```bash
git clone <url-del-repositorio>
cd smart-pantry
git checkout v0.1.0-frontend   # para instalar exactamente esta version
npm install
npx expo start
```

Desde el Metro Bundler: escanear el QR con **Expo Go**, o presionar `w` para la versión
web. No existe todavía un procedimiento de despliegue a tiendas (Play Store / App
Store) ni a un servidor, ya que el proyecto aún no tiene backend que desplegar; esto se
documentará en la siguiente liberación.

---

### 8.5 Configuraciones necesarias

Documentado en `README.md`, sección "Configuración": **esta versión no requiere
variables de entorno ni archivos `.env`**, ya que no se conecta a ningún servicio
externo (usa `theme/mockData.ts`). Se deja indicado en el propio README que, al
integrarse el backend, ahí mismo se documentarán las variables necesarias (por
ejemplo, claves de API) junto con un archivo `.env.example`.

---

### 8.6 Plan de rollback (regreso a una versión anterior)

Al no existir todavía un entorno de producción desplegado (la app corre de forma local
vía Expo Go), el "rollback" aplica al **código fuente y sus dependencias**:

| Escenario | Acción de rollback |
|---|---|
| La versión liberada (`v0.1.0-frontend`) presenta un defecto grave | `git checkout v0.1.0-frontend` (o el tag estable anterior) para volver al último estado verificado, sin depender de `main` si este ya avanzó |
| Un cambio de dependencias rompe la instalación | Restaurar `package-lock.json` de la versión anterior (`git checkout <tag-anterior> -- package-lock.json`) y correr `npm ci` para reinstalar exactamente ese árbol de dependencias |
| Se necesita comparar el comportamiento entre dos versiones | `git diff <tag-anterior> <tag-actual>` sobre el código, apoyado en el `CHANGELOG.md` para el resumen funcional |

Al no haber todavía una base de datos ni backend, no existe aún un plan de rollback de
datos (migraciones); ese plan se definirá cuando se integre la persistencia real, dado
que en ese momento un rollback de código podría quedar desincronizado con el esquema de
datos ya migrado.

---

### 8.7 Registro formal de la liberación

**Registrado en:**

- **Git:** tag anotado `v0.1.0-frontend` sobre el commit `d2c6176`, con el detalle del
  contenido y el checklist ejecutado embebido en el propio mensaje del tag.
- **`CHANGELOG.md`:** entrada `[v0.1.0-frontend] - 2026-09-17` con lo agregado,
  corregido y pendiente.
- **Este informe** (puntos 8.1 a 8.7).

**Pendiente:** la aprobación formal por parte de un tercero (docente/asesor) mediante
firma, conforme a la plantilla de acta de aceptación dejada en el punto 7.6. Esta
liberación, por tanto, es un **registro interno de la desarrolladora**, válido como
evidencia de buenas prácticas de control de versiones, pero no equivale todavía a una
aceptación formal del cliente.
