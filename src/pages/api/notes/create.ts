import type { APIRoute } from 'astro';
import { getEnv, slugify } from '../../../lib/db';
import { uploadToR2 } from '../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const form = await context.request.formData();

  const title = String(form.get('title') || '').trim();
  const author = String(form.get('author') || '').trim();
  const noteDate = String(form.get('note_date') || '').trim();
  const excerpt = String(form.get('excerpt') || '').trim();
  const content = String(form.get('content') || '').trim();
  const status = form.get('status') === 'published' ? 'published' : 'draft';
  const image = form.get('image') as File | null;

  if (!title || !noteDate) {
    return context.redirect('/admin/notas/nueva?error=' + encodeURIComponent('Título y fecha son obligatorios'));
  }

  let slug = slugify(title);
  const existing = await env.DB.prepare('SELECT id FROM notes WHERE slug = ?').bind(slug).first();
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  let imageKey = '';
  if (image && image.size > 0) {
    imageKey = await uploadToR2(env, image, 'notas');
  }

  await env.DB.prepare(
    `INSERT INTO notes (title, slug, author, note_date, image_key, excerpt, content, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, slug, author, noteDate, imageKey, excerpt, content, status).run();

  return context.redirect('/admin/notas?created=1');
};
