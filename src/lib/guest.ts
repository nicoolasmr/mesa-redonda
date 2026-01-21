import { createClient } from "@supabase/supabase-js"

// Service role client for server-side operations (bypasses RLS)
export function getServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key"

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Guest ID cookie name
export const GUEST_COOKIE_NAME = "MR_GUEST_ID"
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
