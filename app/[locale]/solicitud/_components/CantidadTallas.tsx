"use client";

import { sizesMatchQuantity, totalOf, type SizeQuantity } from "@/lib/solicitud/tallas";

/** Cantidad y distribución por talla, bloqueado mientras no cuadren (FR-048, SC-017). */
export function CantidadTallas({
  modelSizes,
  quantity,
  sizes,
  onQuantityChange,
  onSizeChange,
  labels,
}: {
  modelSizes: string[];
  quantity: number;
  sizes: SizeQuantity[];
  onQuantityChange: (quantity: number) => void;
  onSizeChange: (label: string, quantity: number) => void;
  labels: Record<string, string>;
}) {
  const total = totalOf(sizes);
  const matches = sizesMatchQuantity(sizes, quantity);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>{labels.quantity}</span>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{labels.sizeBreakdown}</p>
        {modelSizes.map((label) => (
          <label key={label} className="flex items-center justify-between gap-2">
            <span>{label}</span>
            <input
              type="number"
              min={0}
              value={sizes.find((s) => s.label === label)?.quantity ?? 0}
              onChange={(e) => onSizeChange(label, Number(e.target.value))}
              className="w-24 rounded border border-gray-300 px-2 py-1"
            />
          </label>
        ))}
      </div>

      <p className={matches ? "text-green-700" : "text-red-600"}>
        {matches
          ? labels.matches
          : labels.mismatch.replace("{{total}}", String(total)).replace("{{quantity}}", String(quantity))}
      </p>
    </div>
  );
}
