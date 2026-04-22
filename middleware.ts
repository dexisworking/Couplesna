import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const ADMIN_SESSION_COOKIE = 'couplesna_admin_session';
const ADMIN_SUBDOMAIN_PREFIX = 'coupleadmin.';
const INTERNAL_ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN_PATH = '/login';

const encoder = new TextEncoder();

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyEdgeAdminSession(token: string | undefined) {
  if (!token) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const secret = process.env.ADMIN_SESSION_SECRET || 'local-dev-admin-secret-change-me';
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const verified = await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), encoder.encode(encoded));
  if (!verified) return null;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(encoded));
    const payload = JSON.parse(payloadJson) as { exp?: number; role?: string };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000) || payload.role !== 'admin') {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const refreshedResponse = await updateSession(request);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = forwardedHost?.split(',')[0]?.trim() || request.headers.get('host') || '';
  const host = hostHeader.toLowerCase().split(':')[0];
  const url = request.nextUrl.clone();
  const isAdminSubdomain = host.startsWith(ADMIN_SUBDOMAIN_PREFIX);
  const isAdminPath = url.pathname === INTERNAL_ADMIN_PREFIX || url.pathname.startsWith(`${INTERNAL_ADMIN_PREFIX}/`);
  const isAdminAuthApi = url.pathname.startsWith('/api/admin-auth');
  const isLoginPath = url.pathname === ADMIN_LOGIN_PATH;

  if (url.pathname.startsWith('/_next') || url.pathname === '/favicon.ico') {
    return refreshedResponse;
  }
  if (url.pathname.startsWith('/api') && !isAdminAuthApi) {
    return refreshedResponse;
  }

  const requiresAdminGate = (isAdminSubdomain || isAdminPath) && !isAdminAuthApi;

  if (!requiresAdminGate) {
    return refreshedResponse;
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = await verifyEdgeAdminSession(token);

  if (isAdminSubdomain) {
    if (isAdminPath) {
      const cleanPath = url.pathname.replace(INTERNAL_ADMIN_PREFIX, '') || '/';
      return NextResponse.redirect(new URL(cleanPath, request.url));
    }

    if (!adminSession && !isLoginPath) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    if (adminSession && isLoginPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!isAdminAuthApi) {
      url.pathname =
        url.pathname === '/'
          ? INTERNAL_ADMIN_PREFIX
          : `${INTERNAL_ADMIN_PREFIX}${url.pathname}`;
      const rewriteResponse = NextResponse.rewrite(url);
      refreshedResponse.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c.name, c.value, c));
      return rewriteResponse;
    }
  } else if (isAdminPath && !isAdminAuthApi) {
    const adminUrl = new URL(request.url);
    adminUrl.hostname = `${ADMIN_SUBDOMAIN_PREFIX}${host.replace(/^www\./, '')}`;
    adminUrl.pathname = url.pathname.replace(INTERNAL_ADMIN_PREFIX, '') || '/';
    return NextResponse.redirect(adminUrl);
  }

  return refreshedResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
