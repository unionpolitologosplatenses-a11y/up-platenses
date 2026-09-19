import type { Env } from './db';

/**
 * Sube un archivo (File) a R2 bajo un prefijo dado y devuelve la "key" con la que
 * se guarda. Esa key es lo único que se persiste en D1; el binario nunca pasa
 * por GitHub, vive solo en el bucket R2 del proyecto.
 */
export async function uploadToR2(env: Env, file: File, prefix: 'notas' | 'revista/portadas' | 'revista/pdfs'): Promise<string> {
  const safeName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
  const key = `${prefix}/${Date.now()}-${safeName}`;
  const buffer = await file.arrayBuffer();
  await env.FILES.put(key, buffer, {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return key;
}

export async function deleteFromR2(env: Env, key: string | null | undefined): Promise<void> {
  if (!key) return;
  await env.FILES.delete(key).catch(() => {});
}

/** Construye la URL pública (servida por /files/[...path]) para una key de R2. */
export function fileUrl(key: string | null | undefined): string {
  if (!key) return '';
  return `/files/${key}`;
}
