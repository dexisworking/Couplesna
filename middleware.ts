import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const ADMIN_SESSION_COOKIE = 'couplesna_admin_session';

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
  const isAdminSubdomain = host.startsWith('coupleadmin.');
  const isAdminPath = url.pathname.startsWith('/admin');
  const isAdminAuthApi = url.pathname.startsWith('/api/admin-auth');
  const isAdminLoginPath = url.pathname === '/admin/login';

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

  // After auth/role checks, route admin subdomain traffic into /admin namespace.
  if (isAdminSubdomain && !isAdminPath) {
    url.pathname = `/admin${url.pathname}`;
    if (!adminSession && url.pathname !== '/admin/login') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
    if (adminSession && url.pathname === '/admin/login') {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin';
      return NextResponse.redirect(dashboardUrl);
    }
    const rewriteResponse = NextResponse.rewrite(url);
    refreshedResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return rewriteResponse;
  }

  if (!adminSession && !isAdminLoginPath) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (adminSession && isAdminLoginPath) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return refreshedResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
