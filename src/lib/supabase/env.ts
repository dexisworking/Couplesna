const getEnv = (name: string) => process.env[name]?.trim();

function getPublicSupabaseKey() {
  return (
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  );
}

export function isSupabaseConfigured() {
  return Boolean(getEnv('NEXT_PUBLIC_SUPABASE_URL') && getPublicSupabaseKey());
}

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && getEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getPublicSupabaseEnv() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getPublicSupabaseKey();

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return { url, anonKey };
}

export function getAdminSupabaseEnv() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!serviceRoleKey) {
    throw new Error(
      'Supabase admin access is not configured. Set SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return { url, serviceRoleKey };
}

export function getSiteUrl() {
  return getEnv('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000';
}
