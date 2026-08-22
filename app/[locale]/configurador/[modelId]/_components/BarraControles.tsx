/**
 * Controles principales anclados abajo, al alcance del pulgar (FR-004,
 * SC-029). Verificado a 360 px de ancho (research.md, decisión 16).
 */
export function BarraControles({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-3">
      {children}
    </div>
  );
}
