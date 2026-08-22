# Quickstart: Verificar el rediseño del panel de administración

Guía para comprobar, sin leer código, que el panel rediseñado cumple la spec (`spec.md`) — pensada
para poder recorrerla como una persona no técnica (Principio IV de la constitution).

## Prerrequisitos

- Variables de entorno configuradas (`.env.local`, ya presente en el repo).
- Una cuenta de administrador del panel ya creada (`npm run crear-admin` si hace falta una nueva).
- Al menos un modelo, un color, una técnica y una solicitud existentes para ver contenido real en
  cada listado (no vacío).

## Levantar el sitio

```bash
npm run dev
```

## Escenario 1 — Fidelidad visual del panel (User Story 1, SC-001)

1. Entrar a `http://localhost:3000/es/panel/login` e iniciar sesión con una cuenta de administrador.
2. Abrir `dashboard/code.html` en otra pestaña como referencia lado a lado.
3. Recorrer, en escritorio (≥1280px): Modelos, Colores, Técnicas, Solicitudes.
4. **Esperado**: en todas las páginas aparece la misma barra lateral fija (marca, iconos, sección
   activa resaltada, nombre del administrador, botón de cerrar sesión), el mismo encabezado de
   página, y el contenido presentado con bordes suaves, sombra e insignias de estado, igual que el
   mockup. Los enlaces de la barra lateral son los reales del panel (Modelos, Colores, Técnicas,
   Solicitudes), no los de ejemplo del mockup.

## Escenario 2 — Sin enlaces de ingresar/registrarme ni selector de idioma (User Story 3, SC-003)

1. Con sesión de panel iniciada, recorrer cada página protegida (Modelos, Colores, Técnicas,
   Solicitudes y al menos una subpágina de detalle de cada una).
2. **Esperado**: en ninguna de ellas aparecen los enlaces "Ingresar"/"Registrarme" ni el selector de
   idioma (ES/EN), en ningún lugar de la página (ni arriba, ni en un menú móvil colapsado).
3. Sin cerrar la sesión del panel, abrir en otra pestaña `/{locale}/cuenta/ingresar` e iniciar sesión
   también como cliente (sesión de cliente en paralelo).
4. Volver a la pestaña del panel y refrescar cualquier página protegida. **Esperado**: sigue sin
   aparecer el selector de idioma ni los enlaces de ingresar/registrarme (FR-008: la sesión de
   cliente no influye en el panel).
5. Ir a `http://localhost:3000/es/panel/login` (cerrando antes la sesión del panel, o en una ventana
   privada). **Esperado**: esta pantalla sigue mostrando la barra pública tal como hoy (no cambia,
   FR-009/FR-012) — no es necesario que oculte nada.

## Escenario 3 — Panel responsive (User Story 2, SC-002, SC-004)

1. Con sesión de panel iniciada, simular un ancho de ~375px (teléfono) en las herramientas de
   desarrollador. **Esperado**: la barra lateral desaparece y aparece un botón de menú; al abrirlo,
   se ven las mismas secciones (Modelos, Colores, Técnicas, Solicitudes) accesibles sin recortes; el
   contenido de la página se ve en una sola columna, sin scroll horizontal.
2. Repetir con un ancho de ~768px y de ~1000px (tablet). **Esperado**: la barra lateral sigue
   colapsada (mismo comportamiento que en móvil) hasta llegar a 1024px, sin overflow horizontal.
3. Repetir con ~1024px y ~1920px (escritorio). **Esperado**: la barra lateral fija aparece a partir
   de 1024px; sin overflow horizontal en ningún ancho probado.
4. En cualquiera de los anchos móvil/tablet, completar una acción habitual (por ejemplo, abrir
   "Nuevo color" y guardar, o cambiar el estado de una solicitud). **Esperado**: todos los controles
   son alcanzables y utilizables, sin quedar cortados ni superpuestos.

## Escenario 4 — Interfaz del panel en español, catálogo sigue bilingüe (Edge case, FR-013, SC-005)

1. Con sesión de panel iniciada, visitar `http://localhost:3000/en/panel/modelos` (ruta en inglés).
2. **Esperado**: la interfaz propia del panel (barra lateral, encabezados, botones) se sigue viendo
   en español — no se traduce al inglés (excepción documentada, FR-013).
3. Abrir el formulario de un modelo (o color/técnica) que tenga nombre y descripción en ambos
   idiomas. **Esperado**: esos campos de catálogo siguen siendo editables y visibles en español e
   inglés como hoy — la excepción de idioma no afecta los datos que el panel administra.

## Escenario 5 — Funcionalidad de negocio intacta (Edge case, FR-010)

1. Crear un modelo nuevo, editar un color existente, cambiar el estado de una solicitud.
2. **Esperado**: cada acción produce el mismo resultado que antes del rediseño (los datos se
   guardan, el estado cambia, el historial de la solicitud se actualiza) — solo cambia la
   apariencia.

## Verificación técnica de apoyo (opcional, no reemplaza los escenarios anteriores)

```bash
npm run typecheck
npm run lint
npm test
```
