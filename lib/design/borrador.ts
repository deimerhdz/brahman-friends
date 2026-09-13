/**
 * El diseño en curso vive en `localStorage` del cliente hasta que se envía
 * (FR-032, FR-054; contracts/design-payload.md, forma 1). `submissionId` se
 * genera una sola vez y no cambia: es lo que garantiza un solo registro si
 * el cliente pulsa enviar dos veces.
 */

export const STORAGE_KEY = "bf.design.v1";
// v2: `colors` (un color por componente) pasó a ser `colorId` (un solo
// color para toda la gorra) al eliminar el modelo por "partes".
export const DESIGN_VERSION = 2;

export interface DecorationLogo {
  zone: "front" | "left" | "right" | "back";
  kind: "logo";
  logoAssetId: string;
  /**
   * URL pública del logotipo ya subido. No forma parte del contrato que
   * viaja al servidor (que solo necesita `logoAssetId`, FR-053) pero se
   * guarda también en el borrador para poder redibujar el logotipo tras una
   * recarga sin una ruta de consulta adicional (SC-009).
   */
  url: string;
  widthCm: number;
  heightCm: number;
  offsetXPct: number;
  offsetYPct: number;
}

export interface DecorationText {
  zone: "front" | "left" | "right" | "back";
  kind: "text";
  content: string;
  font: string;
  colorId: string;
  widthCm: number;
  heightCm: number;
  offsetXPct: number;
  offsetYPct: number;
}

export type Decoration = DecorationLogo | DecorationText;

export interface Draft {
  version: 2;
  modelId: string;
  submissionId: string;
  colorId: string | null;
  technique: string | null;
  decorations: Decoration[];
  updatedAt: string;
}

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyDraft(
  modelId: string,
  defaultColorId: string | null,
): Draft {
  return {
    version: DESIGN_VERSION,
    modelId,
    submissionId: generateId(),
    colorId: defaultColorId,
    technique: null,
    decorations: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Descarta el borrador si no es de este modelo o de una versión anterior (FR-032). */
export function loadDraft(modelId: string): Draft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Draft;
    if (parsed.version !== DESIGN_VERSION) return null;
    if (parsed.modelId !== modelId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft): void {
  if (typeof window === "undefined") return;
  const next: Draft = { ...draft, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
