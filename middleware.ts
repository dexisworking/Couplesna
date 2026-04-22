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

  // --- DOMAIN PARTITION LOGIC ---
  const isCoupleAdmin = host.includes('coupleadmin.');

  if (isCoupleAdmin) {
    // 1. If we're on the admin subdomain and the path already starts with /admin,
    // it's redundant. Strip it to keep URLs clean (e.g. coupleadmin.../users instead of /admin/users).
    if (url.pathname.startsWith('/admin')) {
      const cleanPath = url.pathname.replace('/admin', '') || '/';
      const cleanUrl = new URL(cleanPath, request.url);
      return NextResponse.redirect(cleanUrl);
    }

    // 2. Rewrite everything on the admin subdomain into the /admin folder
    if (!url.pathname.startsWith('/api/admin-auth')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      const rewriteResponse = NextResponse.rewrite(url);
      // Preserve cookies for Supabase
      refreshedResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return rewriteResponse;
    }

    // 3. Auth check for the admin subdomain
    if (!adminSession && !isAdminLoginPath && !isAdminAuthApi) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  } else {
    // 4. If we're NOT on the admin subdomain but trying to access /admin, 
    // strictly forbid it or redirect to the proper home.
    if (isAdminPath && !isAdminAuthApi) {
      const adminUrl = new URL(request.url);
      adminUrl.hostname = 'coupleadmin.iamdex.codes';
      adminUrl.pathname = url.pathname.replace('/admin', '') || '/';
      return NextResponse.redirect(adminUrl);
    }
  }

  return refreshedResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
