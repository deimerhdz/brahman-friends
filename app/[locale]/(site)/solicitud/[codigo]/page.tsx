import Link from "next/link";
import { getT, type Locale } from "@/lib/i18n/t";

// Confirmación con el código y el aviso de posible demora si el correo
// quedó pendiente (FR-052, FR-056a, RN18, SC-020, SC-020a). No consulta la
// base de datos por código: el código y el estado de la notificación llegan
// de la propia navegación tras enviar, no se recuperan diseños por código
// (contracts/api.md, "Lo que deliberadamente no existe").
export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; codigo: string }>;
  searchParams: Promise<{ pending?: string }>;
}) {
  const { locale, codigo } = await params;
  const { pending } = await searchParams;
  const t = getT(locale);
  const notificationPending = pending === "true";

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <h1 className="mb-2 text-xl font-semibold">{t("solicitud.confirmedTitle")}</h1>
      <p className="mb-4 text-3xl font-bold text-brand">{codigo}</p>
      <p className="mb-4 text-sm text-gray-600">{t("solicitud.confirmedBody")}</p>
      {notificationPending && (
        <p className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
          {t("solicitud.notificationPending")}
        </p>
      )}
      <p className="mb-6 text-sm text-gray-600">{t("solicitud.followUpNotice")}</p>
      <Link href={`/${locale}`} className="text-brand underline">
        {t("nav.home")}
      </Link>
    </div>
  );
}
