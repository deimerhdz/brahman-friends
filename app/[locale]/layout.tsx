import Link from "next/link";
import { notFound } from "next/navigation";
import { getT, isLocale, type Locale } from "@/lib/i18n/t";
import { SelectorIdioma } from "@/app/_components/SelectorIdioma";
import { SetHtmlLang } from "@/app/_components/SetHtmlLang";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

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
  const t = getT(locale);

  return (
    <>
      <SetHtmlLang lang={locale} />
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <Link href={`/${locale}`} className="font-semibold text-brand">
          {t("common.siteName")}
        </Link>
        <SelectorIdioma locale={locale} label={t("nav.languageSelector")} />
      </header>
      <main>{children}</main>
    </>
  );
}
