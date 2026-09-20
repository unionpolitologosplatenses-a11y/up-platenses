import type { APIRoute } from 'astro';
import { getEnv, type Note, NOTE_CATEGORIES, type NoteCategory } from '../../../../lib/db';
import { uploadToR2, deleteFromR2 } from '../../../../lib/r2';

export const prerender = false;

const VALID_CATEGORIES = new Set(NOTE_CATEGORIES.map((c) => c.value));

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const id = context.params.id;
  const form = await context.request.formData();

  const existing = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first<Note>();
  if (!existing) return context.redirect('/admin/notas');

  const title = String(form.get('title') || existing.title).trim();
  const author = String(form.get('author') || '').trim();
  const noteDate = String(form.get('note_date') || existing.note_date).trim();
  const excerpt = String(form.get('excerpt') || '').trim();
  const content = String(form.get('content') || '').trim();
  const status = form.get('status') === 'published' ? 'published' : 'draft';
  const categoryRaw = String(form.get('category') || existing.category);
  const category: NoteCategory = VALID_CATEGORIES.has(categoryRaw as NoteCategory) ? (categoryRaw as NoteCategory) : 'otros';
  const image = form.get('image') as File | null;

  let imageKey = existing.image_key;
  if (image && image.size > 0) {
    await deleteFromR2(env, existing.image_key);
    imageKey = await uploadToR2(env, image, 'notas');
  }

  await env.DB.prepare(
    `UPDATE notes SET title=?, author=?, note_date=?, image_key=?, excerpt=?, content=?, category=?, status=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).bind(title, author, noteDate, imageKey, excerpt, content, category, status, id).run();

  return context.redirect('/admin/notas?updated=1');
};
