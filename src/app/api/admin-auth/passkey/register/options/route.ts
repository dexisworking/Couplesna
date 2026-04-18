import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createRegistrationOptions } from '@/lib/admin-auth/passkey';

const schema = z.object({
  adminId: z.string().uuid(),
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

    const { data: creds } = await supabase
      .from('passkey_credentials')
      .select('credential_id')
      .eq('admin_user_id', adminUser.id);
    const options = await createRegistrationOptions(
      adminUser.email,
      adminUser.id,
      (creds || []).map((cred) => String(cred.credential_id))
    );

    await supabase.from('passkey_challenges').insert({
      admin_user_id: adminUser.id,
      challenge: options.challenge,
      type: 'registration',
    });

    return NextResponse.json({ data: options });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
