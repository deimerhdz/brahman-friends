import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { SetHtmlLang } from "@/app/_components/SetHtmlLang";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

// La barra pública (NavBar) ya no se monta acá: vive en app/[locale]/(site)/layout.tsx
// (páginas públicas) y en app/[locale]/panel/login/layout.tsx (login del panel), para
// que el panel administrativo protegido nunca la reciba (specs/004-rediseno-panel-admin).
export default async function LocaleLayout({
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
      <SetHtmlLang lang={locale} />
      {children}
    </>
  );
}
