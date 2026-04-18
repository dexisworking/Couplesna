import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieOptions } from '@/lib/admin-auth/session';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...getAdminSessionCookieOptions(req.headers.get('host') || ''),
    maxAge: 0,
  });
  return response;
}
