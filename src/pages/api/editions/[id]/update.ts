import type { APIRoute } from 'astro';
import { getEnv, type Edition } from '../../../../lib/db';
import { uploadToR2, deleteFromR2 } from '../../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const id = context.params.id;
  const form = await context.request.formData();

  const existing = await env.DB.prepare('SELECT * FROM editions WHERE id = ?').bind(id).first<Edition>();
  if (!existing) return context.redirect('/admin/revista');

  const number = parseInt(String(form.get('number') || existing.number), 10);
  const year = parseInt(String(form.get('year') || existing.year), 10);
  const title = String(form.get('title') || existing.title).trim();
  const description = String(form.get('description') || '').trim();
  const status = form.get('status') === 'published' ? 'published' : 'draft';
  const cover = form.get('cover') as File | null;
  const pdf = form.get('pdf') as File | null;

  let coverKey = existing.cover_key;
  if (cover && cover.size > 0) {
    await deleteFromR2(env, existing.cover_key);
    coverKey = await uploadToR2(env, cover, 'revista/portadas');
  }

  let pdfKey = existing.pdf_key;
  if (pdf && pdf.size > 0) {
    await deleteFromR2(env, existing.pdf_key);
    pdfKey = await uploadToR2(env, pdf, 'revista/pdfs');
  }

  await env.DB.prepare(
    `UPDATE editions SET number=?, year=?, title=?, description=?, cover_key=?, pdf_key=?, status=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).bind(number, year, title, description, coverKey, pdfKey, status, id).run();

  return context.redirect('/admin/revista?updated=1');
};
