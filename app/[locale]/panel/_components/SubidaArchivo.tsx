"use client";

import { useRef, useState } from "react";
import { subirDirecto } from "@/lib/media/subir-directo";

export type EstadoSubida = "idle" | "seleccionado" | "subiendo" | "error";

/**
 * Componente reutilizable de subida de un solo archivo (spec FR-002 a
 * FR-006): precarga una vista previa local, sube solo al confirmar con el
 * botón, y avisa éxito/error con una alerta. Sube directo a R2 con la URL
 * prefirmada que entrega `presignEndpoint` (contracts/subidas-presignadas.md).
 */
export function SubidaArchivo({
  presignEndpoint,
  pathPrefix,
  accept,
  maxSizeBytes,
  currentUrl,
  onUploaded,
  onStatusChange,
  labels,
}: {
  presignEndpoint: string;
  pathPrefix: string;
  accept: string[];
  maxSizeBytes?: number;
  currentUrl?: string;
  onUploaded: (publicUrl: string, file: File) => void;
  onStatusChange?: (status: EstadoSubida) => void;
  labels: {
    select: string;
    upload: string;
    uploading: string;
    success: string;
    error: string;
    retry: string;
  };
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<EstadoSubida>("idle");
  const [alert, setAlert] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function setEstado(next: EstadoSubida) {
    setStatus(next);
    onStatusChange?.(next);
  }

  function onSelect(selected: File | undefined) {
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAlert(null);
    setErrorMessage(null);
    setEstado("seleccionado");
  }

  async function onUpload() {
    if (!file) return;
    if (maxSizeBytes && file.size > maxSizeBytes) {
      setErrorMessage(labels.error);
      setAlert("error");
      setEstado("error");
      return;
    }

    setEstado("subiendo");
    setAlert(null);
    try {
      const pathname = `${pathPrefix}/${Date.now()}-${file.name}`;
      const publicUrl = await subirDirecto(
        presignEndpoint,
        pathname,
        file,
        file.type,
      );

      setAlert("success");
      setEstado("idle");
      setFile(null);
      setPreviewUrl(null);
      onUploaded(publicUrl, file);
    } catch {
      setErrorMessage(labels.error);
      setAlert("error");
      setEstado("error");
    }
  }

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={(e) => onSelect(e.target.files?.[0])}
        className="font-body-md text-body-md text-on-surface"
      />
      <div className="flex items-center gap-3">
        {displayUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt=""
            className="h-16 w-16 rounded border border-outline-variant/60 object-cover"
          />
        )}
        {(status === "seleccionado" || status === "error") && (
          <button
            type="button"
            onClick={onUpload}
            className="w-fit rounded bg-on-surface px-4 py-1.5 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
          >
            {status === "error" ? labels.retry : labels.upload}
          </button>
        )}
        {status === "subiendo" && (
          <span className="font-body-md text-body-md text-on-surface-variant">
            {labels.uploading}
          </span>
        )}
      </div>
      {alert === "success" && (
        <p role="status" className="font-body-md text-body-md text-primary">
          {labels.success}
        </p>
      )}
      {alert === "error" && (
        <p role="alert" className="font-body-md text-body-md text-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
