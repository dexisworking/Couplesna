'use server';

import { getProjectVersion } from '@/lib/version';

/**
 * Server Action to fetch the current project version for client components.
 */
export async function getClientProjectVersion(): Promise<string> {
  return getProjectVersion();
}
