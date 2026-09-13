import type { ReactElement } from "react";

/**
 * Iconos en línea para la lista fija de 7 plataformas de redes sociales
 * (010-panel-ajustes-generales, Clarificación 2026-09-13, FR-014). Sin
 * librería nueva (research.md #6): son SVG propios, suficientes para una
 * lista que no cambia sin tocar código.
 */
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "x"
  | "youtube"
  | "linkedin";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "tiktok",
  "whatsapp",
  "x",
  "youtube",
  "linkedin",
];

type IconProps = { className?: string };

function Instagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Facebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M13.5 21v-7h2.2l.3-2.6h-2.5V9.7c0-.75.2-1.26 1.28-1.26H16V6.1c-.24-.03-1.05-.1-2-.1-1.98 0-3.34 1.2-3.34 3.42v1.9H8.5v2.6h2.16V21"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTok({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 3v9.5a2.7 2.7 0 1 1-2.2-2.66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 3c.4 2.2 2.1 3.9 4.3 4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WhatsApp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.4 17.6 4 21l3.5-1.3A8.5 8.5 0 1 0 4.5 12.5a8.4 8.4 0 0 0 1.2 4.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9.2 10c.2 2.6 2.2 4.6 4.8 4.8.6 0 1-.5.9-1l-.2-.7a.7.7 0 0 0-.6-.5l-1.3-.2-1-1-.2-1.3a.7.7 0 0 0-.5-.6l-.7-.2c-.5-.1-1 .3-1 .9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XPlatform({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 5l14 14M19 5 5 19"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function YouTube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

function LinkedIn({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="7.5" cy="8" r="1.2" fill="currentColor" />
      <path d="M7.5 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M11.5 17v-3.5c0-1.4 1-2.5 2.2-2.5s2 1.1 2 2.5V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M11.5 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const SOCIAL_PLATFORM_ICONS: Record<
  SocialPlatform,
  (props: IconProps) => ReactElement
> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTok,
  whatsapp: WhatsApp,
  x: XPlatform,
  youtube: YouTube,
  linkedin: LinkedIn,
};
