import { getT, isLocale, type Locale } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "./_LoginForm";

export default async function IngresarPage({
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
      <h1 className="mb-6 text-xl font-semibold">{t("cuenta.loginTitle")}</h1>
      <LoginForm
        locale={locale}
        labels={{
          email: t("cuenta.email"),
          password: t("cuenta.password"),
          submit: t("cuenta.loginButton"),
          failed: t("cuenta.loginFailed"),
        }}
      />
      <p className="mt-4 text-sm text-gray-600">
        {t("cuenta.noAccount")}{" "}
        <Link href={`/${locale}/cuenta/registro`} className="text-brand underline">
          {t("cuenta.registerLink")}
        </Link>
      </p>
    </div>
  );
}
