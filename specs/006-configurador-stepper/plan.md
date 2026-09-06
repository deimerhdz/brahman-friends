# Implementation Plan: Configurador en pasos

**Branch**: `006-configurador-stepper` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-configurador-stepper/spec.md`

## Summary

Rediseñar la página del configurador (`001-configurador-gorras`) como un flujo guiado de tres
pasos —colores, logo, resumen— siguiendo la estética del mockup `detail-product/code.html`, y
agregar una cantidad mínima de pedido (MOQ) por modelo. El punto de salida del último paso reutiliza
sin cambios el flujo de solicitud de cotización ya construido.

**Enfoque técnico en una frase**: es un feature de presentación, no un motor nuevo. El sistema de
diseño del mockup ya está instalado en `app/globals.css` (research.md#1); el motor de render por
capas, de decoración y de solicitud de `001-configurador-gorras` no se toca (research.md#5); lo
único que se construye es el contenedor de pasos y una columna nueva en `cap_model` (Enmienda
2026-09-06 (3) de spec.md: el catálogo de telas que este plan incluía se construyó y luego se
eliminó por completo).

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS (sin cambios respecto a
`001-configurador-gorras`).

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Tailwind CSS v4 (tokens "Atelier
Precise" ya cargados en `app/globals.css`, research.md#1), Drizzle ORM, `@aws-sdk/client-s3` (subida
a Cloudflare R2, ya integrada vía `SubidaArchivo.tsx`). **Ninguna dependencia nueva**
(research.md#Justificación de dependencias).

**Storage**: mismo Postgres gestionado (Neon) y mismo bucket de Cloudflare R2 ya en uso. Se agrega
una columna (`cap_model.moq`) — ver [data-model.md](./data-model.md).

**Testing**: Vitest para las dos reglas puras nuevas (`puedeAvanzarPaso`, `moqEfectivo`,
research.md#6), junto a las que ya existen en `tests/`. Todo lo demás —estética del stepper,
navegación hacia la solicitud— se verifica recorriendo la app según
[quickstart.md](./quickstart.md) (Principio IV).

**Target Platform**: mismo navegador móvil moderno desde 360px de ancho para el cliente; mismo
panel de escritorio para el administrador. Sin cambios.

**Project Type**: misma aplicación web única (cliente + panel + API en un solo despliegue).

**Performance Goals**: hereda el objetivo ya cumplido de `001-configurador-gorras` (gorra
interactiva en ≤5s sobre 4G); este feature no lo modifica porque reutiliza el mismo motor de
imágenes.

**Constraints**:

- Bilingüe español/inglés en todo el contenido nuevo, sin texto fijo en el código (Principio II);
  toda clave nueva entra en `messages/es.json` **y** `messages/en.json`, verificado por la prueba de
  paridad ya existente en `tests/traducciones.test.ts`.
- Ningún paso del configurador muestra precio (FR-020, spec Clarifications).
- Sin secretos nuevos en el repositorio (Principio V); no hace falta ninguna variable de entorno
  nueva.

**Scale/Scope**: reutiliza la misma infraestructura ya existente para colores e imágenes por modelo
en `001-configurador-gorras`. Alcance de pantallas: 1 pantalla del cliente reestructurada
(configurador) + 1 pantalla existente con un cambio menor (solicitud) + 1 campo nuevo en una
pantalla existente del panel (MOQ en el formulario del modelo).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v2.0.0.

### I. Simplicidad ante todo — PASA

| Regla | Cómo se cumple |
|-------|-----------------|
| Toda dependencia nueva se justifica por escrito | No hay ninguna dependencia nueva (research.md#Justificación de dependencias). |
| Sin abstracciones para casos que la spec no pide | El stepper es un componente puntual de este configurador, no una librería de wizard reutilizable. |
| Los límites conocidos se documentan y se avanza | La cantidad sugerida viaja por parámetro de URL en vez de por un mecanismo de estado compartido nuevo (research.md#4); si en el futuro hace falta pasar más datos entre configurador y solicitud, se revisa entonces. |

### II. Idioma y mercado — PASA

- Toda etiqueta nueva de UI (pasos del stepper) sale de `messages/es.json` /
  `messages/en.json`; la prueba de paridad ya existente cubre las claves nuevas sin cambios.
- **Moneda: sigue sin aplicar.** FR-020 refuerza explícitamente que este feature no muestra precio.

### III. Cero alcance fantasma — PASA

Cada requisito de la spec queda trazado a una tabla, campo o ruta concreta en
[data-model.md](./data-model.md#trazabilidad-requisito--tablacampo) y
[contracts/api.md](./contracts/api.md). No se planifica: cálculo de precio, fusión del catálogo de
modelos dentro del stepper, ni cambios al motor de composición de imágenes, zonas, técnicas o envío
de solicitud — todos explícitamente fuera de alcance en la spec.

### IV. Verificable por una persona no técnica — PASA

[quickstart.md](./quickstart.md) cubre los escenarios de aceptación de las tres historias de
usuario más los casos límite, todos como recorridos observables (qué hace la persona, qué ve).
Ningún paso exige mirar código, base de datos ni registros.

### V. Datos del usuario con respeto — PASA

- No se pide ningún dato personal nuevo. El MOQ es un atributo del catálogo, no del cliente.
- No se agrega ninguna cuenta ni login nuevo: el panel usa la misma sesión de administrador
  ya exigida por `001-configurador-gorras` FR-057.
- Sin variables de entorno ni secretos nuevos.

**Resultado del gate inicial: PASA.** Sin violaciones que justificar.

**Re-evaluación tras el diseño de Fase 1: PASA.** El diseño de datos (una columna nueva en
`cap_model`) no introdujo ninguna pieza que requiera justificación en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-configurador-stepper/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── api.md            # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

Aplicación única existente (`001-configurador-gorras`), extendida en los mismos directorios:

```text
lib/
├── db/
│   └── schema.ts                         # + cap_model.moq
├── catalogo/
│   └── model-manifest.ts                 # loadModelManifest() + moq
└── design/
    └── rules.ts                          # + puedeAvanzarPaso(), + moqEfectivo()

drizzle/
└── 0003_<nombre-generado>.sql            # migración: columna moq

app/[locale]/(site)/
├── configurador/[modelId]/_components/
│   ├── ConfiguradorApp.tsx               # reestructurado: orquesta el stepper de 3 pasos
│   ├── Stepper.tsx                       # nuevo — indicador de pasos, navegación, gating (FR-013 a FR-018)
│   ├── PasoColores.tsx                   # nuevo — envuelve SelectorColor.tsx existente, una paleta por componente
│   ├── PasoLogo.tsx                      # nuevo — envuelve PanelDecoracion.tsx + SelectorTecnica.tsx + atajos de posición
│   └── PasoResumen.tsx                   # nuevo — resumen + cantidad/MOQ + botón "Solicitar cotización" (FR-019 a FR-022)
└── solicitud/_components/
    └── SolicitudApp.tsx                  # + lectura de ?qty= como cantidad inicial (FR-021)

app/[locale]/panel/(protected)/
└── modelos/
    └── _ModeloForm.tsx                   # + campo MOQ

app/api/panel/
└── modelos/[id]/
    └── route.ts                          # PATCH existente + campo moq

messages/
├── es.json                               # + configurador.step.*
└── en.json                               # ídem

tests/
└── design-rules.test.ts                  # + casos de puedeAvanzarPaso, moqEfectivo
```

**Structure Decision**: una sola aplicación Next.js (App Router), sin proyectos nuevos ni límites de
paquete adicionales. Cada pieza nueva se ubica junto a los componentes que ya orquesta
`ConfiguradorApp.tsx`, siguiendo el mismo criterio de organización que `001-configurador-gorras` ya
estableció.

## Complexity Tracking

*Sin violaciones que justificar — el gate de Constitution Check pasó sin excepciones.*
