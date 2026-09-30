/**
 * Formatea el precio de un "Producto fijo" como USD (009-modelos-producto-fijo,
 * research.md#6): `cap_model.price` ya se guarda en USD. Se escribe "US$" y no
 * solo "$", que un cliente colombiano leería como pesos (011-rediseno-paleta-
 * inicio, FR-018) — Principio II de la constitution ("el precio DEBE llevar
 * su moneda clara").
 */
export function formatUsd(price: string): string {
  const value = Number(price);
  return `US$ ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
