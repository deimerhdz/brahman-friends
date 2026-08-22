/**
 * Máquina de estados de la solicitud (FR-063, RN21). No se puede saltar
 * pasos; se puede rechazar desde cualquier estado abierto.
 */

export const REQUEST_STATUSES = [
  "new",
  "in_review",
  "quoted",
  "closed",
  "rejected",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const FINAL_STATUSES: readonly RequestStatus[] = ["closed", "rejected"];

const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new: ["in_review", "rejected"],
  in_review: ["quoted", "rejected"],
  quoted: ["closed", "rejected"],
  closed: [],
  rejected: [],
};

export function allowedTransitions(from: RequestStatus): RequestStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isFinal(status: RequestStatus): boolean {
  return FINAL_STATUSES.includes(status);
}
