import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const key = context.params.path;
  if (!key) return new Response('No encontrado', { status: 404 });

  const object = await env.FILES.get(key);
  if (!object) return new Response('No encontrado', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
};
