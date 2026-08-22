import { NextResponse } from "next/server";

/**
 * Cuerpo de error del contrato de API: `{ error, detail }`, con `error` como
 * clave traducible por el navegador (Principio II: el servidor nunca
 * devuelve texto para el usuario, devuelve claves). Ver contracts/api.md.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail?: unknown,
  ) {
    super(code);
  }
}

export function apiError(
  status: number,
  code: string,
  detail?: unknown,
): NextResponse {
  return NextResponse.json(
    { error: code, ...(detail !== undefined ? { detail } : {}) },
    { status },
  );
}

// Atajos para los códigos usados en más de un sitio del contrato.
export const errors = {
  noAutorizado: () => apiError(401, "no_autorizado"),
  formatoNoPermitido: () => apiError(400, "formato_no_permitido"),
  archivoDemasiadoGrande: (maxMb: number) =>
    apiError(413, "archivo_demasiado_grande", { maxMb }),
  svgNoValidoTrasSaneo: () => apiError(422, "svg_no_valido_tras_saneo"),
  modeloNoDisponible: () => apiError(409, "modelo_no_disponible"),
  colorNoDisponible: (componentIds: string[]) =>
    apiError(409, "color_no_disponible", { componentIds }),
  tallasNoCuadran: () => apiError(422, "tallas_no_cuadran"),
  datosContactoInvalidos: () => apiError(400, "datos_contacto_invalidos"),
  decoracionInvalida: (detail?: unknown) =>
    apiError(422, "decoracion_invalida", detail),
  publicacionIncompleta: (detail: {
    missing: { component: string; color: string; view: string }[];
    missingBaseViews: string[];
    componentsWithoutColors: string[];
  }) => apiError(422, "publicacion_incompleta", detail),
  transicionNoPermitida: (from: string, allowed: string[]) =>
    apiError(409, "transicion_no_permitida", { from, allowed }),
  yaAnonimizada: () => apiError(409, "ya_anonimizada"),
  logoEliminado: () => apiError(410, "logo_eliminado"),
  credencialesInvalidas: () => apiError(401, "credenciales_invalidas"),
  correoYaRegistrado: () => apiError(409, "correo_ya_registrado"),
  datosInvalidos: (detail?: unknown) => apiError(400, "datos_invalidos", detail),
};

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return apiError(error.status, error.code, error.detail);
  }
  console.error(error);
  return apiError(500, "generic");
}
