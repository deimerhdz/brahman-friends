import Link from "next/link";
import { getT, type Locale } from "@/lib/i18n/t";
import { LogoutButton } from "./_LogoutButton";

export function PanelNav({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const t = getT(locale);
  const base = `/${locale}/panel`;

  const links = [
    { href: `${base}/modelos`, label: t("nav.models") },
    { href: `${base}/colores`, label: t("nav.colors") },
    { href: `${base}/tecnicas`, label: t("nav.techniques") },
    { href: `${base}/solicitudes`, label: t("nav.requests") },
  ];

  return (
    <nav className="flex shrink-0 flex-col gap-2 border-b border-gray-200 p-4 md:w-48 md:border-b-0 md:border-r">
      <p className="mb-2 text-sm text-gray-500">{userName}</p>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-brand">
          {link.label}
        </Link>
      ))}
      <LogoutButton locale={locale} label={t("nav.logout")} />
    </nav>
  );
}
