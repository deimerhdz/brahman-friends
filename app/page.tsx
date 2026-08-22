import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/t";

// Red de seguridad si el middleware no interceptó la raíz (FR-001, FR-002).
export default async function RootPage() {
  const store = await cookies();
  const saved = store.get("locale")?.value;
  const locale = saved && isLocale(saved) ? saved : defaultLocale;
  redirect(`/${locale}`);
}
