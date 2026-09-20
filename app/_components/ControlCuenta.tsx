import { getCustomerSession } from "@/lib/auth/customer-session";
import { getT, type Locale } from "@/lib/i18n/t";
import { CerrarSesionCliente } from "./CerrarSesionCliente";

// Control de cuenta de cliente en el encabezado compartido (FR-001, FR-006,
// FR-007): visible en toda página, incluida la de inicio.
export async function ControlCuenta({ locale }: { locale: Locale }) {
  const t = getT(locale);
  const session = await getCustomerSession();

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span>{session.name}</span>
        <CerrarSesionCliente locale={locale} label={t("cuenta.logout")} />
      </div>
    );
  }

  return null;
}
