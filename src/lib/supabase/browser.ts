'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database.types';

let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    const { url, anonKey } = getPublicSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, anonKey, {
      isSingleton: true,
    });
  }

  return browserClient;
}
