import type { APIContext } from 'astro';

export type NoteCategory = 'local' | 'nacional' | 'internacional' | 'otros';

export const NOTE_CATEGORIES: { value: NoteCategory; label: string }[] = [
  { value: 'local', label: 'Política Local' },
  { value: 'nacional', label: 'Política Nacional' },
  { value: 'internacional', label: 'Política Internacional' },
  { value: 'otros', label: 'Otros' },
];

export interface Note {
  id: number;
  title: string;
  slug: string;
  author: string;
  note_date: string;
  image_key: string;
  excerpt: string;
  content: string;
  category: NoteCategory;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Edition {
  id: number;
  number: number;
  year: number;
  title: string;
  description: string;
  cover_key: string;
  pdf_key: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Institutional {
  id: 1;
  home_tagline: string;
  home_intro: string;
  mission: string;
  objectives: string;
  activities: string;
  contact_email: string;
  contact_address: string;
  updated_at: string;
}

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  ADMIN_PASSWORD: string;
  ADMIN_SECRET: string;
}

/** Obtiene los bindings de Cloudflare (D1, R2, secretos) desde el contexto de Astro. */
export function getEnv(context: APIContext | { locals: App.Locals }): Env {
  const env = (context.locals as any)?.runtime?.env;
  if (!env) {
    throw new Error(
      'No se encontraron los bindings de Cloudflare. En desarrollo local corré `astro dev` ' +
        '(platformProxy simula D1/R2); en producción verificá que DB y FILES estén enlazados en Cloudflare Pages.'
    );
  }
  return env as Env;
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/** Clases de color por categoría, usadas en las etiquetas (NoteCard, detalle de nota, admin). */
export function categoryStyle(category: NoteCategory): { badge: string; label: string } {
  const found = NOTE_CATEGORIES.find((c) => c.value === category) ?? NOTE_CATEGORIES[3];
  const styles: Record<NoteCategory, string> = {
    local: 'bg-celeste/15 text-celeste',
    nacional: 'bg-esmeralda-light text-esmeralda',
    internacional: 'bg-fucsia/10 text-fucsia',
    otros: 'bg-ink/10 text-ink/60',
  };
  return { badge: styles[category] ?? styles.otros, label: found.label };
}
