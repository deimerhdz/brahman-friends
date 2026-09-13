import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { NavBar } from "@/app/_components/landing/NavBar";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";

export default async function SiteLayout({
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
