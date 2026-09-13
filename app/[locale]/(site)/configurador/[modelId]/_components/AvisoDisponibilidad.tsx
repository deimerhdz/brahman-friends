/**
 * Avisa cuando el borrador restaurado tenía un color que ya no está
 * disponible (FR-032, FR-033, SC-009).
 */
export function AvisoDisponibilidad({
  show,
  labels,
}: {
  show: boolean;
  labels: { title: string };
}) {
  if (!show) return null;
  return (
    <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
      <p className="font-medium">{labels.title}</p>
    </div>
  );
}
