import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/catalogo/precio";

export type TarjetaModelo = {
  id: string;
  name: string;
  frontImageUrl: string | null;
  type: "configurable" | "fixed_product";
  // Solo un "Producto fijo" (009-modelos-producto-fijo) trae precio; un
  // modelo configurable se cotiza, así que queda en null.
  price: string | null;
  href: string;
};

export function TarjetaModeloCard({
  model,
  viewDetailsLabel,
  customizeLabel,
}: {
  model: TarjetaModelo;
  viewDetailsLabel: string;
  customizeLabel: string;
}) {
  return (
    <Link href={model.href} className="group cursor-pointer">
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
      <div className="ghost-border flex flex-col gap-3 bg-surface-container-lowest p-4">
        <h3 className="text-body-lg font-body-lg font-medium text-on-surface">
          {model.name}
        </h3>
        <div className="flex items-center justify-between gap-3">
          {model.price ? (
            <span className="text-body-lg font-body-lg font-medium text-on-surface">
              {formatUsd(model.price)}
            </span>
          ) : (
            <span />
          )}
          <span className="whitespace-nowrap rounded-full border border-on-surface px-4 py-1.5 text-button font-button text-on-surface transition-colors group-hover:bg-on-surface group-hover:text-on-primary">
            {model.type === "fixed_product" ? viewDetailsLabel : customizeLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
