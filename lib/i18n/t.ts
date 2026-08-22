import es from "@/messages/es.json";
import en from "@/messages/en.json";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dictionaries: Record<Locale, Record<string, unknown>> = { es, en };

function lookup(dict: Record<string, unknown>, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      dict,
    );
}

/** Lector de traducciones sin librería (Principio II). `key` usa notación `a.b.c`. */
export function getT(locale: Locale) {
  const dict = dictionaries[locale];
  return function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    const value = lookup(dict, key);
    if (typeof value !== "string") {
      return key;
    }
    if (!params) return value;
    return Object.entries(params).reduce(
      (text, [name, val]) => text.replaceAll(`{{${name}}}`, String(val)),
      value,
    );
  };
}

export type T = ReturnType<typeof getT>;
