# Implementation Plan: Configurador de gorras y solicitud de cotización

**Branch**: `001-configurador-gorras` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-configurador-gorras/spec.md`

## Summary

Brahman Friends necesita una herramienta web donde el cliente arme su gorra, la vea y envíe una
solicitud de cotización con la ficha técnica que producción necesita. No hay pago, ni carrito, ni
cuentas de cliente.

**Enfoque técnico en una frase**: una sola aplicación web, publicada en un solo sitio, que muestra
la gorra apilando imágenes ya fotografiadas (una por color) y guarda cada solicitud en una base de
datos, con un panel protegido por contraseña para el equipo.

Las tres decisiones que gobiernan todo lo demás:

1. **La gorra se dibuja apilando imágenes, no pintando colores.** La spec ya lo decidió
   (Assumption 3): el administrador sube una foto por cada combinación de vista, componente y
   color. Eso convierte el configurador en algo casi trivial de construir —cambiar de color es
   cambiar de imagen— y traslada el esfuerzo real a la carga masiva de imágenes.
2. **El diseño vive en el navegador del cliente hasta que lo envía.** No se guarda nada del
   cliente en el servidor mientras diseña, salvo el logotipo que sube. Esto elimina de raíz la
   necesidad de cuentas, sesiones de cliente y recuperación de diseños.
3. **La imagen final del diseño la produce el propio navegador del cliente.** Al enviar, el
   navegador compone lo que ya está en pantalla y lo sube como imagen. Así no hace falta ningún
   servicio que vuelva a dibujar la gorra en el servidor.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Tailwind CSS v4, Drizzle ORM,
pdf-lib, isomorphic-dompurify, Resend SDK. Cada una justificada en
[research.md](./research.md#justificación-de-cada-dependencia-principio-i).

**Storage**: Postgres gestionado (Neon) para catálogo y solicitudes; almacenamiento de objetos
(Vercel Blob) para imágenes de modelo, logotipos e imágenes de diseño congeladas.

**Testing**: Vitest únicamente sobre las reglas de negocio puras (transiciones de estado, cuadre de
tallas, límites de zona, deformación por curvatura, validación de imágenes). Todo lo demás se
verifica recorriendo la aplicación según [quickstart.md](./quickstart.md), como exige el
Principio IV.

**Target Platform**: navegador móvil moderno (Chrome/Safari de los últimos 2 años) desde 360 px de
ancho; el mismo código sirve el escritorio del panel.

**Project Type**: aplicación web única (cliente + panel + API en un solo despliegue).

**Performance Goals**: gorra interactiva en ≤5 s sobre 4G (FR-031, SC-008); cambio de color
reflejado en <1 s (FR-028, SC-001); interacción de arrastre y redimensión fluida en móvil.

**Constraints**:

- Bilingüe español/inglés en todas las pantallas, sin texto fijo en el código (Principio II).
- Ningún dato del cliente en el servidor antes de enviar la solicitud, salvo el logotipo.
- Sin secretos en el repositorio (Principio V).
- Debe poder publicarse online desde el primer día con `git push` (requisito del responsable del
  producto).

**Scale/Scope**: negocio pequeño saliendo de la venta por redes sociales. Escala de partida:
decenas de solicitudes al mes, unos pocos modelos publicados, ~30 colores, ~540 imágenes por
modelo. Alcance de pantallas: ~6 del cliente y ~8 del panel.

**Límite conocido y aceptado (Principio I)**: el listado del panel se resuelve con consultas
directas sin paginación avanzada ni buscador de texto. Aguanta holgadamente miles de solicitudes;
si el volumen creciera mucho, se agrega paginación entonces, no ahora.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v2.0.0.

### I. Simplicidad ante todo — PASA

| Regla | Cómo se cumple |
|-------|----------------|
| Toda dependencia nueva se justifica por escrito | Tabla completa en [research.md](./research.md#justificación-de-cada-dependencia-principio-i). Se rechazaron explícitamente librerías de autenticación, de i18n, de estado global, de formularios, de manipulación de imágenes y de componentes de UI. |
| Sin abstracciones para casos que la spec no pide | Un solo proyecto, sin capa de repositorios, sin capa de servicios genérica, sin sistema de plugins. Las consultas viven junto al caso de uso que las necesita. |
| Los límites conocidos se documentan y se avanza | Documentados: sin paginación en el panel; reintento de correo por tarea programada en vez de cola de mensajes; vista del lateral derecho aproximada por reflejo (ya asumido en la spec). |

### II. Idioma y mercado — PASA

- Rutas `/es/...` y `/en/...`; el idioma es parte de la dirección, así que una pantalla nunca puede
  quedar a medias: si falta una traducción, se ve al abrir la ruta.
- Todos los textos salen de `messages/es.json` y `messages/en.json`. Una prueba automática compara
  que ambos archivos tengan exactamente las mismas claves.
- El selector de idioma cambia de ruta y guarda la elección en una cookie.
- **Moneda: no aplica.** La versión 1 no muestra ningún precio (Alcance del Producto v1). No se
  construye nada de formateo de moneda.

### III. Cero alcance fantasma — PASA

Cada archivo del plan apunta a los requisitos que lo piden; el mapa está en la sección
[Trazabilidad](#trazabilidad-código--requisito). No se planifica: recuperación de diseños por
código, cuentas de cliente, precios, carrito, versionado de diseños, 3D, ni panel de administración
para los parámetros marcados con ⚠ (Assumption 8: viven en variables de entorno).

### IV. Verificable por una persona no técnica — PASA

[quickstart.md](./quickstart.md) está escrito como recorridos: qué hace la persona, qué ve en
pantalla. Cubre los 35 criterios de éxito. Ningún criterio exige mirar código, base de datos ni
registros.

### V. Datos del usuario con respeto — PASA

- Solo se piden nombre, correo, teléfono y comentarios opcionales (FR-065), cada uno con su uso
  escrito en la spec.
- **Sin cuentas de cliente.** El único login es el del equipo, y existe porque FR-057 lo exige y
  porque FR-062 obliga a registrar quién cambió cada estado.
- Claves de base de datos, almacenamiento y correo en variables de entorno; `.env*` en
  `.gitignore` desde el primer commit.
- Sin datos de pago: no hay pago en esta versión.
- El olvido de datos está construido, no prometido: una tarea programada diaria anonimiza a los 12
  meses (FR-068) y borra logotipos huérfanos a los 30 días (FR-039).

**Resultado del gate inicial: PASA.** Sin violaciones que justificar.

**Re-evaluación tras el diseño de Fase 1: PASA.** Ver [Complexity Tracking](#complexity-tracking)
para las cuatro piezas que podrían parecer infraestructura de más y por qué la spec las exige.

## Decisiones de negocio importantes

Escritas para el responsable del producto, sin vocabulario técnico. El detalle está en
[research.md](./research.md).

### 1. Todo el producto es un solo sitio web, publicado con un solo botón

La tienda del cliente y el panel del equipo son la misma aplicación en la misma dirección. Publicar
una versión nueva es empujar los cambios; la publicación es automática y tarda un par de minutos.
**Por qué importa**: no hay servidores que administrar ni piezas que se puedan desincronizar, y la
versión 1 puede estar online el mismo día en que se termine.

### 2. Sí hay base de datos, y no es opcional

La spec pide que cada solicitud quede congelada y consultable meses después, que se pueda filtrar
por estado y fecha, que cada cambio de estado guarde quién y cuándo, y que a los 12 meses los datos
personales desaparezcan solos. Eso es exactamente lo que una base de datos hace bien.
**Se descartó** guardar cada solicitud como un archivo suelto: obliga a leerlas todas para filtrar
y no garantiza que dos envíos simultáneos no reciban el mismo código.
**Lo que sí se evitó**: una plataforma completa por encima de la base de datos (tipo Supabase). Se
usa una base de datos gestionada y punto: se contrata, se copia una clave, funciona.

### 3. Sí hay un login, pero solo para el equipo

El cliente nunca crea cuenta, nunca inicia sesión, nunca deja una contraseña. El único login es el
del panel, y existe porque el panel no puede estar abierto a cualquiera y porque hay que poder
decir "esta solicitud la rechazó Marcela el 3 de marzo". Las cuentas del equipo las crea el propio
equipo con un comando; no hay registro público.

### 4. La gorra se muestra con las fotos reales, apiladas como capas

Cada componente de cada color tiene su foto, y el configurador las superpone como si fueran
láminas. **Ventaja**: el cliente ve el material real, no una aproximación de color. **Costo, y hay
que decirlo claro**: habilitar un color nuevo en un modelo obliga a subir el juego completo de
fotos de ese color. Por eso la carga masiva de imágenes se trata como una funcionalidad de primera
clase, no como un detalle: el administrador arrastra una carpeta entera y la pantalla muestra en
todo momento qué combinaciones faltan.

### 5. La curvatura de la gorra se resuelve con tres perillas, no con un editor de mallas

Para que un logo se vea "puesto" sobre la gorra y no pegado plano, el administrador ajusta tres
valores por zona —cuánto se arquea, cuánto se inclina y cuánto se estrecha hacia los bordes— y ve
el efecto en el momento sobre la imagen del modelo. **Por qué así**: un editor de deformación punto
por punto es semanas de trabajo y de aprendizaje para el administrador; tres perillas se calibran
en cinco minutos y son suficientes para una superficie curva simple.

### 6. La imagen que se guarda de cada solicitud la genera el navegador del cliente

Al pulsar enviar, el navegador toma exactamente lo que hay en pantalla y lo convierte en imágenes,
una por vista. **Por qué importa**: lo que el equipo comercial abre meses después es literalmente
lo que el cliente vio, sin riesgo de que el servidor lo dibuje distinto, y sin pagar un servicio
adicional que vuelva a componer imágenes.

### 7. Si el correo falla, la solicitud igual vale

El registro de la solicitud y el envío del correo son dos cosas separadas. Si el correo se cae, el
cliente recibe su código igual y la solicitud aparece en el panel marcada con una señal de
"notificación pendiente". Un proceso automático reintenta el correo cada hora.
**Se descartó** montar un sistema de colas de mensajes: para el volumen de este negocio, una marca
en la solicitud y un reintento programado hacen exactamente lo mismo con una fracción de las
piezas.

### 8. Los logotipos SVG se limpian antes de guardarlos

Un archivo SVG puede traer instrucciones ocultas que se ejecutan al abrirlo. El sistema se las
retira siempre, guarda solo la versión limpia y, si el archivo deja de ser un logotipo válido
después de la limpieza, lo rechaza pidiendo otro formato. El equipo nunca descarga el archivo
original sin limpiar.

## Project Structure

### Documentation (this feature)

```text
specs/001-configurador-gorras/
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas y su justificación
├── data-model.md        # Fase 1: entidades, reglas y estados
├── quickstart.md        # Fase 1: guía de verificación recorriendo la app
├── contracts/
│   ├── api.md           # Contrato de las rutas HTTP internas
│   └── design-payload.md # Contrato del diseño que viaja del navegador al servidor
├── checklists/
│   └── requirements.md  # Ya existente
└── tasks.md             # Fase 2 (/speckit-tasks — NO lo crea este comando)
```

### Source Code (repository root)

```text
app/
├── [locale]/
│   ├── layout.tsx                  # Idioma, cookie de idioma, selector    (FR-001, FR-002)
│   ├── page.tsx                    # Listado de modelos publicados         (FR-014, edge: sin modelos)
│   ├── configurador/[modelId]/
│   │   └── page.tsx                # Configurador                          (US2, US3)
│   ├── solicitud/
│   │   ├── page.tsx                # Cantidad, tallas, resumen, contacto   (US4)
│   │   └── [codigo]/page.tsx       # Confirmación con el código            (FR-052, FR-056a)
│   ├── politica-privacidad/
│   │   └── page.tsx                # Tratamiento de datos, Ley 1581        (FR-066, FR-067)
│   └── panel/
│       ├── login/page.tsx          # Único login del sistema               (FR-057)
│       ├── modelos/…               # Alta, imágenes, zonas, publicación    (US1)
│       ├── colores/…               # Paleta y disponibilidad               (FR-016..FR-023)
│       └── solicitudes/…           # Listado, detalle, estados, ficha      (US5)
└── api/
    ├── logos/route.ts              # Subida y saneo de logotipo            (FR-037, FR-037a)
    ├── solicitudes/route.ts        # Registro de la solicitud              (FR-052, FR-054)
    ├── panel/…                     # Acciones del panel
    └── cron/
        ├── retencion/route.ts      # Anonimizar y borrar huérfanos         (FR-039, FR-068)
        └── correos/route.ts        # Reintento de notificaciones           (FR-056b)

lib/
├── db/
│   ├── schema.ts                   # Tablas (Drizzle)                      → data-model.md
│   └── index.ts                    # Conexión
├── design/
│   ├── warp.ts                     # Deformación por curvatura             (FR-035, FR-041)
│   ├── compose.ts                  # Composición a imagen en el navegador  (FR-053)
│   └── rules.ts                    # Límites de zona, máximo 3 zonas       (RN11..RN14)
├── solicitud/
│   ├── estados.ts                  # Transiciones permitidas               (FR-063, RN21)
│   ├── tallas.ts                   # Cuadre cantidad ↔ tallas              (FR-048, RN17)
│   └── codigo.ts                   # Código único                          (FR-052, RN20)
├── catalogo/
│   └── publicacion.ts              # Qué falta para publicar               (FR-012, RN2)
├── media/
│   ├── sanitize-svg.ts             # Limpieza de SVG                       (FR-037a)
│   ├── dimensiones.ts              # Igualdad de dimensiones               (FR-011, RN5)
│   └── storage.ts                  # Subidas al almacenamiento
├── auth/
│   └── session.ts                  # Cookie firmada del panel              (FR-057)
├── email/
│   └── enviar.ts                   # Notificaciones                        (FR-056)
└── i18n/
    └── t.ts                        # Lector de traducciones                (Principio II)

messages/
├── es.json
└── en.json

tests/
├── estados.test.ts
├── tallas.test.ts
├── warp.test.ts
├── publicacion.test.ts
├── dimensiones.test.ts
└── traducciones.test.ts            # Mismas claves en es.json y en.json

drizzle/                            # Migraciones generadas
```

**Structure Decision**: un único proyecto Next.js en la raíz del repositorio. No se separa
frontend de backend porque no hay dos equipos ni dos ciclos de despliegue: separarlos añadiría un
contrato HTTP público, dos configuraciones y dos publicaciones para el mismo producto. Las rutas
HTTP internas de `app/api/` existen solo donde el navegador necesita hablar con el servidor
(subir un logotipo, registrar una solicitud, actuar sobre el panel); todo lo demás se resuelve
renderizando en el servidor.

## Trazabilidad (código → requisito)

Cada módulo del árbol anterior lleva anotado el requisito que lo pide (Principio III). Los tres
puntos donde conviene mirar dos veces al implementar:

| Pieza | Requisitos | Riesgo |
|-------|-----------|--------|
| Carga masiva de imágenes | FR-009, FR-010, FR-011, FR-012 | Es el mayor esfuerzo real de la versión 1 (~540 imágenes por modelo). Ya señalado en el checklist de la spec. |
| Deformación por curvatura | FR-035, FR-035a, FR-041, SC-013 | Es la única matemática no trivial. Se aísla en `lib/design/warp.ts` con pruebas propias. |
| Congelado de la solicitud | FR-053, RN19, SC-021 | Si algo se guarda por referencia en vez de por copia, SC-021 falla meses después y en silencio. |

## Complexity Tracking

El gate de la constitution pasa sin violaciones. Se registran aquí las cuatro piezas que un
revisor podría leer como "infraestructura de más", con el requisito que las obliga.

| Pieza | Por qué es necesaria | Alternativa más simple, y por qué se rechazó |
|-------|----------------------|----------------------------------------------|
| Base de datos Postgres | FR-053 (congelar), FR-058 (filtrar por estado y fecha), FR-062/063 (historial con responsable), FR-068 (borrado a los 12 meses), RN20 (código irrepetible) | Guardar solicitudes como archivos sueltos: filtrar obliga a leerlas todas y dos envíos simultáneos podrían recibir el mismo código. Sale más complejo, no menos. |
| Almacenamiento de objetos | FR-009 (~540 imágenes por modelo), FR-038 (el logotipo sobrevive a una recarga), FR-053 (imágenes congeladas) | Guardar imágenes dentro del repositorio: publicar un color nuevo exigiría intervención de desarrollo y rompería la autonomía de la historia 1. |
| Login del panel | FR-057 (acceso restringido), FR-062 (quién cambió el estado), SC-022 | Una contraseña única compartida: cumpliría FR-057 pero no FR-062, porque no permite decir quién actuó. Se usa lo mínimo que cumple ambos: usuarios creados por comando, sin registro público. |
| Tareas programadas | FR-039 (borrar logotipos huérfanos), FR-056b (reintentar correos), FR-068 (anonimizar a los 12 meses) | Hacerlo a mano: el olvido de datos personales quedaría a merced de que alguien se acuerde, lo que contradice el Principio V. Se usan las tareas programadas del mismo servicio de publicación, sin sistema de colas. |

## Pendientes que no bloquean el desarrollo

- Los valores marcados con ⚠ en la spec (formatos, peso máximo, límite de caracteres, máximos de
  zonas) siguen pendientes de confirmar con la fábrica. Viven en variables de entorno con los
  valores de partida de la spec, así que ajustarlos no requiere tocar código. Deben cerrarse antes
  de dar por terminada la historia 3.
- La medida de partida sugerida para la zona frontal (11 cm × 5,5 cm) se carga como valor por
  defecto al crear una zona nueva; el administrador la corrige por modelo desde el panel.
