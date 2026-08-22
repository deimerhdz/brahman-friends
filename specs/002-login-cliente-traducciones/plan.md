# Implementation Plan: Login de cliente y traducciones por tabla independiente

**Branch**: `002-login-cliente-traducciones` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-login-cliente-traducciones/spec.md`

## Summary

Dos historias independientes que comparten fecha de entrega pero no código: (1) un cliente puede
registrarse e iniciar sesión desde cualquier página del sitio, con una cuenta separada de la del
equipo administrativo; (2) las cuatro entidades del catálogo que hoy guardan `name_es`/`name_en`
(y `description_es`/`description_en` en el modelo) como columnas paralelas pasan a guardar cada
idioma como una fila independiente en una tabla hija propia de esa entidad, y los formularios del
panel muestran un solo campo por atributo con un switch ES/EN en vez de dos campos fijos.

**Enfoque técnico en una frase**: no se agrega ninguna dependencia nueva; ambas historias
reutilizan patrones que ya existen en el proyecto (cookie firmada con `node:crypto`, tablas hijas
con clave compuesta como `model_view`, lector de traducciones de `lib/i18n/t.ts`) aplicados a un
caso nuevo.

Las decisiones que gobiernan todo lo demás:

1. **La sesión de cliente es un módulo separado de la sesión del panel**, no una generalización de
   la que ya existe. FR-009 exige que las dos cuentas no se mezclen; dos módulos pequeños e
   independientes cumplen eso mejor que uno solo con una rama por rol.
2. **El bloqueo por intentos fallidos vive en la propia fila del cliente** (un contador y una
   marca de tiempo), no en un servicio de límite de tasa aparte. No hay infraestructura nueva que
   justificar.
3. **Cada entidad traducible obtiene su propia tabla hija** (`cap_model_translation`,
   `color_translation`, `component_translation`, `technique_translation`), con clave compuesta
   (id de la entidad, idioma) — el mismo patrón que ya usa `model_view`. Se descarta una tabla
   genérica de traducciones para todas las entidades, tal como pidió el usuario explícitamente.
4. **El formulario sigue enviando ambos idiomas juntos al guardar**, igual que hoy. El switch solo
   cambia qué campo se ve; no dispara una petición al servidor por cada cambio de idioma.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS (igual que el resto del proyecto).

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Drizzle ORM. **Ninguna dependencia
nueva** (ver [research.md](./research.md#justificación-de-dependencias-principio-i)): la sesión de
cliente reutiliza `scryptSync`/`timingSafeEqual` de `node:crypto` (mismo patrón que
`lib/auth/password.ts` y `lib/auth/session.ts`); el switch ES/EN es estado de React local, sin
librería de formularios.

**Storage**: Postgres gestionado (Neon), mismo que el resto del proyecto. Se agrega la tabla
`customer` y cuatro tablas de traducción; se eliminan ocho columnas (`name_es`/`name_en` en color,
componente y técnica; esas dos más `description_es`/`description_en` en modelo).

**Testing**: Vitest sobre reglas puras nuevas (umbral y expiración del bloqueo por intentos
fallidos, validación de que ambos idiomas estén presentes antes de guardar una traducción). El
resto se verifica recorriendo la aplicación según [quickstart.md](./quickstart.md) (Principio IV).

**Target Platform**: mismo navegador móvil/escritorio que el resto del sitio; el control de cuenta
vive en el encabezado compartido de `app/[locale]/layout.tsx`, así que aparece en todas las
pantallas, panel incluido (donde debe seguir mostrando la sesión del panel, no la de cliente).

**Project Type**: mismo proyecto web único (cliente + panel + API en un solo despliegue).

**Performance Goals**: sin metas nuevas de rendimiento; login y registro responden en menos de 1 s
percibido, igual que el login del panel hoy.

**Constraints**:

- Bilingüe español/inglés en toda pantalla nueva, sin texto fijo en el código (Principio II).
- Contraseñas de cliente nunca en texto plano, mismo mecanismo que ya usa el panel (Principio V).
- Cuentas de cliente y de panel estrictamente separadas (FR-009): ni tabla, ni cookie, ni sesión
  compartidas.
- La migración de columnas a tablas de traducción no puede perder ni alterar contenido existente
  (FR-018): un solo archivo de migración que copia todo antes de borrar cualquier columna — el
  driver `neon-http` del proyecto no soporta transacciones, así que el orden de las sentencias es
  lo que hace segura la migración, no una transacción de base de datos (ver research.md#10).
- No se agregan pantallas de edición donde hoy no existen (por ejemplo, renombrar un modelo o una
  técnica después de creados sigue sin tener pantalla): eso sería alcance no pedido
  (Principio III). Ver [Trazabilidad](#trazabilidad-código--requisito).

**Scale/Scope**: negocio pequeño (mismo contexto que 001-configurador-gorras); se esperan decenas
de cuentas de cliente para empezar. Las cuatro entidades traducidas hoy tienen, en conjunto, un
puñado de filas cada una (modelos, colores, componentes, técnicas de un catálogo pequeño); migrar
duplica esas filas (una por idioma) sin acercarse a un volumen que necesite índices adicionales.

**Límite conocido y aceptado (Principio I)**: el bloqueo por intentos fallidos es por cuenta, no
por IP. Sin un almacén compartido entre invocaciones sin servidor, limitar por IP exigiría un
servicio nuevo (p. ej. Redis) que ningún requisito justifica todavía; si el abuso por IP se vuelve
un problema real, se añade entonces.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v2.0.0.

### I. Simplicidad ante todo — PASA

| Regla | Cómo se cumple |
|-------|----------------|
| Toda dependencia nueva se justifica por escrito | No hay dependencias nuevas que justificar (tabla vacía a propósito en [research.md](./research.md#justificación-de-dependencias-principio-i)). |
| Sin abstracciones para casos que la spec no pide | Dos módulos de sesión pequeños en vez de uno genérico parametrizado (decisión 1). Cuatro tablas de traducción concretas en vez de una tabla genérica `entity_type` + `entity_id` (decisión 3). |
| Los límites conocidos se documentan y se avanza | Bloqueo por cuenta, no por IP (arriba). Sin pantallas de edición nuevas donde hoy no existen. |

### II. Idioma y mercado — PASA

- Las pantallas nuevas (registro, login de cliente) usan `messages/es.json` / `messages/en.json`
  igual que el resto del sitio; la prueba existente `tests/traducciones.test.ts` sigue exigiendo
  que ambos archivos tengan las mismas claves, así que una traducción faltante rompe la prueba
  antes de llegar a producción.
- El switch ES/EN de los formularios administrativos no reemplaza el selector de idioma del sitio
  (que sigue controlando en qué idioma ve el administrador la interfaz); es un control aparte para
  elegir qué traducción del dato se está editando.
- **Moneda: no aplica**, sin cambios respecto a 001.

### III. Cero alcance fantasma — PASA, con límites explícitos

No se planifica: recuperación de contraseña, verificación de correo, vínculo entre la cuenta de
cliente y el flujo de solicitud de cotización (cerrado en `/speckit-clarify`), pantalla
administrativa para gestionar cuentas de cliente, ni pantallas de edición de nombre/descripción
donde hoy no existen (modelo, componente, técnica solo tienen alta; ver
[Trazabilidad](#trazabilidad-código--requisito)).

### IV. Verificable por una persona no técnica — PASA

[quickstart.md](./quickstart.md) cubre las dos historias con recorridos: qué hace la persona, qué
ve en pantalla. Ningún criterio de éxito exige mirar código, base de datos ni registros.

### V. Datos del usuario con respeto — PASA

- Solo se piden nombre, correo y contraseña para la cuenta de cliente (FR-002), cada uno con su
  uso escrito en la spec: identificar al visitante, nada más.
- Contraseñas con el mismo `scrypt` que ya usa el panel; nunca en claro.
- Sin secretos nuevos: la firma de la cookie de cliente reutiliza `SESSION_SECRET`, que ya vive en
  variables de entorno.
- Sin datos de pago: no aplica a esta funcionalidad.

**Resultado del gate inicial: PASA.** Sin violaciones de los cinco principios que justificar.

**Re-evaluación tras el diseño de Fase 1: PASA.** El diseño de datos ([data-model.md](./data-model.md))
no introdujo ninguna pieza adicional a las ya previstas aquí.

### Cómo esta spec satisface el Alcance del Producto (v1)

La sección "Alcance del Producto (v1)" de la constitution dice hoy: *"Todo lo demás (por ejemplo
pago en línea, **cuentas de cliente**, visualización en 3D, programas de fidelidad) queda fuera
hasta que exista una spec aprobada que lo incluya."* Esto no es una excepción a uno de los cinco
Principios numerados (que exigiría el mecanismo de excepción con motivo y fecha de revisión del
Governance/Cumplimiento) — es una sección de alcance con su propia cláusula de salida, que esta
spec satisface directamente.

**Por qué esto no requiere una excepción**: [spec.md](./spec.md) es exactamente esa spec aprobada — el responsable
del producto pidió explícitamente el login de cliente y resolvió en `/speckit-clarify` que su
alcance es solo identificación, sin tocar el flujo de solicitud. La constitution ya previó este
camino (aprobar una spec) en vez de exigir una enmienda formal antes de poder planear.
**Fecha de revisión sugerida**: la próxima vez que se toque la sección "Alcance del Producto (v1)"
de la constitution (por ejemplo, al planear la siguiente funcionalidad), actualizarla para que deje
de listar "cuentas de cliente" como excluida y en su lugar describa el alcance real ya construido
(solo identificación, sin historial de solicitudes).

## Project Structure

### Documentation (this feature)

```text
specs/002-login-cliente-traducciones/
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas y su justificación
├── data-model.md         # Fase 1: entidades, reglas y estados
├── quickstart.md        # Fase 1: guía de verificación recorriendo la app
├── contracts/
│   └── api.md            # Contrato de las rutas HTTP nuevas y modificadas
├── checklists/
│   └── requirements.md  # Ya existente
└── tasks.md              # Fase 2 (/speckit-tasks — NO lo crea este comando)
```

### Source Code (repository root)

```text
app/
├── [locale]/
│   ├── layout.tsx                       # + control de cuenta en el encabezado   (FR-001)
│   ├── cuenta/
│   │   ├── ingresar/page.tsx            # Login de cliente                       (US1)
│   │   └── registro/page.tsx            # Registro de cliente                    (US1)
│   └── panel/(protected)/
│       ├── modelos/nuevo/_NuevoModeloForm.tsx   # 1 campo + switch por atributo  (US2)
│       ├── colores/[id]/_ColorForm.tsx          # 1 campo + switch por atributo  (US2)
│       ├── modelos/[id]/componentes/_ComponentesManager.tsx  # 1 campo + switch  (US2)
│       └── tecnicas/_TecnicasForm.tsx           # 1 campo + switch por atributo  (US2)
└── api/
    ├── cliente/
    │   ├── registro/route.ts             # Alta de cuenta de cliente             (FR-002, FR-003)
    │   ├── login/route.ts                # Inicio de sesión de cliente           (FR-004, FR-005, FR-010c)
    │   └── logout/route.ts               # Cierre de sesión de cliente           (FR-007)
    └── panel/
        ├── modelos/route.ts              # Body pasa a { name: {es,en}, ... }    (US2)
        ├── colores/route.ts              # ídem                                  (US2)
        ├── colores/[id]/route.ts         # ídem                                  (US2)
        ├── tecnicas/route.ts             # ídem                                  (US2)
        └── modelos/[id]/componentes/route.ts  # ídem                             (US2)

lib/
├── db/
│   └── schema.ts                         # + customer, locale enum, 4 tablas de traducción → data-model.md
├── auth/
│   ├── password.ts                       # Reutilizado sin cambios               (FR-008)
│   ├── session.ts                        # Sesión de panel, sin cambios          (FR-009)
│   ├── customer-session.ts               # Sesión de cliente, cookie separada    (FR-006, FR-009)
│   └── login-lockout.ts                  # Umbral y expiración del bloqueo       (FR-010c)
├── catalogo/
│   ├── publicacion.ts                    # Sin cambios (no depende de traducción)
│   └── traduccion.ts                     # Validar es+en presentes al guardar    (FR-016, FR-011..FR-016)
└── i18n/
    └── t.ts                              # Sin cambios; se le agregan claves nuevas

messages/
├── es.json                               # + espacio de claves de cuenta de cliente
└── en.json

tests/
├── login-lockout.test.ts                 # Umbral/expiración del bloqueo         (FR-010c)
└── traduccion-completa.test.ts           # Ambos idiomas requeridos al guardar   (FR-011..FR-016)

drizzle/                                  # + migración: nuevas tablas, copia de datos, columnas viejas fuera (FR-018)
```

**Structure Decision**: se mantiene el proyecto único de 001-configurador-gorras; esta
funcionalidad no agrega superficie de despliegue nueva, solo rutas dentro de `app/api/cliente/` (a
la par de `app/api/panel/`) y páginas dentro de `app/[locale]/cuenta/` (a la par de
`app/[locale]/panel/`). El control de cuenta se agrega al layout compartido en vez de duplicarse
por página, igual que ya se hace con el selector de idioma.

## Trazabilidad (código → requisito)

| Pieza | Requisitos | Riesgo |
|-------|-----------|--------|
| Migración de columnas a tablas de traducción | FR-011, FR-018, FR-019 | Es la pieza de mayor riesgo real: si la copia de datos falla a mitad de camino, el sitio público muestra contenido incorrecto en silencio. El driver `neon-http` no soporta transacciones, así que la mitigación es de orden (copiar todo antes de borrar), no de atomicidad — ver [research.md](./research.md#10-migración-de-datos). |
| Bloqueo por intentos fallidos | FR-010c | Aislado en `lib/auth/login-lockout.ts` con pruebas propias; si el umbral resulta muy agresivo o muy laxo, se ajusta una constante sin tocar el resto del flujo de login. |
| Separación de sesiones | FR-009 | Dos cookies, dos módulos; el riesgo es que a futuro alguien "simplifique" fusionándolos y rompa la separación exigida — se deja anotado en el propio código. |
| Alcance de formularios tocados | FR-013, Principio III | No se crean pantallas de edición donde hoy no existen (modelo, componente, técnica no tienen "renombrar" hoy); solo se les quita el campo duplicado a las pantallas de **alta** que ya tienen, y a la única pantalla de **edición** existente (color). Ver [Assumptions](./spec.md#assumptions) de la spec. |

## Complexity Tracking

*Sin violaciones de la constitution que justificar aquí* (la única excepción — alcance de cuentas
de cliente — está registrada arriba, en su propia sección, tal como exige la constitution).
