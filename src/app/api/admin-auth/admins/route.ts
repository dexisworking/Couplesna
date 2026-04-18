import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

function deriveDisplayName(email: string, fullName: string | null) {
  if (fullName?.trim()) return fullName.trim();
  const local = email.split('@')[0] ?? '';
  const parts = local
    .split(/[._-]/)
    .map((p) => p.replace(/\d+$/, ''))
    .filter((p) => p.length > 0)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  return parts.join(' ') || 'Admin';
}

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role')
    .eq('role', 'admin')
    .order('email');

  if (error || !data) {
    return NextResponse.json([], { status: 200 });
  }

  const admins = data
    .filter((row) => row.email)
    .map((row) => ({
      id: row.id,
      name: deriveDisplayName(String(row.email), row.full_name),
    }));

  return NextResponse.json(admins);
}
