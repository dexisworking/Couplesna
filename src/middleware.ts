import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Handle Subdomain Routing for Admin
  // Routes: coupleadmin.iamdex.codes -> internal /admin
  const isAdminSubdomain = hostname.startsWith('coupleadmin.');
  
  if (isAdminSubdomain) {
    // If user is on the admin subdomain but not at /admin internally, rewrite it.
    // NOTE: This assumes we have a /admin directory in src/app
    if (!url.pathname.startsWith('/admin')) {
        url.pathname = `/admin${url.pathname}`;
        return NextResponse.rewrite(url);
    }
  }

  // 2. Protect Admin Routes (both rewritten and direct)
  if (url.pathname.startsWith('/admin')) {
    if (!session) {
      // Not logged in -> redirect to login (landing page)
      const loginUrl = new URL('/', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin role
    // We check the profile table for the current user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      // Not an admin -> redirect to home/dashboard
      const dashboardUrl = new URL('/', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
