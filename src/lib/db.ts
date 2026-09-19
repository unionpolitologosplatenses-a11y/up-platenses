import type { APIContext } from 'astro';

export interface Note {
  id: number;
  title: string;
  slug: string;
  author: string;
  note_date: string;
  image_key: string;
  excerpt: string;
  content: string;
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
