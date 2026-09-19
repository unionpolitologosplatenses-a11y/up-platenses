import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin', '/admin/']);
const PUBLIC_API_PATHS = new Set(['/api/auth/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminArea = pathname.startsWith('/admin');
  const isApiArea = pathname.startsWith('/api');

  if (!isAdminArea && !isApiArea) return next();
  if (isAdminArea && PUBLIC_ADMIN_PATHS.has(pathname)) return next();
  if (isApiArea && PUBLIC_API_PATHS.has(pathname)) return next();

  const authed = await isAuthenticated(context as any);

  if (!authed) {
    if (isApiArea) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin?redirect=' + encodeURIComponent(pathname));
  }

  return next();
});
