/**
 * Código único e irrepetible que ve el cliente (FR-052, RN20). La garantía
 * de unicidad la da la clave `UNIQUE` de `request.code` en la base de datos:
 * esta función solo propone un candidato; quien la llama reintenta con otro
 * candidato si la base de datos rechaza un choque (extremadamente
 * improbable, pero no imposible).
 */
export function generateRequestCode(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `BF-${year}-${random}`;
}
