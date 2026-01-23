import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Ensures the currently authenticated user is a member of the given workspace.
 * Throws an error if not authorized.
 */
export async function ensureMember(supabase: SupabaseClient, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized: No active session")

    const { data: member, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (error || !member) {
        console.warn(`[Security] Unauthorized access attempt: User ${user.id} tried to access workspace ${workspaceId}`)
        throw new Error("Unauthorized: You do not have access to this workspace")
    }

    return { user, role: member.role }
}

/**
 * Ensures the currently authenticated user is the owner of the given workspace.
 * Throws an error if not authorized.
 */
export async function ensureOwner(supabase: SupabaseClient, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized: No active session")

    const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (error || !workspace || workspace.owner_id !== user.id) {
        console.warn(`[Security] Unauthorized owner-only access attempt: User ${user.id} tried to modify workspace ${workspaceId}`)
        throw new Error("Unauthorized: Only the workspace owner can perform this action")
    }

    return { user }
}
