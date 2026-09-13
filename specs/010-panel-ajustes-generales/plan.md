# Implementation Plan: Ajustes generales del sitio en el panel administrador

**Branch**: `010-panel-ajustes-generales` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-panel-ajustes-generales/spec.md`

## Summary

Hoy no existe ningún lugar del panel para configurar datos globales del sitio: el nombre
("Brahman Friends") está fijo en los archivos de traducción, no hay logo (solo texto), el header
de la portada tiene un recuadro vacío en el lugar de un futuro banner, no hay metadatos de SEO más
allá de un título fijo, y no hay redes sociales en ningún lado. Esta funcionalidad agrega una
pantalla nueva `/panel/ajustes` donde cualquier persona administradora edita: nombre del sitio
(ES/EN), correo y teléfono de contacto, logotipo, banner del header de la portada, título y
descripción de SEO (ES/EN) con imagen de vista previa, y una lista de enlaces a redes sociales
(de una lista fija de 7 plataformas reconocidas). El enfoque técnico es una tabla nueva de fila
única (`site_settings`) más una tabla de enlaces (`site_social_link`), leídas mediante una consulta
cacheada por request desde los puntos donde hoy hay valores fijos (`NavBar`, `Footer`, `PanelNav`,
`Hero`, metadatos de la portada), y editadas con los mismos patrones ya existentes en el proyecto:
el componente `SubidaArchivo` para las tres imágenes, y el patrón CRUD por-fila que ya usan los
colores de un modelo para las redes sociales.

## Technical Context

**Language/Version**: TypeScript 5.7, Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js, Drizzle ORM 0.45 sobre PostgreSQL (Neon); componentes internos
ya existentes (`SubidaArchivo`, `PanelNav`, `NavBar`, `Footer`, `Hero`); ninguna dependencia nueva
(research.md #6 justifica no agregar una librería de iconos solo para 7 logos de plataforma)

**Storage**: PostgreSQL (Neon) vía Drizzle ORM — dos tablas nuevas: `site_settings` (fila única,
id fijo sembrado por migración) y `site_social_link` (+ enum `social_platform`)

**Testing**: Vitest (`npm run test`) para la validación pura nueva (nombre del sitio requerido en
ambos idiomas, formato de URL de red social), siguiendo el patrón de `tests/design-rules.test.ts`;
verificación primaria manual en el navegador (Principio IV), ver `quickstart.md`

**Target Platform**: Aplicación web — panel administrativo (rutas protegidas) y sitio público

**Project Type**: Aplicación web Next.js de un solo repositorio (frontend + rutas API en el mismo
proyecto)

**Performance Goals**: N/A — una pantalla de panel y una consulta adicional cacheada por request en
la portada; sin metas de carga distintas de las que ya cumple el resto del sitio

**Constraints**: Principio II (bilingüe ES/EN: nombre del sitio y SEO son obligatorios en ambos
idiomas donde aplica, FR-003; logo/banner comparten una sola imagen entre idiomas por decisión
explícita de la clarificación, no por omisión); Principio I (no se agrega ninguna librería nueva —
research.md #1, #6); Principio III (SEO limitado a la página de inicio, redes sociales limitadas a
la lista fija de 7 plataformas — nada más de lo que la spec pide)

**Scale/Scope**: Dos tablas nuevas, una migración, un endpoint de lectura/escritura de la
configuración (`GET`/`PUT /api/panel/ajustes`) y tres endpoints CRUD de redes sociales
(`POST`/`PATCH`/`DELETE`), una pantalla nueva de panel, y cambios puntuales en 5 componentes
existentes (`NavBar`, `Footer`, `PanelNav`, `Hero`, `generateMetadata` de la portada) para leer la
configuración en vez de valores fijos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASA. Dos tablas nuevas están justificadas: no existe hoy ninguna
  representación de configuración global del sitio (research.md #1). Se reutilizan al máximo los
  patrones ya existentes — `SubidaArchivo`/`subirDirecto` para las tres imágenes, el patrón
  CRUD-por-fila de `color` para las redes sociales (research.md #4, #5) — y se rechaza
  explícitamente sumar una librería de iconos de marcas para solo 7 logos fijos (research.md #6).
  No se construye edición parcial (`PATCH`) para los ajustes básicos porque el formulario siempre
  edita el estado completo (research.md #4).
- **II. Idioma y mercado**: PASA. Nombre del sitio y SEO son obligatorios/editables en ambos
  idiomas (FR-003, FR-009); logo, banner e imagen de SEO son una sola imagen compartida por
  decisión explícita de la persona dueña del producto (Clarificación 2026-09-13), no por omisión
  del principio. Ningún texto nuevo queda fijo en el código: los labels del formulario de Ajustes
  van a `messages/es.json` / `messages/en.json` como el resto del panel.
- **III. Cero alcance fantasma**: PASA. Cada tabla/endpoint/componente tocado traza a una FR (ver
  data-model.md y contracts/). SEO queda acotado a la página de inicio (Assumption de la spec, no
  se toca ninguna otra página); redes sociales quedan acotadas a la lista fija de 7 plataformas
  (no se construye un editor de "agregar plataforma nueva").
- **IV. Verificable por una persona no técnica**: PASA. Los 6 escenarios de `quickstart.md` se
  recorren en la app (panel y sitio público, en ambos idiomas) sin leer código ni base de datos.
- **V. Datos del usuario con respeto**: PASA. Correo y teléfono de contacto son datos del propio
  negocio (no de un cliente), publicados a propósito para que clientes lo contacten — no aplica la
  regla de "uso concreto por dato personal solicitado a un cliente". Ningún secreto nuevo: las
  imágenes siguen subiéndose vía R2 con las mismas credenciales ya en variables de entorno.

No hay violaciones que requieran registrarse en "Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/010-panel-ajustes-generales/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── get-ajustes.md
│   ├── put-ajustes.md
│   ├── post-ajustes-redes.md
│   └── patch-delete-ajustes-red.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/db/schema.ts                                # + enum social_platform, + site_settings,
                                                 # + site_social_link, + export SITE_SETTINGS_ID
drizzle/00XX_*.sql                              # Migración: CREATE TABLE site_settings (+ INSERT
                                                 # de la fila sembrada con SITE_SETTINGS_ID),
                                                 # CREATE TABLE site_social_link

lib/ajustes/consultas.ts                        # NUEVO: obtenerAjustesSitio() cacheada (research.md #3)
lib/ajustes/validacion.ts                       # NUEVO: validarAjustesBasicos(...), validarUrlRedSocial(...)
lib/ajustes/iconos-redes.tsx                    # NUEVO: SOCIAL_PLATFORM_ICONS (SVG en línea, research.md #6)

app/api/panel/ajustes/
├── route.ts                                    # NUEVO: GET (contracts/get-ajustes.md),
│                                                # PUT (contracts/put-ajustes.md)
└── redes/
    ├── route.ts                                # NUEVO: POST (contracts/post-ajustes-redes.md)
    └── [id]/route.ts                           # NUEVO: PATCH/DELETE (contracts/patch-delete-ajustes-red.md)

app/[locale]/panel/(protected)/
├── _PanelNav.tsx                                # + entrada "Ajustes" en PANEL_NAV_LINKS (heredada
│                                                 # por _MobilePanelNav.tsx, que la reutiliza); recibe
│                                                 # siteName/logoUrl como props
├── _MobilePanelNav.tsx                          # Recibe siteName/logoUrl como props (ya no
│                                                 # t("common.siteName")) — usa la clave de forma
│                                                 # independiente a _PanelNav.tsx, hallado en análisis
├── layout.tsx                                   # Pasa el nombre del sitio y el logo (de
│                                                 # obtenerAjustesSitio) a PanelNav y MobilePanelNav
│                                                 # en vez de t("common.siteName")
└── ajustes/
    ├── page.tsx                                 # NUEVO: carga obtenerAjustesSitio(), pasa a AjustesForm
    └── _components/
        ├── AjustesForm.tsx                      # NUEVO: formulario completo, PUT al guardar
        └── RedesSociales.tsx                    # NUEVO: lista + alta/edición/baja de site_social_link

app/[locale]/(site)/
├── page.tsx                                     # + generateMetadata (research.md #9); pasa banner
│                                                 # a Hero, redes sociales a Footer
└── layout.tsx                                   # + await obtenerAjustesSitio(), pasa siteName/
                                                  # logoUrl a NavBar como props

app/_components/landing/
├── NavBar.tsx                                   # Recibe siteName/logoUrl como props (ya no
│                                                 # t("common.siteName")); logo si existe, si no el
│                                                 # nombre del sitio
├── Footer.tsx                                   # + fila de iconos de redes sociales (nuevo prop
│                                                 # socialLinks); nombre del sitio como prop
└── Hero.tsx                                     # + prop bannerUrl opcional: si existe, se usa como
                                                 # fondo del recuadro que hoy es un div vacío

app/[locale]/panel/_components/SubidaArchivo.tsx # Sin cambios: se reutiliza tal cual (3 instancias
                                                 # nuevas en AjustesForm: logo, banner, imagen SEO)

messages/es.json, messages/en.json              # + labels de "Ajustes" (nav, formulario, errores);
                                                 # - retira common.siteName (research.md #2)

tests/ajustes-sitio.test.ts                     # NUEVO: validarAjustesBasicos, validarUrlRedSocial
```

**Structure Decision**: Aplicación web Next.js de un solo proyecto (frontend + rutas API en el
mismo repo, sin separación backend/frontend). Se extiende el árbol de archivos ya existente bajo
`app/[locale]/panel/(protected)/` y `app/api/panel/`; la única carpeta de panel nueva es
`app/[locale]/panel/(protected)/ajustes/`, que sigue el mismo patrón de las secciones ya existentes
(`modelos/`, `tecnicas/`, `solicitudes/`). `lib/ajustes/` es nuevo, paralelo a `lib/catalogo/` y
`lib/media/` ya existentes.

## Complexity Tracking

*No aplica: el Constitution Check no tiene violaciones que justificar.*
