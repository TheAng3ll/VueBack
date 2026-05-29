import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Carpeta donde Vite sirve archivos estáticos: VueFront/public/imagenes */
export const IMAGENES_RECETAS_DIR =
  process.env.IMAGENES_RECETAS_DIR?.trim() ||
  path.resolve(__dirname, '../../../VueFront/public/imagenes');

export const IMAGENES_RECETAS_URL_PREFIX = '/imagenes';

const EXTENSIONES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function asegurarDirectorioImagenes() {
  fs.mkdirSync(IMAGENES_RECETAS_DIR, { recursive: true });
}

export function extensionPermitida(ext) {
  return EXTENSIONES_PERMITIDAS.has(ext.toLowerCase());
}

export function slugificarNombre(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);
}

/**
 * Normaliza la URL guardada en `fotos.url` (ruta local /imagenes/...).
 */
export function normalizarUrlImagenReceta(valor) {
  const raw = valor?.trim();
  if (!raw) return null;

  if (raw.startsWith(`${IMAGENES_RECETAS_URL_PREFIX}/`)) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith(`${IMAGENES_RECETAS_URL_PREFIX}/`)) {
      return parsed.pathname;
    }
  } catch {
    /* no es URL absoluta */
  }

  if (raw.startsWith('imagenes/')) {
    return `/${raw}`;
  }

  return raw;
}
