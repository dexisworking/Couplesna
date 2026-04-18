import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'couplesna_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSessionPayload = {
  sub: string;
  role: 'admin';
  email: string;
  exp: number;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'local-dev-admin-secret-change-me';
}

function toBase64Url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string) {
  return createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
}

export function createAdminSessionToken(user: { id: string; email: string; role: 'admin' }) {
  const payload: AdminSessionPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const expected = sign(encoded);
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encoded)) as AdminSessionPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (payload.role !== 'admin') return null;
  return payload;
}

export function getAdminSessionCookieOptions(host: string) {
  const safeHost = host.toLowerCase();
  const domain = safeHost.includes('iamdex.codes') ? '.iamdex.codes' : undefined;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    domain,
  };
}
