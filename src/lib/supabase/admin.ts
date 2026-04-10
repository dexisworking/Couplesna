import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getAdminSupabaseEnv } from '@/lib/supabase/env';

export function createAdminSupabaseClient() {
  const { url, serviceRoleKey } = getAdminSupabaseEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
