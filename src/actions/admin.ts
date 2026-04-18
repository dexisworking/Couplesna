'use server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type AdminUserRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  location: { city?: string; country?: string } | null;
  couple_members: { couple_id: string }[];
};

type AdminLogRecord = {
  id: string;
  created_at: string;
  event_type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  profiles: { email: string | null; username: string | null } | null;
};

async function assertAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

export async function getAdminDashboardSnapshot() {
  await assertAdmin();
  const admin = createAdminSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: totalUsers }, { count: aiRequestsToday }, { count: mapRequestsToday }, { data: recentLogs }] =
    await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'ai_request')
        .gte('created_at', today.toISOString()),
      admin
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'map_request')
        .gte('created_at', today.toISOString()),
      admin
        .from('system_logs')
        .select(
          `
          id,
          event_type,
          created_at,
          description,
          profiles:user_id (email)
        `
        )
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  return {
    totalUsers: totalUsers || 0,
    aiRequestsToday: aiRequestsToday || 0,
    mapRequestsToday: mapRequestsToday || 0,
    recentLogs: (recentLogs || []) as {
      id: string;
      event_type: string;
      created_at: string;
      description: string | null;
      profiles: { email: string | null } | null;
    }[],
  };
}

export async function getAdminUsers() {
  await assertAdmin();
  const admin = createAdminSupabaseClient();

  const { data, error } = await admin
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      username,
      avatar_url,
      role,
      created_at,
      location,
      couple_members (
        couple_id
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AdminUserRecord[];
}

export async function getAdminLogs(filter: string) {
  await assertAdmin();
  const admin = createAdminSupabaseClient();

  let query = admin
    .from('system_logs')
    .select(
      `
      id,
      created_at,
      event_type,
      description,
      metadata,
      profiles:user_id (email, username)
    `
    )
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    if (filter === 'errors') {
      query = query.ilike('event_type', '%error%');
    } else {
      query = query.eq('event_type', filter);
    }
  }

  const { data, error } = await query.limit(100);
  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AdminLogRecord[];
}

export async function getAdminHealth() {
  await assertAdmin();
  const admin = createAdminSupabaseClient();

  const [{ error: dbError }, { error: authError }, { error: storageError }] = await Promise.all([
    admin.from('profiles').select('id').limit(1),
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    admin.storage.from('gallery-images').list('', { limit: 1 }),
  ]);

  return {
    supabase: { status: dbError ? 'error' : 'ok', message: dbError?.message || 'Database responsive' },
    auth: { status: authError ? 'error' : 'ok', message: authError?.message || 'Auth admin API reachable' },
    storage: {
      status: storageError ? 'error' : 'ok',
      message: storageError?.message || 'Storage bucket reachable',
    },
  };
}
