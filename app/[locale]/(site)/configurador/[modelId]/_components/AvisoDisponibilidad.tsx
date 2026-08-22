/**
 * Avisa qué corregir cuando el borrador restaurado tiene un color que ya no
 * está disponible (FR-032, FR-033, SC-009).
 */
export function AvisoDisponibilidad({
  componentNames,
  labels,
}: {
  componentNames: string[];
  labels: { title: string };
}) {
  if (componentNames.length === 0) return null;
  return (
    <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
      <p className="font-medium">{labels.title}</p>
      <ul className="list-inside list-disc">
        {componentNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
