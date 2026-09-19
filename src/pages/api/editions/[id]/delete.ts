import type { APIRoute } from 'astro';
import { getEnv, type Edition } from '../../../../lib/db';
import { deleteFromR2 } from '../../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const id = context.params.id;

  const existing = await env.DB.prepare('SELECT * FROM editions WHERE id = ?').bind(id).first<Edition>();
  if (existing) {
    await deleteFromR2(env, existing.cover_key);
    await deleteFromR2(env, existing.pdf_key);
    await env.DB.prepare('DELETE FROM editions WHERE id = ?').bind(id).run();
  }

  return context.redirect('/admin/revista?deleted=1');
};
