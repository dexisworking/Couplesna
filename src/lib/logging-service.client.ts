import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
