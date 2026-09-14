import Link from "next/link";
import type { Locale } from "@/lib/i18n/t";

export interface ContactValue {
  name: string;
  phone: string;
  comments: string;
  privacyAccepted: boolean;
}

/**
 * Nombre, correo, teléfono, comentarios opcionales y aceptación del
 * tratamiento de datos (FR-050, FR-051, FR-065 a FR-067, SC-019). Pide solo
 * estos cuatro datos.
 */
export function FormularioContacto({
  locale,
  value,
  onChange,
  labels,
}: {
  locale: Locale;
  value: ContactValue;
  onChange: (patch: Partial<ContactValue>) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span>{labels.name}</span>
        <input
          required
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.phone}</span>
        <input
          required
          value={value.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>
          {labels.comments} ({labels.optional})
        </span>
        <textarea
          value={value.comments}
          onChange={(e) => onChange({ comments: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.privacyAccepted}
          onChange={(e) => onChange({ privacyAccepted: e.target.checked })}
          className="mt-1"
        />
        <span>
          {labels.privacyPrefix}{" "}
          <Link href={`/${locale}/politica-privacidad`} className="underline">
            {labels.privacyLink}
          </Link>
        </span>
      </label>
    </div>
  );
}
