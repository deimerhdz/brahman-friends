import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { NavBar } from "@/app/_components/landing/NavBar";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";

// Estos layouts leen los ajustes del sitio (nombre y logo) de la base de datos: sin esto Next
// intenta prerenderizar las páginas hijas en el build, donde DATABASE_URL puede no existir, y
// además congelaría el nombre/logo en el momento del despliegue.
export const dynamic = "force-dynamic";

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
  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;

  return (
    <>
      <NavBar locale={locale} siteName={siteName} logoUrl={ajustes.logoUrl} />
      <main className="pt-20">{children}</main>
    </>
  );
}
