"use client";

import { useState } from "react";
import { SOCIAL_PLATFORM_ICONS, SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/ajustes/iconos-redes";
import { SeccionAjustes } from "./SeccionAjustes";

export interface RedSocial {
  id: string;
  platform: SocialPlatform;
  url: string;
}

/**
 * Alta/edición/baja de redes sociales (010-panel-ajustes-generales, FR-012 a
 * FR-014). Cada fila se guarda con su propia llamada al endpoint (mismo
 * patrón que la gestión de colores de un modelo), no como parte del `PUT`
 * de ajustes básicos.
 */
export function RedesSociales({
  initial,
  labels,
}: {
  initial: RedSocial[];
  labels: Record<string, string>;
}) {
  const [links, setLinks] = useState<RedSocial[]>(initial);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>(SOCIAL_PLATFORMS[0]);
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  async function onAdd() {
    setError(null);
    const response = await fetch("/api/panel/ajustes/redes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: newPlatform, url: newUrl }),
    });
    if (!response.ok) {
      setError(labels.invalidUrl);
      return;
    }
    const created = (await response.json()) as RedSocial;
    setLinks((prev) => [...prev, created]);
    setNewUrl("");
  }

  async function onSaveEdit(id: string) {
    setError(null);
    const response = await fetch(`/api/panel/ajustes/redes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: editingUrl }),
    });
    if (!response.ok) {
      setError(labels.invalidUrl);
      return;
    }
    const updated = (await response.json()) as RedSocial;
    setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
    setEditingId(null);
  }

  async function onDelete(id: string) {
    await fetch(`/api/panel/ajustes/redes/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <SeccionAjustes title={labels.sectionTitle} subtitle={labels.sectionSubtitle}>
      <div className="flex flex-col gap-2">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {labels.addNewTitle}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
            className="rounded border border-outline-variant px-3 py-2 font-body-md text-body-md text-on-surface"
          >
            {SOCIAL_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {labels[`platform_${platform}`]}
              </option>
            ))}
          </select>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={labels.urlPlaceholder}
            className="min-w-[16rem] flex-1 rounded border border-outline-variant px-3 py-2 font-body-md text-body-md text-on-surface"
          />
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {labels.add}
          </button>
        </div>
        {error && <p className="font-body-md text-body-md text-error">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {labels.linkedTitle}
        </span>
        {links.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{labels.empty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = SOCIAL_PLATFORM_ICONS[link.platform];
              return (
                <li
                  key={link.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface px-4 py-3"
                >
                  <Icon className="h-5 w-5 shrink-0 text-on-surface" />
                  <span className="w-24 shrink-0 font-body-md text-body-md font-semibold text-on-surface">
                    {labels[`platform_${link.platform}`]}
                  </span>
                  <span className="inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#A5D6A7] bg-[#E8F5E9] px-2.5 py-1 text-label-caps font-label-caps text-[#2E7D32]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {labels.active}
                  </span>
                  {editingId === link.id ? (
                    <input
                      value={editingUrl}
                      onChange={(e) => setEditingUrl(e.target.value)}
                      className="min-w-[12rem] flex-1 rounded border border-outline-variant px-2 py-1 font-body-md text-body-md text-on-surface"
                    />
                  ) : (
                    <span className="min-w-[8rem] flex-1 truncate font-body-md text-body-md text-on-surface-variant">
                      {link.url}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-1">
                    {editingId === link.id ? (
                      <button
                        type="button"
                        onClick={() => onSaveEdit(link.id)}
                        className="rounded px-2 py-1 font-label-caps text-label-caps text-primary underline"
                      >
                        {labels.save}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(link.id);
                          setEditingUrl(link.url);
                        }}
                        aria-label={labels.edit}
                        title={labels.edit}
                        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(link.id)}
                      aria-label={labels.remove}
                      title={labels.remove}
                      className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:text-error"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SeccionAjustes>
  );
}
