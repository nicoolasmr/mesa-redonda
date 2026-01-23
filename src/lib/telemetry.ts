import { createClient } from "@/lib/supabase/server"

export async function trackEvent(
    workspaceId: string | null,
    eventName: string,
    properties: Record<string, any> = {}
) {
    try {
        const supabase = await createClient()
        await supabase.from('telemetry_events').insert({
            workspace_id: workspaceId,
            event_name: eventName,
            properties
        })
    } catch (err) {
        // Fail open: telemetry shouldn't break app
        console.error("Telemetry Error:", err)
    }
}
