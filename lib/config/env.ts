function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function optionalInt(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get r2AccountId() {
    return required("R2_ACCOUNT_ID");
  },
  get r2AccessKeyId() {
    return required("R2_ACCESS_KEY_ID");
  },
  get r2SecretAccessKey() {
    return required("R2_SECRET_ACCESS_KEY");
  },
  get r2Bucket() {
    return required("R2_BUCKET_NAME");
  },
  get r2PublicBaseUrl() {
    return required("R2_PUBLIC_BASE_URL");
  },
  get resendApiKey() {
    return required("RESEND_API_KEY");
  },
  get adminNotifyEmail() {
    return required("ADMIN_NOTIFY_EMAIL");
  },
  get sessionSecret() {
    return required("SESSION_SECRET");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  /** Peso máximo de un logotipo, en MB. ⚠ Pendiente de confirmar con la fábrica. */
  get maxLogoMb() {
    return optionalInt("MAX_LOGO_MB", 5);
  },
  /** Formatos de logotipo aceptados. ⚠ Pendiente de confirmar con la fábrica. */
  get logoFormats(): string[] {
    return (process.env.LOGO_FORMATS ?? "png,svg,jpg")
      .split(",")
      .map((f) => f.trim().toLowerCase())
      .filter(Boolean);
  },
  /**
   * Valor por defecto al crear una zona nueva. El límite efectivo de una zona
   * ya creada es `decoration_zone.max_text_chars`, nunca este valor.
   */
  get defaultZoneTextChars() {
    return optionalInt("DEFAULT_ZONE_TEXT_CHARS", 20);
  },
  /** Máximo de zonas decoradas por diseño (las 4 zonas disponibles: frontal, lateral izquierdo, lateral derecho y trasera). */
  get maxDecoratedZones() {
    return optionalInt("MAX_DECORATED_ZONES", 4);
  },
};
