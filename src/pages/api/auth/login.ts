import type { APIRoute } from 'astro';
import { getEnv } from '../../../lib/db';
import { createSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const form = await context.request.formData();
  const password = String(form.get('password') || '');
  const redirect = String(form.get('redirect') || '/admin/dashboard');

  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return context.redirect('/admin?error=1');
  }

  const cookie = await createSessionCookie(context);
  return new Response(null, {
    status: 302,
    headers: { Location: redirect, 'Set-Cookie': cookie },
  });
};
