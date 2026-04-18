import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Client-side logger
 */
export async function logEventClient(eventType: string, description?: string, metadata: any = {}) {
    const supabase = createClientComponentClient();
    try {
        const { error } = await supabase.rpc('log_system_event', {
            p_event_type: eventType,
            p_description: description,
            p_metadata: metadata
        });
        if (error) console.error('Failed to log event:', error);
    } catch (err) {
        console.error('Logging service error:', err);
    }
}

/**
 * Server-side logger
 */
export async function logEventServer(eventType: string, description?: string, metadata: any = {}) {
    try {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc('log_system_event', {
            p_event_type: eventType,
            p_description: description,
            p_metadata: metadata
        });
        if (error) console.error('Failed to log server event:', error);
    } catch (err) {
        console.error('Server logging service error:', err);
    }
}
