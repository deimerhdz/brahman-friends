import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { NavBar } from "@/app/_components/landing/NavBar";

// La barra pública (NavBar) ya no se renderiza para el resto del panel
// (ver app/[locale]/panel/(protected)/layout.tsx), pero /panel/login sigue
// fuera de esa protección y conserva su apariencia actual a propósito
// (FR-009, FR-012 de specs/004-rediseno-panel-admin/spec.md).
export default async function PanelLoginLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  return (
    <>
      <NavBar locale={locale} />
      <main className="pt-20">{children}</main>
    </>
  );
}
