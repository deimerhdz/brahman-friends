import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { PanelNav } from "./_PanelNav";
import { MobilePanelNav } from "./_MobilePanelNav";

// Todas las pantallas del panel viven bajo este grupo de rutas (no cambia la
// URL) para que /panel/login quede fuera de la protección y no genere un
// bucle de redirección (FR-057, SC-022).
export default async function PanelProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/panel/login`);
  }

  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;

  return (
    <div className="min-h-screen bg-surface-bright">
      <div className="fixed left-0 top-0 z-40 hidden h-full lg:flex">
        <PanelNav
          locale={locale}
          userName={session.name}
          siteName={siteName}
          logoUrl={ajustes.logoUrl}
        />
      </div>
      <MobilePanelNav
        locale={locale}
        userName={session.name}
        siteName={siteName}
        logoUrl={ajustes.logoUrl}
      />
      <main className="min-h-screen lg:ml-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
