import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Server-side logger
 */
export async function logEventServer(eventType: string, description?: string, metadata: Record<string, unknown> = {}) {
    try {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc('log_system_event', {
            p_event_type: eventType,
            p_description: description,
            p_metadata: metadata
        } as any);
        if (error) console.error('Failed to log server event:', error);
    } catch (err) {
        console.error('Server logging service error:', err);
    }
}
