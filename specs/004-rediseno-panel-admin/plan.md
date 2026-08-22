# Implementation Plan: Rediseño del panel de administración

**Branch**: `004-rediseno-panel-admin` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-rediseno-panel-admin/spec.md`

## Summary

Rediseñar visualmente las páginas protegidas del panel administrativo (Modelos, Colores, Técnicas,
Solicitudes y sus subpáginas) usando el lenguaje visual del mockup `dashboard/code.html` (barra
lateral con marca e iconos, encabezado de página, tablas/tarjetas con bordes suaves, sombra e
insignias de estado), reutilizando el sistema de diseño "Atelier Precise" que el proyecto ya definió
en `app/globals.css` para la página de inicio. La barra lateral colapsa a un menú móvil por debajo de
1024px. La causa raíz de que el panel muestre hoy los enlaces "Ingresar"/"Registrarme" y el selector
de idioma es que la barra pública (`NavBar`) se renderiza sin condición en `app/[locale]/layout.tsx`,
que envuelve también las rutas del panel: se corrige moviendo `NavBar` a un nuevo grupo de rutas
`(site)` que envuelve solo las páginas públicas existentes, dejando el panel (login y protegido) fuera
de ese árbol — el login del panel conserva su propio layout con `NavBar` para no cambiar su
comportamiento actual (FR-009, FR-012). Como excepción documentada y aceptada en la clarificación de
la spec, la interfaz propia del panel (no los datos de catálogo) puede fijarse en español sin pasar
por el sistema de traducciones (FR-013); esto se registra como desviación del Principio II en
Complexity Tracking.

## Technical Context

**Language/Version**: TypeScript 5.7, Next.js 15.5.23 (App Router, React Server Components), React
19.1.0

**Primary Dependencies**: Next.js, React, Tailwind CSS v4 (`@tailwindcss/postcss`, tema CSS-first vía
`@theme` en `app/globals.css`, ya extendido con los tokens de color/tipografía/espaciado "Atelier
Precise" para la página de inicio), Drizzle ORM (consultas ya existentes de modelos/colores/
técnicas/solicitudes), sistema de traducciones propio (`lib/i18n/t.ts`), sesión de panel propia
(`lib/auth/session.ts`) — ninguna librería nueva. Los íconos (Material Symbols Outlined) y fuentes
(Inter, JetBrains Mono) que usa el mockup ya se cargan globalmente en `app/layout.tsx`.

**Storage**: PostgreSQL (Neon) vía Drizzle — sin cambios de esquema; se reutilizan `capModel`,
`color`, `technique`, `request` y sus tablas relacionadas

**Testing**: Vitest (entorno `node`, sin DOM) — el proyecto no tiene infraestructura de test de
componentes/UI; este feature es de presentación, no se agregan pruebas de componente nuevas

**Target Platform**: Navegador web, renderizado en servidor (RSC) sobre Vercel; responsive de 360px a
1920px, con el punto de quiebre de la barra lateral del panel en 1024px (igual que el mockup)

**Project Type**: Aplicación web Next.js de un solo proyecto (sin separación frontend/backend)

**Performance Goals**: Sin metas numéricas nuevas pedidas por la spec

**Constraints**: Sin desbordamiento horizontal entre 360px y 1920px en ninguna página protegida del
panel (SC-002); fidelidad visual con el mockup en escritorio ≥1280px (SC-001); los enlaces
"Ingresar"/"Registrarme" y el selector de idioma no deben renderizarse en ninguna página protegida
del panel mientras haya sesión de panel activa (FR-006 a FR-008); la página de login del panel no
cambia (FR-009, FR-012)

**Scale/Scope**: Todas las páginas protegidas del panel (Modelos, Colores, Técnicas, Solicitudes y
sus subpáginas de detalle/formulario) más la reestructuración de layouts necesaria para que la barra
pública deje de renderizarse dentro del panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASS. No se agrega ninguna librería nueva (íconos, fuentes, UI): se
  reutilizan Material Symbols Outlined y las fuentes ya cargadas globalmente. Para separar la barra
  pública del panel se reutiliza el mismo mecanismo que el proyecto ya usa (`route groups` de Next.js,
  como en `panel/(protected)`) en vez de inventar una detección de ruta en middleware. Se extiende
  `@theme` en `app/globals.css` (mecanismo ya establecido para tokens de diseño) en vez de reintroducir
  `tailwind.config.js`.
- **II. Idioma y mercado**: DEVIATION documentada. La constitution exige que todo texto visible exista
  en inglés y español, también para el equipo interno. Esta feature introduce una excepción explícita,
  decidida por el dueño del producto en la sesión de `/speckit-clarify` del 2026-08-22 (ver
  spec.md > Clarifications y > Assumptions, FR-013): los textos propios de la interfaz del panel
  (no los datos de catálogo que administra) pueden fijarse en español sin sistema de traducciones. Ver
  Complexity Tracking. No hay precios en esta feature (regla de moneda no aplica).
- **III. Cero alcance fantasma**: PASS. No se agrega, quita ni modifica ninguna funcionalidad de
  negocio (FR-010): mismas acciones de crear/editar modelo, colores, técnicas y solicitudes que hoy.
  Los enlaces decorativos del mockup que no corresponden a secciones reales (Dashboard, Catalog,
  Settings, botón "New Design", perfil "Premium Member") no se construyen (FR-002).
- **IV. Verificable por una persona no técnica**: PASS. Los criterios SC-001 a SC-005 se verifican
  abriendo el panel, iniciando sesión y comparando visualmente / cambiando el ancho de ventana, sin
  leer código.
- **V. Datos del usuario con respeto**: PASS. No se piden datos nuevos al administrador ni al cliente;
  no se agregan secretos ni claves nuevas al repositorio.

Una violación (Principio II) queda documentada en Complexity Tracking, aceptada explícitamente por el
dueño del producto durante la clarificación de la spec.

## Project Structure

### Documentation (this feature)

```text
specs/004-rediseno-panel-admin/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md        # Fase 1 (/speckit-plan)
├── quickstart.md        # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   └── panel-administrativo.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Fase 2 (/speckit-tasks — no se genera acá)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                          # Sin cambios: ya carga Material Symbols Outlined, Inter y
│                                        # JetBrains Mono globalmente (usados por el mockup)
├── globals.css                         # Se agregan tokens --radius-* (DEFAULT/lg/xl/full) del
│                                        # diseño de referencia al bloque @theme ya existente
├── [locale]/
│   ├── layout.tsx                      # Se simplifica: ya no renderiza <NavBar/>, solo
│   │                                    # <SetHtmlLang/> + {children}; deja de envolver todo el
│   │                                    # árbol de rutas con la barra pública
│   ├── (site)/                         # NUEVO grupo de rutas: agrupa las páginas públicas
│   │   │                               # existentes bajo un layout con <NavBar/> (movida desde el
│   │   │                               # layout raíz, sin cambios de comportamiento)
│   │   ├── layout.tsx                  # NUEVO: <NavBar/> + <main className="pt-20">{children}</main>
│   │   ├── page.tsx                    # Movido tal cual desde app/[locale]/page.tsx
│   │   ├── cuenta/                     # Movido tal cual
│   │   ├── configurador/               # Movido tal cual
│   │   ├── politica-privacidad/        # Movido tal cual
│   │   └── solicitud/                  # Movido tal cual
│   └── panel/
│       ├── login/
│       │   ├── layout.tsx              # NUEVO: <NavBar/> + <main className="pt-20">{children}</main>
│       │   │                           # (preserva la apariencia y el comportamiento actuales del
│       │   │                           # login — FR-009, FR-012 — que no se tocan en esta feature)
│       │   ├── page.tsx                # Sin cambios
│       │   └── _LoginForm.tsx          # Sin cambios
│       └── (protected)/
│           ├── layout.tsx              # Rediseñado: barra lateral fija en escritorio (≥1024px),
│           │                           # menú colapsado en móvil/tablet (<1024px); ya no depende de
│           │                           # que NavBar no aparezca (nunca llega, ver arriba)
│           ├── _PanelNav.tsx           # Rediseñado: iconos Material Symbols, sección activa
│           │                           # resaltada, sección de perfil con el nombre real de sesión
│           ├── _PanelHeader.tsx        # NUEVO: encabezado de página (título + acción principal),
│           │                           # reutilizado por cada página protegida
│           ├── _MobilePanelNav.tsx     # NUEVO (client component): panel de navegación colapsado
│           │                           # <1024px, mismo patrón que MobileNavPanel del sitio público
│           ├── modelos/{page.tsx,nuevo/,[id]/...}     # Reestilizados (tabla/tarjetas del mockup),
│           ├── colores/{page.tsx,[id]/...}            # sin cambios de datos ni de acciones
│           ├── tecnicas/{page.tsx,_TecnicasForm.tsx}  # existentes (FR-010)
│           └── solicitudes/{page.tsx,[id]/...}
│
app/_components/landing/
└── NavBar.tsx                          # Sin cambios de comportamiento (solo cambia dónde se monta)
```

**Structure Decision**: proyecto único de Next.js (App Router). Se reutiliza el mecanismo de route
groups que el proyecto ya usa (`panel/(protected)`) para separar la barra pública del panel: `NavBar`
se mueve del layout raíz de `[locale]` a un nuevo grupo `(site)` que envuelve solo las páginas
públicas ya existentes; el panel (login y protegido) queda fuera de ese árbol de layouts. No se crea
ningún paquete, servicio ni carpeta de nivel superior nuevo; los componentes nuevos del panel viven
junto a los que ya existen en `app/[locale]/panel/(protected)/`, siguiendo la convención del repo.

## Complexity Tracking

> Violación aceptada y documentada — no bloquea la implementación, pero queda registrada para
> trazabilidad futura.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Principio II ("Idioma y mercado"): la interfaz propia del panel administrativo (no el catálogo que administra) se fija en español sin pasar por el sistema de traducciones (FR-013, spec.md > Clarifications) | El panel es de uso exclusivo del equipo interno hispanohablante; el usuario pidió explícitamente ocultar el selector de idioma al iniciar sesión, y en la clarificación del 2026-08-22 escogió esta opción en vez de mantener el panel bilingüe sin selector visible | La alternativa más simple y sin violar la constitution — mantener el panel bilingüe (rutas `/es/panel` y `/en/panel` funcionando igual, solo ocultando el control del selector) — fue la opción recomendada durante `/speckit-clarify`, pero el dueño del producto la rechazó explícitamente a favor de esta excepción. Queda documentada aquí y en `spec.md > Assumptions`; se recomienda evaluar `/speckit-constitution` más adelante si esta excepción debe formalizarse o revertirse. |
