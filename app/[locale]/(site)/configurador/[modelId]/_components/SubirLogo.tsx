"use client";

import { useState } from "react";

export interface LogoSubido {
  logoAssetId: string;
  url: string;
  width: number | null;
  height: number | null;
}

/**
 * Carga del logotipo, con sus avisos y el aviso de derechos de uso
 * (FR-037, RN16). El cliente sigue siendo anónimo en este paso.
 */
export function SubirLogo({
  onUploaded,
  labels,
}: {
  onUploaded: (logo: LogoSubido) => void;
  labels: Record<string, string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setWarnings([]);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/logos", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) {
        setError(
          body.error === "archivo_demasiado_grande"
            ? labels.tooLarge.replace("{{maxMb}}", String(body.detail?.maxMb ?? ""))
            : body.error === "formato_no_permitido"
              ? labels.formatNotAllowed
              : labels.error,
        );
        return;
      }
      setWarnings(body.warnings ?? []);
      onUploaded({
        logoAssetId: body.logoAssetId,
        url: body.url,
        width: body.width,
        height: body.height,
      });
    } catch {
      setError(labels.error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {uploading && <p className="text-sm text-gray-500">{labels.uploading}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {warnings.includes("baja_resolucion") && (
        <p className="text-sm text-yellow-700">{labels.lowResolution}</p>
      )}
      {warnings.includes("fondo_no_transparente") && (
        <p className="text-sm text-yellow-700">{labels.opaqueBackground}</p>
      )}
      <p className="text-xs text-gray-500">{labels.rightsNotice}</p>
    </div>
  );
}
