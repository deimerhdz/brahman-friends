import type { ReactNode } from "react";

/** Tarjeta de sección compartida por todos los bloques de Ajustes. */
export function SeccionAjustes({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
