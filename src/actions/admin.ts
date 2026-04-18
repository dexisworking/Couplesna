'use server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth/session';

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

function toCsvCell(value: unknown) {
  const normalized = value === null || value === undefined ? '' : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsv(headers: string[], rows: Array<Array<unknown>>) {
  const headerLine = headers.map(toCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(toCsvCell).join(','));
  return [headerLine, ...bodyLines].join('\n');
}

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? verifyAdminSessionToken(token) : null;
  if (!session) {
    throw new Error('Unauthorized');
  }

  const admin = createAdminSupabaseClient();
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', session.sub)
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

export async function getAdminUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  await assertAdmin();
  const admin = createAdminSupabaseClient();
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const search = params?.search?.trim();

  let query = admin
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
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  return {
    records: (data || []) as AdminUserRecord[],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function getAdminLogs(params: {
  filter: string;
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
}) {
  await assertAdmin();
  const admin = createAdminSupabaseClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 25));
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const search = params.search?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

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

  if (params.filter !== 'all') {
    if (params.filter === 'errors') {
      query = query.ilike('event_type', '%error%');
    } else {
      query = query.eq('event_type', params.filter);
    }
  }

  if (search) {
    query = query.or(`event_type.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (from) {
    query = query.gte('created_at', from);
  }
  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error, count } = await query.range(start, end);
  if (error) {
    throw new Error(error.message);
  }

  return {
    records: (data || []) as AdminLogRecord[],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function exportAdminUsersCsv(search?: string) {
  await assertAdmin();
  const admin = createAdminSupabaseClient();
  const trimmedSearch = search?.trim();
  let query = admin
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      username,
      role,
      created_at,
      location,
      couple_members (
        couple_id
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(5000);

  if (trimmedSearch) {
    query = query.or(
      `email.ilike.%${trimmedSearch}%,full_name.ilike.%${trimmedSearch}%,username.ilike.%${trimmedSearch}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const records = (data || []) as AdminUserRecord[];
  const csv = buildCsv(
    ['id', 'email', 'full_name', 'username', 'role', 'city', 'country', 'bonded', 'created_at'],
    records.map((user) => [
      user.id,
      user.email,
      user.full_name,
      user.username,
      user.role,
      user.location?.city || '',
      user.location?.country || '',
      user.couple_members?.length > 0 ? 'yes' : 'no',
      user.created_at,
    ])
  );

  return {
    filename: `couplesna-users-${new Date().toISOString().slice(0, 10)}.csv`,
    content: csv,
  };
}

export async function exportAdminLogsCsv(params: {
  filter: string;
  search?: string;
  from?: string;
  to?: string;
}) {
  await assertAdmin();
  const admin = createAdminSupabaseClient();
  const search = params.search?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();
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
    .order('created_at', { ascending: false })
    .limit(10000);

  if (params.filter !== 'all') {
    if (params.filter === 'errors') {
      query = query.ilike('event_type', '%error%');
    } else {
      query = query.eq('event_type', params.filter);
    }
  }
  if (search) {
    query = query.or(`event_type.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (from) {
    query = query.gte('created_at', from);
  }
  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const records = (data || []) as AdminLogRecord[];
  const csv = buildCsv(
    ['id', 'created_at', 'event_type', 'description', 'initiated_by_email', 'initiated_by_username', 'metadata'],
    records.map((log) => [
      log.id,
      log.created_at,
      log.event_type,
      log.description || '',
      log.profiles?.email || '',
      log.profiles?.username || '',
      JSON.stringify(log.metadata || {}),
    ])
  );

  return {
    filename: `couplesna-logs-${new Date().toISOString().slice(0, 10)}.csv`,
    content: csv,
  };
}

export async function getAdminHealth() {
  await assertAdmin();
  const admin = createAdminSupabaseClient();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { error: dbError },
    { error: authError },
    { error: storageError },
    { count: last24hEvents },
    { count: last24hErrors },
    { data: recentErrors },
    { data: topEventsRaw },
  ] = await Promise.all([
    admin.from('profiles').select('id').limit(1),
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    admin.storage.from('gallery-images').list('', { limit: 1 }),
    admin.from('system_logs').select('*', { count: 'exact', head: true }).gte('created_at', dayAgo),
    admin
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dayAgo)
      .ilike('event_type', '%error%'),
    admin
      .from('system_logs')
      .select('id, event_type, description, created_at')
      .ilike('event_type', '%error%')
      .order('created_at', { ascending: false })
      .limit(5),
    admin.from('system_logs').select('event_type').gte('created_at', dayAgo).limit(5000),
  ]);

  const topEventsMap = new Map<string, number>();
  (topEventsRaw || []).forEach((entry: { event_type: string }) => {
    topEventsMap.set(entry.event_type, (topEventsMap.get(entry.event_type) || 0) + 1);
  });
  const topEvents = Array.from(topEventsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([eventType, count]) => ({ eventType, count }));

  return {
    supabase: { status: dbError ? 'error' : 'ok', message: dbError?.message || 'Database responsive' },
    auth: { status: authError ? 'error' : 'ok', message: authError?.message || 'Auth admin API reachable' },
    storage: {
      status: storageError ? 'error' : 'ok',
      message: storageError?.message || 'Storage bucket reachable',
    },
    activity: {
      last24hEvents: last24hEvents || 0,
      last24hErrors: last24hErrors || 0,
      topEvents,
      recentErrors:
        (recentErrors || []).map((entry) => ({
          id: entry.id,
          eventType: entry.event_type,
          description: entry.description,
          createdAt: entry.created_at,
        })) || [],
    },
  };
}
