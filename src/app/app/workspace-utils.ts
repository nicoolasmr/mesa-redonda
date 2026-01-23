import { SupabaseClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

/**
 * Ensures a user has a workspace and returns it.
 * Creates a default one if none exists.
 * 
 * Usage:
 * const workspace = await getOrCreateWorkspace(supabase, user.id)
 */
export async function getOrCreateWorkspace(supabase: SupabaseClient, userId: string): Promise<{ id: string, subscription_plan: string, stripe_customer_id?: string | null } | null> {
    try {
        // 1. Try to get existing workspace
        const { data: workspaces, error: fetchError } = await supabase
            .from('workspaces')
            .select('id, subscription_plan, stripe_customer_id')
            .eq('owner_id', userId)
            .limit(1)

        if (fetchError) {
            console.error('[Workspace Utils] Error fetching workspace:', fetchError)
            return null
        }

        if (workspaces && workspaces.length > 0) {
            return workspaces[0]
        }

        // 2. Auto-create workspace if missing
        console.log('[Workspace Utils] Creating default workspace for user:', userId)

        const { data: newWs, error: createError } = await supabase
            .from('workspaces')
            .insert({
                name: 'Meu Workspace',
                owner_id: userId,
                subscription_plan: 'free'
            })
            .select('id, subscription_plan, stripe_customer_id')
            .single()

        if (createError) {
            logger.error('Failed to create workspace', createError, { userId });
            return null
        }

        return newWs

    } catch (error) {
        console.error('[Workspace Utils] Unexpected error:', error)
        return null
    }
}
