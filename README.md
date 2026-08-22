# Brahman Friends — Configurador de gorras

Herramienta web donde el cliente arma su gorra, la ve y envía una solicitud de cotización. Panel
protegido por contraseña para el equipo. Ver [specs/001-configurador-gorras/](./specs/001-configurador-gorras/)
para la especificación completa.

## Requisitos previos

- Node.js 22 o superior.
- Una base de datos Postgres (recomendado: [Neon](https://neon.tech), cuenta gratuita).
- Una cuenta de Vercel conectada al repositorio, con **Vercel Blob** activado.
- Una cuenta de [Resend](https://resend.com) con el dominio verificado para enviar correo.

## Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar. Ningún valor de estos entra al repositorio.

| Variable | Para qué |
|----------|----------|
| `DATABASE_URL` | Conexión a la base de datos |
| `BLOB_READ_WRITE_TOKEN` | Guardar imágenes y logotipos |
| `RESEND_API_KEY` | Enviar los correos de notificación |
| `ADMIN_NOTIFY_EMAIL` | A quién le llega el aviso de solicitud nueva |
| `SESSION_SECRET` | Firmar la sesión del panel |
| `CRON_SECRET` | Proteger las tareas programadas |
| `MAX_LOGO_MB` | Peso máximo de un logotipo, en MB (por defecto 5) |
| `LOGO_FORMATS` | Formatos de logotipo aceptados, separados por coma (por defecto `png,svg,jpg`) |
| `DEFAULT_ZONE_TEXT_CHARS` | Límite de caracteres por defecto al crear una zona (por defecto 20) |
| `MAX_DECORATED_ZONES` | Máximo de zonas decoradas por diseño (por defecto 3) |

## Arrancar en local

```bash
npm install
npm run db:migrate          # crea las tablas
npm run crear-admin         # pregunta nombre, correo y contraseña del primer usuario del panel
npm run dev                 # queda en http://localhost:3000
```

## Comprobaciones automáticas

```bash
npm test                    # reglas de negocio y paridad de traducciones
npm run typecheck
npm run lint
```

## Publicar

Empujar a la rama principal. Vercel publica solo. Antes del primer despliegue:

1. Cargar las mismas variables de entorno de arriba en el proyecto de Vercel.
2. Activar Vercel Blob para el proyecto.
3. Las dos tareas programadas (`vercel.json`) quedan activas solas: `/api/cron/retencion` (diaria) y
   `/api/cron/correos` (cada hora).

**Comprobación mínima de que quedó bien publicado**: abrir la dirección desde un teléfono en datos
móviles, y que la portada cargue en ambos idiomas (`/es`, `/en`).

## Notas técnicas

- **Conexión a la base de datos**: se usa el driver HTTP de Neon (`neon-http`), no el Pool por
  WebSocket. El Pool depende de un módulo nativo (`bufferutil`, vía `ws`) que falla en el entorno
  serverless de Vercel (`bufferUtil.mask is not a function`, comprobado en desarrollo). El driver
  HTTP no soporta transacciones interactivas de varias idas y vueltas; las rutas que necesitan
  atomicidad (`POST /api/solicitudes`, `PATCH /api/panel/solicitudes/:id/estado`) usan
  `db.batch([...])`, que Neon ejecuta como una sola operación atómica.
- **Vulnerabilidades conocidas y aceptadas**: `next audit` señala `postgres` y `sharp` (ambos
  dependencias internas de Next.js, no del código de este proyecto) como vulnerables; el arreglo
  exige subir a Next.js 16, fuera del alcance de este plan (Next.js 15). Se revisa en cada
  actualización de dependencias.

## Valores pendientes de confirmar (⚠)

`MAX_LOGO_MB`, `LOGO_FORMATS`, `DEFAULT_ZONE_TEXT_CHARS` y `MAX_DECORATED_ZONES` llevan los valores
de partida de la spec. Antes de dar por terminada la historia 3, confirmarlos con la fábrica y
actualizarlos acá y en el proyecto de Vercel (no requiere tocar código).
