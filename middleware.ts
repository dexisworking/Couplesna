import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getPublicSupabaseEnv, isSupabaseConfigured } from '@/lib/supabase/env';

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
  const requiresAdminGate = isAdminSubdomain || isAdminPath;

  if (!requiresAdminGate) {
    return refreshedResponse;
  }

  const { url: supabaseUrl, anonKey } = getPublicSupabaseEnv();
  const response = refreshedResponse;
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // After auth/role checks, route admin subdomain traffic into /admin namespace.
  if (isAdminSubdomain && !isAdminPath) {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
