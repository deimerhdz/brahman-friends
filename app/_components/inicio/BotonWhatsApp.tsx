import { SOCIAL_PLATFORM_ICONS } from "@/lib/ajustes/iconos-redes";
import { enlaceWhatsApp } from "@/lib/ajustes/whatsapp";

const IconoWhatsApp = SOCIAL_PLATFORM_ICONS.whatsapp;

// Botón flotante de WhatsApp (FR-027): sin número configurado no se muestra.
export function BotonWhatsApp({
  numero,
  texto,
  etiqueta,
}: {
  numero: string | null;
  texto: string;
  etiqueta: string;
}) {
  if (!numero) return null;

  return (
    <a
      href={enlaceWhatsApp(numero, texto)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={etiqueta}
      title={etiqueta}
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-xl transition-opacity hover:opacity-90"
    >
      <IconoWhatsApp className="h-7 w-7" />
    </a>
  );
}
