# Guía de configuración de Cloudflare R2

Esta guía explica, paso a paso, qué hay que configurar en el panel de Cloudflare para que la
aplicación pueda subir y mostrar imágenes desde R2 (FR-010 de la spec). Está pensada para
seguirse sin necesidad de leer código.

No hace falta tocar nada de lo que ya existe en Vercel Blob: los archivos subidos antes de esta
migración se siguen viendo igual, sin ningún paso adicional (FR-011).

## 1. Crear el bucket

1. Entrar a [dash.cloudflare.com](https://dash.cloudflare.com) → elegir la cuenta → **R2 Object
   Storage** en el menú lateral.
2. **Create bucket** → ponerle un nombre (por ejemplo `brahman-friends`) → **Location**: Automatic
   → **Create bucket**.
3. Anotar el nombre exacto del bucket: es el valor de `R2_BUCKET_NAME`.

## 2. Anotar el Account ID

En la misma pantalla de R2, en el panel de la derecha (o en la URL del navegador) aparece el
**Account ID** de Cloudflare. Ese valor es `R2_ACCOUNT_ID`.

## 3. Habilitar acceso público al bucket

La aplicación necesita que las imágenes se vean directamente por URL, sin iniciar sesión (igual
que hoy con Vercel Blob).

1. Entrar al bucket recién creado → pestaña **Settings**.
2. En **Public access**, activar **Allow Access** (dominio público `r2.dev`).
   - Cloudflare muestra una URL del estilo `https://pub-XXXXXXXX.r2.dev`. Ese es el valor de
     `R2_PUBLIC_BASE_URL` si se usa este dominio.
3. **Opcional (recomendado para producción)**: en vez del dominio `r2.dev`, conectar un dominio
   propio (por ejemplo `archivos.brahmanfriends.com`) en **Custom Domains** → **Connect Domain**,
   siguiendo el asistente (agrega automáticamente el registro DNS si el dominio ya está en
   Cloudflare). En ese caso, `R2_PUBLIC_BASE_URL` es `https://archivos.brahmanfriends.com`.

## 4. Configurar CORS (imprescindible)

Sin este paso, las subidas fallarán con un error de red apenas el navegador intente subir un
archivo directo al bucket (colores, vistas de modelo, carga masiva, vistas de solicitud).

1. En el bucket → pestaña **Settings** → **CORS Policy** → **Add CORS policy**.
2. Pegar esta configuración, reemplazando `https://tu-dominio.com` por el dominio real donde corre
   la aplicación (y agregando `http://localhost:3000` mientras se prueba en desarrollo):

   ```json
   [
     {
       "AllowedOrigins": ["https://tu-dominio.com", "http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. Guardar.

## 5. Crear las credenciales de API (Access Key / Secret Key)

1. En **R2 Object Storage** → **Manage R2 API Tokens** → **Create API Token**.
2. **Permissions**: elegir **Object Read & Write**.
3. **Specify bucket(s)**: restringir el token al bucket creado en el paso 1 (no dejarlo aplicar a
   toda la cuenta).
4. **Create API Token**. Cloudflare muestra **una sola vez**:
   - **Access Key ID** → es `R2_ACCESS_KEY_ID`.
   - **Secret Access Key** → es `R2_SECRET_ACCESS_KEY`.
   - Copiarlos de inmediato a un lugar seguro (gestor de contraseñas); si se pierden, hay que crear
     un token nuevo.

## 6. Cargar las variables de entorno

Con los cinco valores obtenidos, completar:

| Variable | De dónde sale |
|---|---|
| `R2_ACCOUNT_ID` | Paso 2 |
| `R2_BUCKET_NAME` | Paso 1 |
| `R2_PUBLIC_BASE_URL` | Paso 3 (dominio `r2.dev` o dominio propio, con `https://`) |
| `R2_ACCESS_KEY_ID` | Paso 5 |
| `R2_SECRET_ACCESS_KEY` | Paso 5 |

- **Local**: pegarlas en `.env.local` (nunca en `.env.example`, que solo tiene las claves vacías
  como plantilla).
- **Producción (Vercel)**: panel de Vercel del proyecto → **Settings** → **Environment
  Variables** → agregar cada una para el ambiente **Production** (y **Preview** si se usan
  vistas previas de rama).

## 7. Verificar que quedó bien

Con la app corriendo (`npm run dev` en local, o ya desplegada), seguir
[quickstart.md](./quickstart.md) → "Escenario 1": subir la imagen de un color y confirmar que
aparece la alerta de éxito y que la imagen se ve. Si la subida falla:

- Revisar que el dominio desde el que se prueba esté en `AllowedOrigins` del CORS (paso 4).
- Revisar que el token de API (paso 5) tenga permiso de escritura sobre el bucket correcto.
- Revisar que `R2_PUBLIC_BASE_URL` no tenga una barra `/` sobrante al final.
- **Si la consola muestra un error de CORS pero el CORS ya está bien configurado** (por ejemplo,
  "No 'Access-Control-Allow-Origin' header" seguido de un `403 Forbidden` en la petición `PUT`):
  R2 no soporta el checksum automático (`x-amz-checksum-crc32`) que el SDK de AWS agrega por
  defecto desde cierta versión; la firma de la URL prefirmada exige ese header, el navegador nunca
  lo manda, y R2 responde `403` sin cabeceras CORS en el error — el navegador lo reporta como
  bloqueo CORS en vez de como `403`. Ya está resuelto en `lib/media/r2-client.ts` con
  `requestChecksumCalculation: "WHEN_REQUIRED"`; si vuelve a aparecer tras actualizar el SDK,
  confirmar que esa opción sigue presente.

## Nota sobre lo que no cambia

- Los archivos subidos antes de esta migración siguen sirviéndose desde Vercel Blob; esa cuenta
  debe seguir activa mientras existan esas URLs en uso (FR-011). No hace falta borrar ni migrar
  nada de Vercel Blob como parte de esta guía.
