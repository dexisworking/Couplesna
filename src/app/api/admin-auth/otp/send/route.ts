import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const schema = z.object({
  adminId: z.string().uuid(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

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

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error: otpError } = await admin.from('admin_otps').insert({
      admin_id: parsed.data.adminId,
      code: otpCode,
      expires_at: expiresAt.toISOString(),
    });
    if (otpError) {
      return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 });
    }

    const fromEmail = process.env.ADMIN_AUTH_FROM_EMAIL || 'Couplesna Admin <auth@iamdex.codes>';
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Your Couplesna Admin Code</h2>
        <p>Use the code below to continue your admin login:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otpCode}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: fromEmail,
        to: adminUser.email,
        subject: `${otpCode} is your Couplesna admin code`,
        html,
      });
    } else {
      console.warn('RESEND_API_KEY missing. OTP for local testing:', otpCode);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 }
    );
  }
}
