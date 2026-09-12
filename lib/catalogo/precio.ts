/**
 * Formatea el precio de un "Producto fijo" como USD (009-modelos-producto-fijo,
 * research.md#6): `cap_model.price` ya se guarda en USD, así que solo hace
 * falta el símbolo y el separador de miles — Principio II de la constitution
 * ("el precio DEBE llevar su moneda clara").
 */
export function formatUsd(price: string): string {
  const value = Number(price);
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
