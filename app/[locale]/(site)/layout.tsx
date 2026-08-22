import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/t";
import { NavBar } from "@/app/_components/landing/NavBar";

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

  return (
    <>
      <NavBar locale={locale} />
      <main className="pt-20">{children}</main>
    </>
  );
}
