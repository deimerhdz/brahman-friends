# Data Model: Rediseño del panel de administración

Esta feature no modifica el esquema de base de datos ni agrega entidades nuevas: es un rediseño
visual sobre datos y acciones que ya existen (`lib/db/schema.ts`). No hay migraciones nuevas.

## Entidades existentes reutilizadas (sin cambios de esquema)

| Entidad | Tabla(s) | Página(s) del panel que la usa |
|---|---|---|
| Modelo de gorra | `capModel`, `capModelTranslation`, `modelView` | Modelos (listado, detalle, componentes, imágenes, tallas, vistas, zonas) |
| Color | `color`, `colorTranslation` | Colores (listado, detalle) |
| Técnica de decoración | `technique`, `techniqueTranslation` | Técnicas |
| Solicitud de cotización | `request`, `requestImage`, `requestSize`, `requestStatusHistory` | Solicitudes (listado, detalle, historial) |
| Sesión de panel | cookie firmada `bf_session` (`lib/auth/session.ts`), payload `{ userId, email, name }` | Determina qué ve la barra lateral (FR-002) y si se ocultan los enlaces públicos (FR-006 a FR-008) |

Ninguna de estas entidades gana, pierde ni renombra campos por esta feature (FR-010).

## Modelo de vista (view model) de la barra lateral del panel

No es una tabla nueva — es la forma en que `_PanelNav.tsx` compone la sesión activa para
presentarla, reemplazando el mockup de referencia (que usa datos de ejemplo ficticios como "Premium
Member / Verified Collector") por datos reales de la sesión.

```text
PanelNavItem {
  href: string          // `/${locale}/panel/{modelos|colores|tecnicas|solicitudes}`
  label: string          // t("nav.models") | t("nav.colors") | t("nav.techniques") | t("nav.requests")
                          // (reutiliza las claves de traducción ya existentes, ver research.md #5)
  icon: string            // nombre de ícono Material Symbols (p. ej. "styler", "palette",
                          // "design_services", "package_2"), sin equivalente en datos — decisión
                          // visual libre dentro del lenguaje del mockup
  active: boolean         // href === pathname actual (resalta la sección, FR-002)
}

PanelSessionSummary {
  name: string             // session.name (SessionPayload.name, ya existente)
  // No hay avatar/foto en SessionPayload; el mockup usa una foto de ejemplo (perfil "Premium
  // Member") que no tiene equivalente real — se sustituye por un ícono/inicial genérico en vez de
  // una imagen inventada.
}
```

## Regla de visibilidad de la barra pública dentro del panel (FR-006 a FR-009)

No es una entidad de datos — es la regla de composición de layouts que determina si `<NavBar/>`
(con `ControlCuenta` y `SelectorIdioma`) llega a renderizarse:

```text
Ruta                          → ¿Se renderiza <NavBar/>?
/{locale}, /{locale}/cuenta/*,
/{locale}/configurador/*,      → Sí (sin cambios), vía app/[locale]/(site)/layout.tsx
/{locale}/politica-privacidad,
/{locale}/solicitud/*

/{locale}/panel/login          → Sí (sin cambios), vía su propio layout.tsx (FR-009, FR-012)

/{locale}/panel/{modelos,      → No (nunca se monta: el layout raíz de [locale] ya no la incluye,
colores,tecnicas,solicitudes}    y este árbol no está dentro de (site) ni tiene su propio NavBar)
```

Esta regla depende únicamente de la ubicación en el árbol de rutas (ver `plan.md > Project
Structure`), no de una condición en tiempo de ejecución sobre la sesión — por eso cumple FR-008
("la sesión de cliente no debe influir en lo que se muestra dentro del panel") de forma directa: la
barra pública ni siquiera existe como opción dentro de `panel/(protected)/`.

## Texto de la interfaz del panel (FR-013)

No es una entidad — es una tabla de decisión sobre qué texto pasa por `messages/*.json` y cuál no,
documentada para que la implementación (tasks) no dude caso por caso:

| Tipo de texto | Tratamiento |
|---|---|
| Ya tiene clave existente (`nav.models`, `panel.modelos.new`, `panel.modelos.status.*`, etc.) | Se reutiliza tal cual vía `t()` — no se toca (research.md #5) |
| Nuevo, introducido por este rediseño (placeholder de búsqueda, "Mostrando X de Y", etiquetas de la barra lateral que no tenían texto visible antes, etc.) | Texto fijo en español en el JSX, sin clave nueva (FR-013) |
| Datos de catálogo que el panel administra y se muestran al cliente (nombres/descripciones de modelos, colores, técnicas) | Sin cambios — siguen usando `capModelTranslation`, `colorTranslation`, `techniqueTranslation` (es/en), fuera del alcance de FR-013 |
