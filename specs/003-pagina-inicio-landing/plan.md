# Implementation Plan: Migración de landing page de referencia a la página de inicio

**Branch**: `003-pagina-inicio-landing` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-pagina-inicio-landing/spec.md`

## Summary

Reemplazar la página de inicio actual (listado simple de texto) por el diseño visual del mockup de
referencia `landing-page/code.html`, reconstruido con componentes de Next.js (App Router) y
Tailwind CSS v4 en vez del Tailwind CDN + config JS del mockup. La barra de navegación conserva las
funciones reales del sitio (inicio, selector de idioma, control de cuenta) con el estilo visual
nuevo, en vez de los enlaces de ejemplo del mockup. La sección "The Collection" sigue alimentándose
de los modelos publicados reales (vista "front" como portada, con marcador neutro si falta). La
imagen del héroe es un marcador de posición visual neutro. Todo el contenido de marketing nuevo se
traduce vía el sistema de traducciones ya existente (`lib/i18n/t.ts` + `messages/es.json` /
`messages/en.json`). El layout se adapta sin overflow horizontal entre 360px y 1920px, con un menú
de navegación móvil desplegable cuando la barra horizontal completa no cabe.

## Technical Context

**Language/Version**: TypeScript 5.7, Next.js 15.5 (App Router, React Server Components), React 19.1

**Primary Dependencies**: Next.js, React, Tailwind CSS v4 (`@tailwindcss/postcss`, tema CSS-first vía
`@theme`), Drizzle ORM (consultas ya existentes `capModelConNombre`, tabla `modelView`), sistema de
traducciones propio (`lib/i18n/t.ts`) — ninguna librería nueva

**Storage**: PostgreSQL (Neon) vía Drizzle — sin cambios de esquema; se reutilizan `capModel`,
`capModelTranslation` y `modelView`

**Testing**: Vitest (entorno `node`, sin DOM) — el proyecto no tiene infraestructura de test de
componentes/UI; las pruebas existentes cubren lógica pura (reglas de diseño, estados, traducciones).
Este feature es mayormente de presentación; se agregan pruebas unitarias solo si surge lógica no
trivial (p. ej. selección de la vista "front" con fallback a marcador de posición)

**Target Platform**: Navegador web, renderizado en servidor (RSC) sobre Vercel; responsive de 360px
a 1920px+

**Project Type**: Aplicación web Next.js de un solo proyecto (sin separación frontend/backend)

**Performance Goals**: Sin metas numéricas nuevas pedidas por la spec; se mantiene el patrón
existente de la portada (`dynamic = "force-dynamic"` porque el catálogo publicado cambia)

**Constraints**: Sin desbordamiento horizontal entre 360px y 1920px (SC-003); fidelidad visual con
el mockup en escritorio ≥1280px (SC-001); imágenes de modelo servidas desde el dominio ya habilitado
en `next.config.ts` (`*.public.blob.vercel-storage.com`)

**Scale/Scope**: Una página de inicio (`/[locale]`), un layout compartido (`/[locale]/layout.tsx`)
con la nueva barra de navegación, y un puñado de componentes de presentación nuevos bajo
`app/_components/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASS. No se agrega ninguna librería nueva (ni de iconos, ni de
  fuentes, ni de UI): los símbolos Material se cargan como en el mockup (fuente de íconos vía
  `<link>`, ligaduras de texto), las fuentes Google vía `<link>`, y el menú móvil es un componente
  cliente pequeño con `useState`, sin librería de UI. Se reutilizan `ControlCuenta` y
  `SelectorIdioma` tal cual existen.
- **II. Idioma y mercado**: PASS (con acción). Todo el contenido de marketing nuevo (héroe,
  colección, B2B, proceso, pie de página, etiqueta del menú móvil) se agrega como claves nuevas en
  `messages/es.json` y `messages/en.json`; ningún texto queda fijo en el código. No hay precios en
  esta feature (regla de moneda no aplica).
- **III. Cero alcance fantasma**: PASS. No se construye ruta genérica de configurador ni flujo de
  contacto B2B: los botones correspondientes quedan visuales sin navegación funcional, como decidió
  la clarificación de la spec (FR-008). No se crea página de catálogo separada.
- **IV. Verificable por una persona no técnica**: PASS. Los criterios de éxito (SC-001 a SC-004) ya
  se verifican abriendo el sitio y comparando visualmente / cambiando el ancho de ventana, sin leer
  código.
- **V. Datos del usuario con respeto**: PASS. No se piden datos nuevos; no se usan URLs de imágenes
  de terceros del mockup (se reemplazan por marcador neutro o por las fotos ya subidas del propio
  catálogo).

Sin violaciones. No se requiere la tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-pagina-inicio-landing/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md        # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   └── pagina-inicio.md
└── tasks.md              # Fase 2 (/speckit-tasks — no se genera acá)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                     # Root layout: se agregan <link> de Google Fonts / Material Symbols
├── globals.css                    # Se amplía el bloque @theme con los tokens de color/tipografía/
│                                   # espaciado/radios que hoy vienen del tailwind.config.js del mockup
├── [locale]/
│   ├── layout.tsx                 # Nueva barra de navegación (visual del mockup) reutilizando
│   │                               # ControlCuenta y SelectorIdioma; agrega el toggle de menú móvil
│   └── page.tsx                   # Reescrita: secciones héroe, colección, B2B, proceso, footer
└── _components/
    ├── ControlCuenta.tsx           # Sin cambios de comportamiento (se reestiliza vía props/clases)
    ├── SelectorIdioma.tsx          # Sin cambios de comportamiento
    ├── landing/
    │   ├── NavBar.tsx              # Barra de navegación fija + botón de menú móvil
    │   ├── MobileNavPanel.tsx      # Panel desplegable cliente (useState) con las mismas opciones
    │   ├── Hero.tsx                # Sección héroe con marcador de posición de imagen
    │   ├── Collection.tsx          # Grid de tarjetas de modelos publicados (vista "front")
    │   ├── B2BSection.tsx          # Sección de servicios B2B
    │   ├── ProcessSection.tsx      # Sección "The Process"
    │   └── Footer.tsx              # Pie de página

lib/
└── catalogo/
    └── consultas-traducidas.ts    # Se agrega una consulta (o se extiende una existente) para traer
                                    # la vista "front" de cada modelo publicado junto a su nombre

messages/
├── es.json                        # Nuevas claves bajo "landing.*" y "nav.*" (menú móvil)
└── en.json                        # Mismas claves en inglés
```

**Structure Decision**: Proyecto único de Next.js (App Router), sin separación frontend/backend.
Los componentes nuevos de presentación viven en `app/_components/landing/` junto a los componentes
compartidos existentes (`app/_components/`), siguiendo la convención ya usada en el repo. No se crea
ningún paquete, servicio ni carpeta de nivel superior nueva.

## Complexity Tracking

*Sin violaciones de la constitution — tabla no aplica.*
