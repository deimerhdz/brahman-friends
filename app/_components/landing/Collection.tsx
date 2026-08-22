import Image from "next/image";
import Link from "next/link";
import type { T } from "@/lib/i18n/t";

export type TarjetaModelo = {
  id: string;
  name: string;
  description: string;
  frontImageUrl: string | null;
  href: string;
};

export function Collection({
  t,
  models,
}: {
  t: T;
  models: TarjetaModelo[];
}) {
  return (
    <section id="collection" className="w-full bg-surface py-section-gap">
      <div className="mx-auto w-full max-w-[1440px] px-margin-mobile md:px-margin-desktop">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="mb-4 block text-label-caps font-label-caps tracking-[0.2em] text-primary">
              {t("landing.collection.eyebrow")}
            </span>
            <h2 className="text-headline-md font-headline-md text-on-surface">
              {t("landing.collection.title")}
            </h2>
          </div>
          <a
            href="#collection"
            className="hidden items-center gap-2 border-b border-on-surface pb-1 text-button font-button text-on-surface transition-colors hover:border-primary hover:text-primary md:inline-flex"
          >
            {t("landing.collection.exploreAll")}
          </a>
        </div>

        {models.length === 0 ? (
          <p className="text-body-md font-body-md text-on-surface-variant">
            {t("home.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {models.map((model) => (
              <Link key={model.id} href={model.href} className="group cursor-pointer">
                <div className="ambient-shadow ghost-border relative mb-6 flex h-[400px] items-center justify-center overflow-hidden bg-surface-container-lowest">
                  {model.frontImageUrl ? (
                    <Image
                      src={model.frontImageUrl}
                      alt={model.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={model.name}
                      className="h-full w-full bg-surface-container"
                    />
                  )}
                </div>
                <div className="ghost-border flex items-center justify-between bg-surface-container-lowest p-4">
                  <div>
                    <h3 className="text-body-lg font-body-lg font-medium text-on-surface">
                      {model.name}
                    </h3>
                    <span className="mt-1 block text-label-caps font-label-caps text-on-surface-variant">
                      {model.description}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
