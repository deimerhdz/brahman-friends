import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { PanelNav } from "./_PanelNav";

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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <PanelNav locale={locale} userName={session.name} />
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
