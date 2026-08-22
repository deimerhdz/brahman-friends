# Quickstart: Verificar la migración de la página de inicio

Guía para comprobar, sin leer código, que la nueva página de inicio cumple la spec
(`spec.md`) — pensada para poder recorrerla como una persona no técnica (Principio IV de la
constitution).

## Prerrequisitos

- Variables de entorno de base de datos configuradas (`.env.local`, ya presente en el repo).
- Al menos un modelo con `status = "published"` y su vista `front` cargada, para probar el caso
  "con catálogo". Opcionalmente, un segundo escenario sin modelos publicados para probar el estado
  vacío (FR-010) — puede probarse despublicando temporalmente los modelos o en un entorno sin datos.

## Levantar el sitio

```bash
npm run dev
```

Abrir `http://localhost:3000/es` y `http://localhost:3000/en`.

## Escenario 1 — Fidelidad visual en escritorio (User Story 1, SC-001)

1. Abrir `http://localhost:3000/es` en una ventana de escritorio (≥1280px de ancho).
2. Abrir `landing-page/code.html` en otra pestaña (o su captura) como referencia lado a lado.
3. Recorrer, en orden: barra de navegación, héroe, "The Collection", "B2B Services & Bulk Orders",
   "The Process", pie de página.
4. **Esperado**: mismas secciones, mismo orden, misma jerarquía visual (tamaños de texto, colores,
   espaciados). Diferencias permitidas y esperadas: los enlaces de la barra de navegación (ver
   Escenario 2), las tarjetas de "The Collection" (datos reales, sin precio — ver `data-model.md`),
   y la imagen del héroe (marcador neutro en vez de foto — FR-013).

## Escenario 2 — Opciones existentes de la barra de navegación (User Story 2, SC-002)

1. Con sesión cerrada, abrir la página de inicio. **Esperado**: la barra muestra la opción para
   iniciar sesión / crear cuenta (no "Account" del mockup).
2. Usar el selector de idioma. **Esperado**: la URL y el contenido cambian de `/es` a `/en` (o
   viceversa) manteniendo la misma página.
3. Iniciar sesión con una cuenta de cliente existente (`/${locale}/cuenta/ingresar`) y volver a la
   página de inicio. **Esperado**: la barra ahora muestra el nombre de la cuenta y la opción de
   cerrar sesión.
4. Hacer clic en el nombre del sitio en la barra. **Esperado**: vuelve a `/{locale}` (la misma
   página de inicio).

## Escenario 3 — Adaptación a móvil (User Story 3, SC-002, SC-003)

1. Con las herramientas de desarrollador del navegador, simular un ancho de ~375px (teléfono).
   **Esperado**: una sola columna, sin scroll horizontal, sin contenido cortado.
2. En ese mismo ancho, abrir el menú de navegación móvil. **Esperado**: aparecen las tres opciones
   (inicio, idioma, cuenta) accesibles y usables sin recortes.
3. Repetir con un ancho de ~768px (tablet). **Esperado**: layout intermedio (más columnas donde el
   mockup lo define), sin overflow.
4. Repetir con ~1920px. **Esperado**: sin overflow horizontal ni espacios rotos.

## Escenario 4 — Catálogo vacío (Edge case, FR-010)

1. Con ningún modelo en `status = "published"`, abrir la página de inicio.
2. **Esperado**: la sección "The Collection" muestra el mensaje de estado vacío existente
   (`home.empty`), no tarjetas en blanco ni inventadas.

## Escenario 5 — Modelo publicado sin vista "front" cargada (Edge case, FR-009)

1. Publicar un modelo que todavía no tenga imagen para la vista `front` en el panel de
   administración.
2. Abrir la página de inicio.
3. **Esperado**: la tarjeta de ese modelo se muestra con un fondo neutro de marcador de posición en
   vez de una imagen rota o un espacio vacío que rompa el grid.

## Verificación técnica de apoyo (opcional, no reemplaza los escenarios anteriores)

```bash
npm run typecheck
npm run lint
npm test
```
