import type { APIRoute } from 'astro';
import { getEnv } from '../../../lib/db';
import { uploadToR2 } from '../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const form = await context.request.formData();

  const number = parseInt(String(form.get('number') || ''), 10);
  const year = parseInt(String(form.get('year') || ''), 10);
  const title = String(form.get('title') || '').trim();
  const description = String(form.get('description') || '').trim();
  const status = form.get('status') === 'published' ? 'published' : 'draft';
  const cover = form.get('cover') as File | null;
  const pdf = form.get('pdf') as File | null;

  if (!number || !year || !title) {
    return context.redirect('/admin/revista/nueva?error=' + encodeURIComponent('Número, año y título son obligatorios'));
  }

  let coverKey = '';
  if (cover && cover.size > 0) coverKey = await uploadToR2(env, cover, 'revista/portadas');

  let pdfKey = '';
  if (pdf && pdf.size > 0) pdfKey = await uploadToR2(env, pdf, 'revista/pdfs');

  await env.DB.prepare(
    `INSERT INTO editions (number, year, title, description, cover_key, pdf_key, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(number, year, title, description, coverKey, pdfKey, status).run();

  return context.redirect('/admin/revista?created=1');
};
