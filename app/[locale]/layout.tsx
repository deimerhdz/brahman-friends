import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { SetHtmlLang } from "@/app/_components/SetHtmlLang";
import { NavBar } from "@/app/_components/landing/NavBar";

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

  return (
    <>
      <SetHtmlLang lang={locale} />
      <NavBar locale={locale} />
      <main className="pt-20">{children}</main>
    </>
  );
}
