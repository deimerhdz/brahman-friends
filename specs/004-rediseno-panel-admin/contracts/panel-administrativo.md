# Contrato de UI: Panel de administración rediseñado

Esta feature no expone ninguna API nueva. Su "interfaz" es el conjunto de páginas del panel y el
layout compartido que las envuelve. Este documento fija el contrato de esa interfaz para que la
implementación (tasks) y la verificación (quickstart) tengan la misma referencia.

## Layout compartido: `panel/(protected)/layout.tsx`

Aplica a **todas** las páginas protegidas por sesión del panel (Modelos, Colores, Técnicas,
Solicitudes y sus subpáginas), no a `panel/login`.

**Entradas**

- `session` (server-side, vía `getSession()`): si es `null`, redirige a `/{locale}/panel/login`
  (sin cambios respecto a hoy).

**Salida (estructura visible)**

1. Barra lateral (`_PanelNav.tsx`):
   - Marca del panel.
   - Enlaces a las secciones reales (Modelos, Colores, Técnicas, Solicitudes), con la sección
     activa resaltada (FR-002).
   - Nombre del administrador autenticado (`session.name`).
   - Botón de cerrar sesión.
   - Fija en pantallas ≥1024px; reemplazada por un botón de menú + panel colapsado en <1024px
     (FR-005, `_MobilePanelNav.tsx`).
2. Contenido de la página (`{children}`), envuelto en un encabezado de página (`_PanelHeader.tsx`:
   título + acción principal cuando la página la tenga) y el contenedor visual del mockup
   (`ghost-border`, `ambient-shadow`, tokens de radio — FR-001, FR-003).

**Invariantes**

- **NUNCA** se renderizan los enlaces "Ingresar"/"Registrarme" ni el selector de idioma dentro de
  este layout ni de ninguna página que envuelva (FR-006, FR-007) — no porque se oculten
  condicionalmente, sino porque `<NavBar/>` no forma parte de este árbol de layouts (ver
  `data-model.md > Regla de visibilidad`).
- El comportamiento no depende de si existe una sesión de cliente en paralelo (FR-008).
- Todas las acciones y datos de cada página (crear/editar modelo, gestionar colores/técnicas,
  actualizar estado de solicitudes) siguen funcionando igual que hoy (FR-010).

## Páginas protegidas afectadas (mismo contrato de layout, contenido propio sin cambios funcionales)

| Ruta | Contenido (sin cambios de datos/acciones — solo de presentación) |
|---|---|
| `/{locale}/panel/modelos` | Listado de modelos con estado y stock de componentes, como el mockup ("Base Models") |
| `/{locale}/panel/modelos/nuevo`, `/{locale}/panel/modelos/[id]`, `/componentes`, `/imagenes`, `/tallas`, `/vistas`, `/zonas` | Formularios y editores existentes, reestilizados con el mismo lenguaje visual (FR-003) |
| `/{locale}/panel/colores`, `/{locale}/panel/colores/[id]` | Listado y formulario de colores |
| `/{locale}/panel/tecnicas` | Listado/formulario de técnicas |
| `/{locale}/panel/solicitudes`, `/{locale}/panel/solicitudes/[id]` | Listado y detalle de solicitudes, con su historial de estado |

## Página no afectada: `panel/login`

Fuera del alcance del rediseño visual y de FR-006/FR-007 (FR-009, FR-012). Mantiene su propio
layout con `<NavBar/>`, igual que hoy. No se documenta como parte de este contrato porque su
comportamiento no cambia.

## Fuera de este contrato

- No se documentan contratos de API/base de datos nuevos: no hay endpoints ni tablas nuevas (ver
  `data-model.md`).
- El comportamiento de `getSession()`, `createSession()`, `destroySession()` no cambia; este
  contrato solo fija dónde se renderiza qué, no la lógica de autenticación.
- El comportamiento de `NavBar`, `ControlCuenta` y `SelectorIdioma` en las páginas donde sí
  aparecen (sitio público, login del panel) no cambia — solo cambia dónde se montan.
