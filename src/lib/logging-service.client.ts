import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side logger
 */
export async function logEventClient(eventType: string, description?: string, metadata: Record<string, unknown> = {}) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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
