/** Fallo al descargar imágenes del modelo: reintentar sin perder el diseño. */
export function ErrorImagenes({
  onRetry,
  labels,
}: {
  onRetry: () => void;
  labels: { message: string; retry: string };
}) {
  return (
    <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700">
      <p className="mb-2">{labels.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-red-600 px-4 py-2 text-white"
      >
        {labels.retry}
      </button>
    </div>
  );
}
