import { NextResponse } from 'next/server';
import { getSupabaseHealth } from '@/lib/server/couplesna';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        status: 'degraded',
        configured: false,
        timestamp: new Date().toISOString(),
        message: 'Supabase environment variables are not configured.',
      },
      { status: 200 }
    );
  }

  const health = await getSupabaseHealth();

  return NextResponse.json(
    {
      status: health.ok ? 'healthy' : 'degraded',
      configured: true,
      timestamp: new Date().toISOString(),
      message: health.message,
    },
    { status: health.ok ? 200 : 503 }
  );
}
