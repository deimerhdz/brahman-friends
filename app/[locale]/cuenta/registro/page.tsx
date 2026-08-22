import { getT, isLocale, type Locale } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RegistroForm } from "./_RegistroForm";

export default async function RegistroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = getT(locale);

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t("cuenta.registerTitle")}</h1>
      <RegistroForm
        locale={locale}
        labels={{
          name: t("cuenta.name"),
          email: t("cuenta.email"),
          password: t("cuenta.password"),
          submit: t("cuenta.registerButton"),
          emailTaken: t("cuenta.emailTaken"),
          failed: t("cuenta.registerFailed"),
        }}
      />
      <p className="mt-4 text-sm text-gray-600">
        {t("cuenta.hasAccount")}{" "}
        <Link href={`/${locale}/cuenta/ingresar`} className="text-brand underline">
          {t("cuenta.loginLink")}
        </Link>
      </p>
    </div>
  );
}
