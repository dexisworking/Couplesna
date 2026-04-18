import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/lib/admin-auth/session';

const schema = z.object({
  adminId: z.string().uuid(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const admin = createAdminSupabaseClient();

    const { data: adminUser, error: adminError } = await admin
      .from('profiles')
      .select('id,email,role')
      .eq('id', parsed.data.adminId)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminUser?.email) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 403 });
    }

    const { data: otpData, error: otpError } = await admin
      .from('admin_otps')
      .select('id')
      .eq('admin_id', parsed.data.adminId)
      .eq('code', parsed.data.code.toUpperCase())
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 });
    }

    await admin.from('admin_otps').delete().eq('admin_id', parsed.data.adminId);

    const token = createAdminSessionToken({
      id: adminUser.id,
      email: adminUser.email,
      role: 'admin',
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions(req.headers.get('host') || ''));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 }
    );
  }
}
