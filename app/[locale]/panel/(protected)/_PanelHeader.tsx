import Link from "next/link";

export function PanelHeader({
  eyebrow,
  title,
  primaryAction,
  children,
}: {
  eyebrow?: string;
  title: string;
  primaryAction?: { label: string; href: string; icon?: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-8">
      <div>
        {eyebrow && (
          <p className="mb-2 text-label-caps font-label-caps uppercase text-on-surface-variant">
            {eyebrow}
          </p>
        )}
        <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {primaryAction && (
          <Link
            href={primaryAction.href}
            className="flex items-center gap-2 rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
          >
            {primaryAction.icon && (
              <span className="material-symbols-outlined text-[18px]">
                {primaryAction.icon}
              </span>
            )}
            {primaryAction.label}
          </Link>
        )}
      </div>
    </header>
  );
}
