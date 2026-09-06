# Contrato — Rutas HTTP nuevas o modificadas

**Feature**: Colores propios por modelo | **Fecha**: 2026-09-06

Sigue las mismas convenciones que
[`001-configurador-gorras/contracts/api.md`](../../001-configurador-gorras/contracts/api.md): rutas
internas, cuerpos en JSON salvo subida de archivos, errores `{ "error": "<clave>" }`, mismos códigos
HTTP. Este documento solo lista lo que agrega, mueve o cambia este feature; todo lo demás sigue
igual.

---

## Panel — crear un color dentro de un modelo (FR-001, FR-002, FR-003)

### `POST /api/panel/modelos/:id/colores` *(nueva — reemplaza `POST /api/panel/colores`)*

Crea un color perteneciente exclusivamente al modelo `:id`. Mismo cuerpo que la ruta que reemplaza,
sin campo de modelo (viene de la URL, no del body):

```json
{
  "name": { "es": "Rojo", "en": "Red" },
  "supplierRef": "PANTONE-186C",
  "material": "algodon",
  "sampleImageUrl": "https://...",
  "status": "available"
}
```

**Validación**: igual que la ruta anterior (`name` en ambos idiomas, `supplierRef` no vacío,
`material` de la lista fija, `sampleImageUrl` no vacío) → si no, `400 datos_invalidos`. Además, el
modelo `:id` debe existir → si no, `404 no_encontrado`.

**Éxito**: `201`, mismo cuerpo de respuesta que antes (`{ ...color, nameEs, nameEn }`), con
`modelId` incluido.

`POST /api/panel/colores` **se elimina** — ya no existe una forma de crear un color sin especificar
su modelo.

---

## Panel — editar/eliminar un color existente (sin cambios de contrato)

### `PATCH /api/panel/colores/:id` y `DELETE /api/panel/colores/:id`

Sin cambios: `color.id` sigue siendo único globalmente aunque el color ahora pertenezca a un
modelo, así que no hace falta anidar estas dos rutas bajo `/modelos/:id`. `DELETE` sigue devolviendo
`409 color_en_uso` si algún `component_color` todavía lo referencia (dentro de su propio modelo,
que es la única posibilidad ahora — FR-002).

---

## Panel — habilitar un color en un componente (FR-002, FR-007, RN6 ya existente)

### `POST /api/panel/componentes/:id/colores` *(ruta existente, validación ampliada)*

Mismo cuerpo (`{ colorId, view }`). Se agrega una comprobación antes de insertar en
`component_color`, además de la ya existente sobre material:

| Comprobación | Ya existía | Respuesta si falla |
|---|---|---|
| `color.material === component.material` | Sí (RN6) | `422 material_no_coincide` |
| `color.modelId === component.modelId` | **Nueva** | `422 modelo_no_coincide` |
| La vista está activa en el modelo | Sí | `422 vista_no_activa` |

`DELETE /api/panel/componentes/:id/colores` no cambia: deshabilitar y borrar imágenes ya solo puede
operar dentro del mismo modelo, por construcción.

---

## Panel — publicar un modelo (sin cambio de contrato, consulta interna acotada)

### `POST /api/panel/modelos/:id/publicar`

Mismo contrato de entrada/salida (incluye `422 publicacion_incompleta` con `componentsWithoutColors`
igual que hoy). Internamente, la consulta de colores que arma el `PublicacionInput` se acota a
`color.modelId = :id` en vez de traer el catálogo completo — no observable desde el cliente de la
ruta, solo evita traer filas irrelevantes de otros modelos.

---

## Cliente — manifiesto del modelo (sin cambio de contrato)

### `GET /api/imagenes-modelo/:modelId`

Mismo contrato exactamente (mismo payload, mismo `404 modelo_no_disponible`). Ver
[data-model.md](./data-model.md#manifiesto-del-modelo-loadmodelmanifest-libcatalogomodel-manifestts).
El configurador público no cambia: sigue recibiendo la misma forma de `components[].colors[]`, ahora
garantizada (no solo esperada) a pertenecer todos al mismo modelo.
