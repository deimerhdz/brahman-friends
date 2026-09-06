# Contrato — Rutas HTTP nuevas o modificadas

**Feature**: Configurador en pasos | **Fecha**: 2026-09-02

Sigue las mismas convenciones que
[`001-configurador-gorras/contracts/api.md`](../../001-configurador-gorras/contracts/api.md): rutas
internas, cuerpos en JSON salvo subida de archivos, errores `{ "error": "<clave>" }`, mismos
códigos HTTP. Este documento solo lista lo que agrega o cambia este feature; todo lo demás
(`/api/logos`, `/api/solicitudes`, `/api/panel/solicitudes/*`, etc.) sigue igual.

> **Nota (Enmienda 2026-09-06 (3) de spec.md)**: esta feature tuvo también un catálogo de telas en
> el panel (`/api/panel/telas`, `/api/panel/modelos/:id/telas`) y un campo `fabricId` en el diseño
> enviado a `/api/solicitudes`. Se construyó, se probó y luego se eliminó por completo junto con el
> paso de tela del configurador.

---

## Panel — cantidad mínima de pedido (FR-010)

### `PATCH /api/panel/modelos/:id` *(ruta existente, ampliada)*

Se agrega un campo opcional al cuerpo ya existente:

```json
{ "moq": 144 }
```

**Validación**: si viene, debe ser un entero ≥ 1 → si no, `400 datos_invalidos`. Si no viene, no se
toca (mismo comportamiento que `code`, `name`, `description` en la ruta actual).

---

## Cliente — manifiesto del modelo (ruta existente, payload ampliado)

### `GET /api/imagenes-modelo/:modelId`

Mismo endpoint, mismo contrato de error (`404 modelo_no_disponible`). El payload de éxito gana
`moq` — ver [data-model.md](./data-model.md#manifiesto-del-modelo-loadmodelmanifest-libcatalogomodel-manifestts--payload-extendido).
La página del configurador (`app/[locale]/(site)/configurador/[modelId]/page.tsx`) ya renderiza este
mismo manifiesto en el servidor (FR-031a de `001-configurador-gorras`); nada cambia en cómo se
obtiene, solo en lo que trae.

## Cliente — revisión de disponibilidad al llegar al resumen (FR-022)

### `GET /api/imagenes-modelo/:modelId` *(ruta existente, nuevo punto de uso)*

Mismo endpoint documentado más arriba para el manifiesto inicial. Este feature agrega un **segundo
punto de uso**: `ConfiguradorApp.tsx` lo vuelve a llamar al llegar al último paso (resumen), para
detectar si el modelo se despublicó durante la sesión (research.md#7). Un `404
modelo_no_disponible` deshabilita "Solicitar cotización" y muestra el aviso de no disponible; una
respuesta `200` no cambia nada.

## Cliente — cantidad sugerida hacia la solicitud (FR-021)

No es una ruta HTTP: es un contrato de navegación. El botón "Solicitar cotización" del paso de
resumen navega a:

```text
/{locale}/solicitud?qty=<cantidad>
```

`SolicitudApp` (ya un componente cliente) lee `qty` de `useSearchParams()` una sola vez al montar y,
si es un entero ≥ 1, lo usa como valor inicial del estado `quantity` en lugar de `0`. Si `qty` falta
o no es válido, el comportamiento es exactamente el de hoy (arranca en `0`). No se valida contra el
MOQ del lado del servidor en este punto — el MOQ ya se hizo cumplir en el paso de resumen del
configurador (FR-011); la pantalla de solicitud sigue sin conocer el concepto de MOQ, igual que hoy
no conoce precios.
