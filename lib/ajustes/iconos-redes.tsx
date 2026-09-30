import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

/**
 * Iconos para la lista fija de 7 plataformas de redes sociales
 * (010-panel-ajustes-generales, Clarificación 2026-09-13, FR-014). Usa los
 * iconos de marca de Font Awesome 6 (`react-icons/fa6`).
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

export const SOCIAL_PLATFORM_ICONS: Record<SocialPlatform, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  x: FaXTwitter,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
};
