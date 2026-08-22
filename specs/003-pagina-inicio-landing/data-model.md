# Data Model: Migración de landing page de referencia a la página de inicio

Esta feature no modifica el esquema de base de datos: reutiliza `capModel`, `capModelTranslation` y
`modelView`, ya existentes (`lib/db/schema.ts`). No hay migraciones nuevas.

## Entidades existentes reutilizadas

### Modelo de gorra publicado (`capModel` + `capModelTranslation`)

Ya consultado hoy por `capModelConNombre()` (`lib/catalogo/consultas-traducidas.ts`). Campos
relevantes para esta feature:

| Campo | Origen | Uso en la landing |
|---|---|---|
| `id` | `capModel.id` | Enlace de la tarjeta a `/${locale}/configurador/${id}` |
| `status` | `capModel.status` | Filtro `= "published"` (ya usado en `page.tsx` actual) |
| `publishedAt` | `capModel.publishedAt` | Orden `desc` (ya usado en `page.tsx` actual) |
| `nameEs` / `nameEn` | `capModelTranslation` | Título de la tarjeta según `locale` |
| `descriptionEs` / `descriptionEn` | `capModelTranslation` | Subtítulo/descr. corta de la tarjeta |

### Vista frontal del modelo (`modelView`)

| Campo | Origen | Uso en la landing |
|---|---|---|
| `modelId` | `modelView.modelId` | Relación 1 a 1 con el modelo para `view = 'front'` |
| `view` | `modelView.view` (`enum`: front/side/back) | Filtro `= 'front'` (decisión de la clarificación) |
| `baseImageUrl` | `modelView.baseImageUrl` (`text`, nullable) | URL de portada de la tarjeta; si es `null`, no hay imagen cargada aún |

**Regla de presentación** (deriva de FR-009 / FR-010, no es una regla de negocio nueva sobre los
datos): si `baseImageUrl` es `null` para la vista `front` del modelo, la tarjeta muestra un fondo
neutro de marcador de posición en vez de romper el layout o mostrar un `<img>` roto.

## Modelo de vista (view model) para la sección "The Collection"

No es una tabla nueva — es la forma en que la consulta de la página compone los datos existentes
para la sección; se documenta para dejar claro el contrato entre la capa de datos y los componentes
de presentación (`app/_components/landing/Collection.tsx`).

```text
TarjetaModelo {
  id: string                 // capModel.id
  name: string                // nameEs | nameEn según el locale de la request
  description: string         // descriptionEs | descriptionEn según el locale
  frontImageUrl: string | null // modelView.baseImageUrl para view='front'; null si no está cargada
  href: string                 // `/${locale}/configurador/${id}`
}
```

**Regla de vacío** (FR-010): si la lista de modelos publicados está vacía, `Collection.tsx` no
recibe ninguna `TarjetaModelo` y renderiza el estado vacío existente (`t("home.empty")`), en vez de
tarjetas inventadas.

## Contenido de marketing (claves de traducción nuevas)

No es una entidad de base de datos: son claves nuevas en `messages/es.json` y `messages/en.json`,
paralelas entre sí (FR-005). Se agrupan bajo un namespace `landing` nuevo, más una clave nueva en
`nav` para la etiqueta del botón de menú móvil.

| Clave | Contenido (según sección del mockup) |
|---|---|
| `nav.openMenu` / `nav.closeMenu` | Etiqueta accesible del botón de menú móvil (abrir/cerrar) |
| `landing.hero.title` | "Architectural Precision." (título del héroe) |
| `landing.hero.subtitle` | Descripción del héroe |
| `landing.hero.ctaPrimary` | "Start Designing" |
| `landing.hero.ctaSecondary` | "View Collections" |
| `landing.hero.dragToRotate` | Etiqueta "DRAG TO ROTATE" del marcador de imagen |
| `landing.collection.eyebrow` | "SILHOUETTES" |
| `landing.collection.title` | "The Collection" |
| `landing.collection.exploreAll` | "Explore All" |
| `landing.collection.priceFrom` | Patrón "From {{price}}" — **fuera de alcance**: esta feature no
  agrega precios (Principio II: la v1 no muestra precios); si el mockup mostraba un precio de
  ejemplo, la tarjeta real omite ese dato en vez de inventar uno |
| `landing.b2b.eyebrow` | "ENTERPRISE" |
| `landing.b2b.title` | "B2B Services & Bulk Orders" |
| `landing.b2b.description` | Párrafo descriptivo |
| `landing.b2b.feature1Title` / `landing.b2b.feature1Body` | "Minimum Order Quantity…" |
| `landing.b2b.feature2Title` / `landing.b2b.feature2Body` | "Wholesale Tier Pricing…" |
| `landing.b2b.cta` | "Inquire for Wholesale" |
| `landing.b2b.embroideryLabel` / `landing.b2b.embroideryBody` | Recuadro "PRECISION EMBROIDERY" |
| `landing.process.eyebrow` | "METHODOLOGY" |
| `landing.process.title` | "The Process" |
| `landing.process.description` | Párrafo descriptivo |
| `landing.process.step1Title` / `landing.process.step1Body` | "Select Base…" |
| `landing.process.step2Title` / `landing.process.step2Body` | "Configure 3D…" |
| `landing.process.step3Title` / `landing.process.step3Body` | "Precision Build…" |
| `landing.process.cta` | "Launch Configurator" |
| `landing.footer.support` / `.trackOrder` / `.b2bBulk` / `.sustainability` / `.terms` | Enlaces del pie |
| `landing.footer.copyright` | Línea de derechos — usa `common.siteName`, no un nombre fijo nuevo |

**Nota sobre `priceFrom`**: se documenta acá para que quede explícito que el mockup de referencia
incluye precios de ejemplo ("From $32") que esta feature **no** replica, porque la constitution
(Principio II, "Alcance del Producto v1") prohíbe mostrar precios en la v1. Las tarjetas de
"The Collection" muestran nombre y descripción, sin precio.
