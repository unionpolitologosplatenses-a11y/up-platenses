import type { APIRoute } from 'astro';
import { getEnv, type Note } from '../../../../lib/db';
import { deleteFromR2 } from '../../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const id = context.params.id;

  const existing = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first<Note>();
  if (existing) {
    await deleteFromR2(env, existing.image_key);
    await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
  }

  return context.redirect('/admin/notas?deleted=1');
};
