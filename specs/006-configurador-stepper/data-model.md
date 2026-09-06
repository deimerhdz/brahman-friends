# Fase 1 — Modelo de datos

**Feature**: Configurador en pasos | **Fecha**: 2026-09-02

Extiende el modelo de datos de [`001-configurador-gorras`](../001-configurador-gorras/data-model.md)
con lo que pide la [spec](./spec.md#key-entities): la cantidad mínima de pedido por modelo. No
modifica ninguna tabla existente salvo agregar una columna a `cap_model`.

> **Nota (Enmienda 2026-09-06 (3) de spec.md)**: esta fase también agregaba un catálogo de telas
> (tablas `fabric`, `fabric_translation`, `model_fabric`) y un campo `fabricId` en `Draft`. Se
> construyó, se probó y luego se eliminó por completo junto con el paso de tela del configurador;
> las tablas nunca llegaron a un despliegue compartido, así que se borraron sin dejar una migración
> de reversión.

---

## Tabla existente extendida

### `cap_model` — agrega cantidad mínima de pedido (FR-010, FR-012)

| Campo nuevo | Tipo | Notas |
|-------|------|-------|
| `moq` | integer, NULL | Cantidad mínima de pedido. `NULL` = "no configurado"; el código lo trata como 1 (FR-012, research.md#3). No se rellena con una migración de datos: los modelos existentes simplemente no tienen MOQ hasta que el administrador lo defina (spec, Assumption 5). |

---

## Diseño (`Draft`, `lib/design/borrador.ts`)

Sin cambios respecto a `001-configurador-gorras`: el diseño sigue viviendo solo en el navegador del
cliente hasta que se envía (`001-configurador-gorras` Assumption 9). **No se agrega ningún campo de
cantidad al `Draft`** — ver research.md#4: la cantidad del resumen es una sugerencia que viaja por
parámetro de URL hacia `/solicitud`, no un dato del diseño.

---

## Manifiesto del modelo (`loadModelManifest`, `lib/catalogo/model-manifest.ts`) — payload extendido

El objeto que ya arma esta función (y que expone `GET /api/imagenes-modelo/:modelId`, ver
[contracts/api.md](./contracts/api.md)) gana un campo, calculado a partir de la columna nueva:

```ts
{
  // ...lo que ya existía (model, views, baseImages, components, zones, sizes, techniques)
  moq: number; // cap_model.moq ?? 1 (FR-012)
}
```

---

## Trazabilidad requisito → tabla/campo

| Requisito | Tabla/Campo |
|-----------|-------------|
| FR-010, FR-011, FR-012 | `cap_model.moq` |
