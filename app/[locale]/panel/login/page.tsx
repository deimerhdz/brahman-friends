import { getT, isLocale, type Locale } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import { LoginForm } from "./_LoginForm";

export default async function LoginPage({
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
      <h1 className="mb-6 text-xl font-semibold">{t("auth.loginTitle")}</h1>
      <LoginForm
        locale={locale}
        labels={{
          email: t("auth.email"),
          password: t("auth.password"),
          submit: t("auth.loginButton"),
          failed: t("auth.loginFailed"),
        }}
      />
    </div>
  );
}
