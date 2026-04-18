import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { validateAuthentication } from '@/lib/admin-auth/passkey';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/lib/admin-auth/session';

const schema = z.object({
  adminId: z.string().uuid(),
  response: z.unknown(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = createAdminSupabaseClient();
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id,email,role')
      .eq('id', parsed.data.adminId)
      .eq('role', 'admin')
      .single();
    if (adminError || !adminUser?.email) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 403 });
    }

    const { data: challengeRow } = await supabase
      .from('passkey_challenges')
      .select('id,challenge')
      .eq('admin_user_id', adminUser.id)
      .eq('type', 'authentication')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!challengeRow) return NextResponse.json({ error: 'Challenge missing or expired.' }, { status: 400 });

    const credentialId = (parsed.data.response as { id: string }).id;
    const { data: credentialRow } = await supabase
      .from('passkey_credentials')
      .select('credential_id,credential_public_key,counter')
      .eq('credential_id', credentialId)
      .eq('admin_user_id', adminUser.id)
      .single();
    if (!credentialRow) return NextResponse.json({ error: 'Passkey credential not found.' }, { status: 400 });

    const verification = await validateAuthentication(
      parsed.data.response as Parameters<typeof validateAuthentication>[0],
      challengeRow.challenge,
      {
        id: String(credentialRow.credential_id),
        publicKey: new Uint8Array(Buffer.from(String(credentialRow.credential_public_key), 'base64url')),
        counter: Number(credentialRow.counter),
      }
    );
    if (!verification.verified) return NextResponse.json({ error: 'Passkey verification failed.' }, { status: 401 });

    if (verification.authenticationInfo) {
      await supabase
        .from('passkey_credentials')
        .update({ counter: verification.authenticationInfo.newCounter })
        .eq('credential_id', credentialId);
    }
    await supabase.from('passkey_challenges').delete().eq('id', challengeRow.id);

    const token = createAdminSessionToken({
      id: adminUser.id,
      email: adminUser.email,
      role: 'admin',
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions(request.headers.get('host') || ''));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
