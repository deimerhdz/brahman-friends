# Contrato — El diseño

**Feature**: Configurador de gorras y solicitud de cotización | **Fecha**: 2026-08-12

Esta es la pieza de información más importante del producto: lo que el cliente armó. Viaja por tres
sitios y en los tres tiene la misma forma:

1. **En el navegador del cliente**, guardado en `localStorage`, para sobrevivir a una recarga
   (FR-032).
2. **Al enviar**, dentro de la petición que registra la solicitud.
3. **En la solicitud, para siempre**, ampliado con los valores copiados del catálogo, en
   `request.design_snapshot` (FR-053).

---

## Forma 1 — Diseño en curso (navegador)

Clave de `localStorage`: `bf.design.v1`. La versión en la clave permite ignorar borradores viejos si
la forma cambia, sin romper el navegador de nadie.

```json
{
  "version": 1,
  "modelId": "uuid",
  "submissionId": "uuid",
  "colors": {
    "<componentId>": "<colorId>"
  },
  "technique": "<techniqueId> | null",
  "decorations": [
    {
      "zone": "front",
      "kind": "logo",
      "logoAssetId": "uuid",
      "widthCm": 8.5,
      "heightCm": 4.2,
      "offsetXPct": 0.0,
      "offsetYPct": 0.0
    },
    {
      "zone": "back",
      "kind": "text",
      "content": "BRAHMAN FC",
      "font": "condensed-bold",
      "colorId": "uuid",
      "widthCm": 9.0,
      "heightCm": 2.0,
      "offsetXPct": 0.1,
      "offsetYPct": -0.05
    }
  ],
  "updatedAt": "2026-08-12T14:31:00Z"
}
```

**Notas de forma**:

- `submissionId` se genera al abrir el configurador y no cambia. Es lo que garantiza un solo registro
  si el cliente pulsa enviar dos veces (FR-054).
- El logotipo se guarda como **referencia** (`logoAssetId`), no como archivo: el archivo ya está en el
  servidor (Assumption 9).
- `widthCm` / `heightCm` son **centímetros reales**, no píxeles (FR-003). Son la medida que producción
  necesita, y la que se compara contra los máximos de la zona (RN12).
- `offsetXPct` / `offsetYPct` son el desplazamiento dentro de la zona, entre −0,5 y 0,5, donde 0 es el
  centro. Al ser proporciones, la posición se ve igual en cualquier tamaño de pantalla.
- `decorations` tiene como máximo 3 elementos y ninguna `zone` se repite (RN13).
- `technique` es un solo valor para todo el diseño (RN14).

**Invariantes que se comprueban al cargar el borrador** (`lib/design/rules.ts`):

| Comprobación | Si falla |
|--------------|----------|
| `version` es 1 | Se descarta el borrador y se empieza limpio |
| El modelo sigue publicado | Se avisa y se bloquea el envío (FR-033, RN4) |
| Cada color sigue disponible | Se señala el componente y se pide elegir otro (FR-033) |
| Cada elemento cabe en su zona | Se reduce al máximo de la zona y se avisa (RN12) |
| El logotipo referenciado existe | Se pide subirlo de nuevo |

---

## Forma 2 — Diseño congelado (`request.design_snapshot`)

Al registrar la solicitud, el servidor toma la forma 1 y **copia** los datos del catálogo dentro del
diseño. Desde ese momento la solicitud no consulta el catálogo para mostrarse: se lee sola (RN19,
SC-021).

```json
{
  "version": 1,
  "model": {
    "id": "uuid",
    "code": "BF-TRUCKER-01",
    "nameEs": "Trucker clásica",
    "nameEn": "Classic trucker"
  },
  "technique": { "id": "uuid", "nameEs": "Bordado directo", "nameEn": "Direct embroidery" },
  "components": [
    {
      "id": "uuid",
      "nameEs": "Corona",
      "nameEn": "Crown",
      "material": "fabric",
      "customizable": true,
      "color": {
        "id": "uuid",
        "nameEs": "Azul Rey",
        "nameEn": "Royal Blue",
        "supplierRef": "PANT-286C-TW",
        "material": "fabric",
        "sampleImageUrl": "https://…"
      }
    }
  ],
  "decorations": [
    {
      "zone": "front",
      "kind": "logo",
      "logoAssetId": "uuid",
      "logoFilename": "escudo-club.svg",
      "logoMime": "image/svg+xml",
      "widthCm": 8.5,
      "heightCm": 4.2,
      "zoneMaxWidthCm": 11.0,
      "zoneMaxHeightCm": 5.5,
      "offsetXPct": 0.0,
      "offsetYPct": 0.0
    }
  ],
  "views": ["front", "side", "side_mirrored", "back"],
  "frozenAt": "2026-08-12T14:35:12Z"
}
```

**Los tres campos que el equipo comercial y producción realmente usan** (FR-060, SC-025, SC-032):

- `components[].color.supplierRef` — con qué material exacto se produce cada pieza.
- `decorations[].widthCm` / `heightCm` — de qué tamaño real va cada elemento.
- `technique` — con qué técnica.

Si alguno de esos tres falta o llega vacío, la ficha técnica queda ambigua y la gorra sale mal. Es la
razón de ser de esta copia.

**Regla dura al implementar**: `design_snapshot` **nunca** contiene solo identificadores del
catálogo. Si un dato lo necesita la ficha técnica, se copia su valor. Un `colorId` sin `nameEs` ni
`supplierRef` al lado es un error, aunque hoy funcione: dejará de funcionar el día que se
descontinúe ese color.
