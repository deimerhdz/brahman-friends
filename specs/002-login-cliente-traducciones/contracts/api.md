# Contrato — Rutas HTTP

**Feature**: Login de cliente y traducciones por tabla independiente | **Fecha**: 2026-08-22

Mismas convenciones que [001-configurador-gorras/contracts/api.md](../../001-configurador-gorras/contracts/api.md):
rutas internas, sin versión pública; cuerpos en JSON; errores `{ "error": "<clave>", "detail": <objeto opcional> }`.

---

## Cliente (sin sesión previa)

### `POST /api/cliente/registro`

Cuerpo `{ name, email, password }`. Crea la cuenta y responde `204` con la cookie de sesión de
cliente puesta (`bf_customer_session`), igual que el login: registrarse deja identificado de una
vez (FR-002, Acceptance Scenario 1).

Errores:

- `400 datos_invalidos` — falta algún campo o está vacío.
- `409 correo_ya_registrado` — ya existe una cuenta de cliente con ese correo (FR-003).

### `POST /api/cliente/login`

Cuerpo `{ email, password }`. Respuesta `204` con la cookie de sesión de cliente puesta.

Error único: `401 credenciales_invalidas` — cubre correo inexistente, contraseña incorrecta **y**
cuenta temporalmente bloqueada por intentos fallidos (FR-005, FR-010c): mismo mensaje y mismo
tiempo de respuesta en los tres casos, para no revelar cuál de los tres ocurrió.

### `POST /api/cliente/logout`

Respuesta `204`, cookie de cliente borrada (FR-007).

> No hay una ruta `GET /api/cliente/sesion`: el encabezado compartido lee la sesión directamente
> en el servidor (componente de servidor de `app/[locale]/layout.tsx`), como ya hace el panel con
> `getSession()`. Una ruta aparte no la pide ningún requisito.

---

## Panel (requiere sesión de panel — sin cambios de autenticación)

Las rutas existentes que crean o editan modelo, color, componente y técnica cambian **solo la
forma del cuerpo** para los atributos traducibles: en vez de `nameEs`/`nameEn` (y
`descriptionEs`/`descriptionEn` en modelo) sueltos, agrupados por atributo:

```json
{
  "name": { "es": "Gorra clásica", "en": "Classic cap" },
  "description": { "es": "…", "en": "…" }
}
```

Aplica a:

- `POST /api/panel/modelos` — agrega `name` (requerido) y `description` (opcional, default `""`
  por idioma). El resto del cuerpo (`code`) no cambia.
- `POST /api/panel/colores` — agrega `name` (requerido). `PATCH /api/panel/colores/:id` — `name`
  sigue siendo opcional, igual que el resto del cuerpo (`supplierRef`, `material`,
  `sampleImageUrl`, `status`): se puede seguir editando solo la disponibilidad sin tocar el
  nombre. Si `name` se envía, debe traer ambos idiomas.
- `POST /api/panel/modelos/:id/componentes` — agrega `name` (requerido). El resto del cuerpo
  (`material`, `customizable`, `layerOrder`) no cambia.
- `POST /api/panel/tecnicas` — agrega `name` (requerido). Sin más campos, igual que hoy.

Validación común (FR-011 a FR-016, `lib/catalogo/traduccion.ts`): si `name.es` o `name.en` falta o
está vacío, `400 datos_invalidos`. Ningún otro código de error nuevo — el resto del contrato de
cada ruta (sesión requerida, `404 no_encontrado`, `409 color_en_uso`, etc.) no cambia.

> **No se agrega ninguna ruta de edición nueva** para modelo, componente ni técnica: hoy solo
> tienen alta, y esta funcionalidad no agrega la pantalla de renombrar que no pidió (Principio III,
> ver [plan.md](../plan.md#trazabilidad-código--requisito)).

---

## Lo que deliberadamente no existe

- Recuperación de contraseña de cliente ("forgot password").
- Verificación de correo por enlace de confirmación.
- Cualquier vínculo entre `customer` y `request` (cerrado en `/speckit-clarify`, 2026-08-22).
- Rutas para que el panel administre cuentas de cliente (activar/desactivar, listar).
- Un endpoint genérico de "traducciones" que no pertenezca a una de las cuatro rutas de arriba.
