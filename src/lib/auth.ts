import type { APIContext } from 'astro';
import { getEnv } from './db';

const COOKIE_NAME = 'up_admin_session';
const SESSION_HOURS = 12;

function toBase64Url(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const str = atob(padded);
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Crea un token firmado "payloadBase64.firmaBase64" con expiración incluida en el payload. */
async function signToken(secret: string, expiresAt: number): Promise<string> {
  const payload = JSON.stringify({ exp: expiresAt });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

async function verifyToken(secret: string, token: string): Promise<boolean> {
  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return false;
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(sigB64),
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function createSessionCookie(context: APIContext): Promise<string> {
  const env = getEnv(context);
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = await signToken(env.ADMIN_SECRET, expiresAt);
  const maxAge = SESSION_HOURS * 60 * 60;
  const secure = new URL(context.request.url).protocol === 'https:';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function isAuthenticated(context: APIContext | { locals: App.Locals; cookies: any }): Promise<boolean> {
  const env = getEnv(context as any);
  const token = (context as any).cookies?.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(env.ADMIN_SECRET, token);
}

export { COOKIE_NAME };
