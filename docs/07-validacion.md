## 7. Validación

> La verificación (punto 6) responde "¿se construyó bien el software?"; la validación
> responde "¿se construyó el software correcto?", es decir, si lo entregado satisface
> las necesidades reales de los interesados (punto 1.3) y no solo las especificaciones
> escritas.

| No. | Punto de verificación | Evidencia esperada | Resultado |
|---|---|---|---|
| 7.1 | ¿Se definieron criterios de aceptación? | Criterios documentados | ☑ |
| 7.2 | ¿El sistema fue evaluado en su entorno previsto? | Evidencia de validación | ◐ Parcial |
| 7.3 | ¿Los usuarios participaron en la validación? | Actas / registros | ☐ |
| 7.4 | ¿Se comprobó el cumplimiento de las necesidades del usuario? | Pruebas de aceptación | ◐ Parcial |
| 7.5 | ¿Se documentaron los resultados de validación? | Informe | ☑ |
| 7.6 | ¿El cliente o usuario aprobó el sistema? | Acta de aceptación | ☐ |

> **Por qué hay resultados parciales y pendientes, y no todo aprobado:** el proyecto es
> desarrollado por una sola persona, sin un cliente externo formal más allá del
> docente evaluador, y aún no cuenta con backend. Marcar estos puntos como aprobados
> sin haber probado con usuarios reales sería una validación de fachada. Se documenta
> honestamente el estado real y se deja planeado cómo se cerrará cada pendiente.

---

### 7.1 Criterios de aceptación documentados

Retomando las necesidades identificadas en el punto 1.2 y los requisitos de usuario del
punto 2.1, se definen los siguientes criterios de aceptación por funcionalidad:

| Requisito | Criterio de aceptación | Verificable mediante |
|---|---|---|
| RU-01 / RF-06 | Un usuario puede registrar un producto indicando nombre, categoría, cantidad (> 0) y fecha de caducidad (DD/MM/AAAA); si algún dato es inválido, el botón "Guardar" permanece deshabilitado y se explica el motivo | CP-01 (unitaria) |
| RU-02 / RF-07 | Un usuario puede ver la lista completa de productos de su despensa y filtrarla escribiendo parte del nombre | CP-02 (funcional) |
| RU-05 / RF-11 | Cada producto muestra su fecha de caducidad en formato legible (DD/MM/AAAA) y una alerta visual cuando faltan 5 días o menos | CP-05 (unitaria) |
| RU-07 / RF-15 | Un usuario puede agregar un producto a la lista de compras y marcarlo como comprado sin perder el resto de la lista | CP-07 (funcional) |
| RU-08 / RF-12 | Un usuario puede ver sus productos agrupados por categoría, con el conteo correcto de productos por categoría | CP-08 (unitaria + funcional) |
| RU-10 / RNF-03 | Una persona sin capacitación previa puede entender qué hacer al abrir la app (login → resumen → agregar producto) sin ayuda externa | Pendiente de prueba con usuario real (ver 7.3) |
| RU-03, RU-04, RU-06, RU-09 | Editar/eliminar productos, actualizar cantidades desde la lista, compartir despensa entre integrantes y diferenciar roles | Pendiente: requieren la capa de backend (`services/`), aún no implementada |

Estos criterios son la referencia contra la que se compara el resultado de cada prueba
de aceptación (punto 7.4).

---

### 7.2 Evaluación en el entorno previsto

El entorno previsto de Smart Pantry es un **dispositivo móvil (Android/iOS) mediante
Expo Go**, con la versión web como entorno secundario de verificación rápida.

| Entorno | Evidencia | Resultado |
|---|---|---|
| Versión web (`npx expo export -p web`) | Bundle exportado y revisado manualmente (911 módulos, sin errores) | ☑ Evaluado |
| Dispositivo móvil real vía Expo Go | Instalación de Node.js LTS documentada (punto 32, incidencia #2); ejecución de `npx expo start` en el equipo de la desarrolladora | ◐ En proceso — pendiente de captura de pantalla confirmando la carga en el teléfono |
| Distintos tamaños de pantalla | No probado aún de forma sistemática (solo diseño responsivo por defecto de React Native) | ☐ Pendiente |

**Siguiente paso para cerrar este punto:** una vez que `npx expo start` cargue
correctamente en el celular de la desarrolladora (Expo Go), documentar aquí la
captura de pantalla como evidencia definitiva.

---

### 7.3 Participación de usuarios en la validación

Hasta este corte, la aplicación **no ha sido probada por usuarios finales reales**
(un integrante de un hogar distinto a la desarrolladora). Esto se debe a que:

1. El proyecto aún no persiste datos reales (usa `theme/mockData.ts`), por lo que
   cualquier prueba con un usuario externo sería sobre datos ficticios.
2. No existe todavía autenticación real ni separación de roles (RU-09), por lo que no
   se puede simular de forma fiel la experiencia de "varios integrantes de un hogar".

**Plan propuesto para la siguiente etapa:**

- Reclutar de 2 a 3 usuarios (compañeros o familiares) que representen el perfil de
  "integrante de un hogar" descrito en el punto 1.3.
- Pedirles completar, sin ayuda, la tarea "registra un producto y agrégalo a tu lista
  de compras" (criterio RU-10 / RNF-03).
- Registrar el resultado en un acta simple (fecha, participante, tiempo tomado,
  comentarios) una vez que exista una versión con persistencia real de datos.

---

### 7.4 Cumplimiento de las necesidades del usuario (pruebas de aceptación)

| Necesidad identificada (punto 1.2) | ¿Se cumple en el estado actual? | Evidencia |
|---|---|---|
| Contar con un registro de los productos disponibles en la despensa | Sí, en el frontend (con datos de ejemplo) | Pantalla `productos.tsx`, CP-02 |
| Conocer la cantidad disponible de cada producto | Sí, se muestra en cada tarjeta de producto | `ProductListItem.tsx` |
| Registrar la fecha de caducidad de los alimentos | Sí | CP-05, pantalla `producto/nuevo.tsx` |
| Evitar que los productos sean olvidados y se desperdicien | Parcial: existe la insignia visual "por vencer" en Inicio y Productos, pero no hay notificaciones (fuera del alcance definido en 1.5) | Pantalla `(tabs)/index.tsx` |
| Permitir que varios integrantes consulten la misma información | No todavía: requiere backend y hogares compartidos (RU-06) | Pendiente |
| Mantener organizada la información por categorías | Sí | CP-08, pantalla `categorias.tsx` |
| Crear una lista de compras compartida | Parcial: la lista funciona, pero "compartida" entre integrantes requiere backend | Pantalla `lista-compras.tsx` |
| Facilitar la actualización de cantidades al usar/adquirir productos | Parcial: se captura la cantidad al registrar, falta la edición posterior (RU-04/CP-04) | Pendiente |

**Conclusión de este punto:** de las 8 necesidades originales, **4 están cubiertas** en
el frontend actual, **3 están parcialmente cubiertas**, y **1 depende por completo del
backend**. Esto es consistente con el alcance declarado para esta etapa del proyecto.

---

### 7.5 Informe de resultados de validación

Este documento, junto con los informes de los puntos 5 (Integración) y 6
(Verificación), constituye el informe de validación de esta etapa. En resumen:

- **Criterios de aceptación:** definidos para los 10 requisitos de usuario.
- **Entorno de evaluación:** validado en web; pendiente confirmación en dispositivo
  físico.
- **Participación de usuarios:** no realizada aún; planeada para cuando exista
  persistencia real de datos.
- **Cumplimiento de necesidades:** parcial, acorde al alcance de frontend definido en
  el punto 1.5 (funciones fuera del alcance de la primera versión).

---

### 7.6 Acta de aceptación (pendiente de firma)

El sistema **aún no ha sido presentado formalmente** para su aprobación por el
docente/asesor, por lo que esta acta se deja como plantilla, igual que las actas de
revisión de requisitos del punto 2.4, para completarse una vez realizada la
presentación.

```
Proyecto: Smart Pantry – Despensa Inteligente
Versión evaluada: v0.1.0-frontend (ver punto 34)
Fecha: ____________________
Responsable del desarrollo: Grisel Ivonne Zárate Ángeles
Evaluado por: ____________________

Alcance evaluado:
  [ ] Frontend completo (Login, Registro, Inicio, Productos, Categorías, Lista de compras)
  [ ] Pruebas unitarias (13/13 aprobadas)
  [ ] Documentación (Planificación, Requisitos, Diseño, Integración, Verificación, Validación)

Resultado de la evaluación:
  [ ] Aprobado sin observaciones
  [ ] Aprobado con observaciones menores
  [ ] No aprobado / requiere correcciones

Observaciones:


Firma o aprobación:
```
