"use client";

import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { canPlaceDecoration } from "@/lib/design/rules";
import { VIEW_FOR_ZONE } from "@/lib/design/compose";
import type { DisplayView } from "./CapasGorra";
import { SubirLogo, type LogoSubido } from "./SubirLogo";
import { EditorTexto } from "./EditorTexto";

/**
 * Controles para agregar y editar decoraciones: aplica el máximo de zonas y
 * el único elemento por zona con sus mensajes (FR-045, SC-015).
 */
export function PanelDecoracion({
  manifest,
  view,
  decorations,
  maxZones,
  onAdd,
  onUpdate,
  onRemove,
  labels,
}: {
  manifest: ModelManifest;
  view: DisplayView;
  decorations: Decoration[];
  maxZones: number;
  onAdd: (decoration: Decoration) => boolean;
  onUpdate: (index: number, patch: Partial<Decoration>) => void;
  onRemove: (index: number) => void;
  labels: Record<string, string>;
}) {
  const zonesInView = manifest.zones.filter(
    (z) => VIEW_FOR_ZONE[z.position] === view,
  );
  if (zonesInView.length === 0) return null;

  const occupiedZones = decorations.map((d) => d.zone);

  return (
    <div className="flex flex-col gap-4 px-4">
      {zonesInView.map((zone) => {
        const index = decorations.findIndex((d) => d.zone === zone.position);
        const decoration = index >= 0 ? decorations[index] : null;
        const placement = canPlaceDecoration(occupiedZones, zone.position, maxZones);

        if (decoration) {
          return (
            <div key={zone.id} className="rounded border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{labels[`zone_${zone.position}`]}</p>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  {labels.removeElement}
                </button>
              </div>
              {decoration.kind === "text" ? (
                <EditorTexto
                  content={decoration.content}
                  font={decoration.font}
                  color={decoration.color}
                  maxChars={zone.maxTextChars}
                  onChange={(patch) => onUpdate(index, patch)}
                  labels={{ content: labels.textContent, font: labels.textFont, color: labels.textColor }}
                />
              ) : (
                <p className="text-sm text-gray-500">{labels.logoAdded}</p>
              )}
            </div>
          );
        }

        return (
          <div key={zone.id} className="rounded border border-dashed border-gray-300 p-3">
            <p className="mb-2 text-sm font-medium">{labels[`zone_${zone.position}`]}</p>
            {!placement.allowed && placement.reason === "max_zones" && (
              <p className="text-sm text-red-600">
                {labels.maxZonesReached.replace("{{max}}", String(maxZones))}
              </p>
            )}
            {placement.allowed && (
              <div className="flex flex-col gap-2">
                <SubirLogo
                  onUploaded={(logo: LogoSubido) => {
                    onAdd({
                      zone: zone.position,
                      kind: "logo",
                      logoAssetId: logo.logoAssetId,
                      url: logo.url,
                      widthCm: Math.min(zone.maxWidthCm, zone.maxWidthCm * 0.6),
                      heightCm: Math.min(zone.maxHeightCm, zone.maxHeightCm * 0.6),
                      offsetXPct: 0,
                      offsetYPct: 0,
                    });
                  }}
                  labels={{
                    uploading: labels.uploading,
                    error: labels.logoUploadError,
                    tooLarge: labels.logoTooLarge,
                    formatNotAllowed: labels.logoFormatNotAllowed,
                    lowResolution: labels.logoLowResolution,
                    opaqueBackground: labels.logoOpaqueBackground,
                    rightsNotice: labels.logoRightsNotice,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onAdd({
                      zone: zone.position,
                      kind: "text",
                      content: "",
                      font: "sans-bold",
                      color: "#111827",
                      widthCm: Math.min(zone.maxWidthCm, zone.maxWidthCm * 0.6),
                      heightCm: Math.min(zone.maxHeightCm, zone.maxHeightCm * 0.4),
                      offsetXPct: 0,
                      offsetYPct: 0,
                    });
                  }}
                  className="w-fit rounded bg-gray-100 px-3 py-1 text-sm"
                >
                  {labels.addText}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
