import type { AjustesSitio } from "@/lib/ajustes/consultas";

const MIN_DIGITOS = 7;

function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Extrae el número de un enlace de WhatsApp (`wa.me/<n>`, `?phone=<n>`), o `null`. */
function numeroDeEnlace(url: string): string | null {
  const telefono = url.match(/[?&]phone=([^&#]+)/);
  if (telefono) return soloDigitos(decodeURIComponent(telefono[1]!));
  const waMe = url.match(/wa\.me\/([^/?#]+)/);
  if (waMe) return soloDigitos(waMe[1]!);
  return null;
}

/**
 * Número del negocio para los enlaces de WhatsApp (011-rediseno-paleta-inicio,
 * research.md #6, FR-027): primero la red social WhatsApp configurada en
 * Ajustes, después el teléfono de contacto. `null` si ninguno da un número
 * utilizable, y en ese caso los botones de WhatsApp no se muestran.
 */
export function numeroWhatsApp(
  ajustes: Pick<AjustesSitio, "contactPhone" | "socialLinks">,
): string | null {
  const red = ajustes.socialLinks.find((link) => link.platform === "whatsapp");
  const candidatos = [
    red ? numeroDeEnlace(red.url) : null,
    ajustes.contactPhone ? soloDigitos(ajustes.contactPhone) : null,
  ];
  return (
    candidatos.find((n): n is string => !!n && n.length >= MIN_DIGITOS) ?? null
  );
}

export function enlaceWhatsApp(numero: string, texto: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
