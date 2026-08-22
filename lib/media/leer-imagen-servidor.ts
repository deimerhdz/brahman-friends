/**
 * Lee dimensiones y transparencia de una imagen en el servidor sin ninguna
 * librería (Principio I): se leen los encabezados binarios directamente.
 * Alcance intencionalmente acotado a lo que FR-037/FR-038 piden: PNG, JPEG y
 * SVG, que son los únicos formatos que `LOGO_FORMATS` permite.
 */

export interface ImageInfo {
  width: number | null;
  height: number | null;
  /** `null` cuando no se pudo determinar (por ejemplo, SVG sin viewBox). */
  hasTransparency: boolean | null;
}

export function readImageInfo(buffer: Buffer, mime: string): ImageInfo {
  if (mime === "image/png") return readPng(buffer);
  if (mime === "image/jpeg") return readJpeg(buffer);
  if (mime === "image/svg+xml") return readSvg(buffer.toString("utf8"));
  return { width: null, height: null, hasTransparency: null };
}

function readPng(buffer: Buffer): ImageInfo {
  const isPng =
    buffer.length > 33 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (!isPng) return { width: null, height: null, hasTransparency: null };

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer.readUInt8(25);
  // 4 = escala de grises + alfa, 6 = RGBA. 3 (paleta) puede tener transparencia
  // vía el bloque tRNS, que no se analiza aquí: se asume opaca por defecto.
  const hasTransparency = colorType === 4 || colorType === 6;

  return { width, height, hasTransparency };
}

function readJpeg(buffer: Buffer): ImageInfo {
  let offset = 2; // salta el marcador SOI (0xFFD8)
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const isSof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isSof) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      // JPEG nunca tiene canal alfa: el fondo siempre se produce tal cual.
      return { width, height, hasTransparency: false };
    }
    const segmentLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }
  return { width: null, height: null, hasTransparency: false };
}

function readSvg(content: string): ImageInfo {
  const viewBoxMatch = content.match(/viewBox=["']([\d.\-\s]+)["']/i);
  const widthMatch = content.match(/\bwidth=["'](\d+(?:\.\d+)?)/i);
  const heightMatch = content.match(/\bheight=["'](\d+(?:\.\d+)?)/i);

  let width: number | null = widthMatch ? Number(widthMatch[1]) : null;
  let height: number | null = heightMatch ? Number(heightMatch[1]) : null;

  if ((!width || !height) && viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
    if (parts.length === 4) {
      width = width ?? parts[2];
      height = height ?? parts[3];
    }
  }

  // Un SVG es vectorial: se asume transparente salvo que declare fondo
  // explícito, algo que no vale la pena detectar de forma confiable acá.
  return { width, height, hasTransparency: null };
}
