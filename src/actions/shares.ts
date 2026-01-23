import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureMember } from "@/lib/auth-utils"
import { z } from "zod"
import { logger } from "@/lib/logger"

const CreateShareSchema = z.object({
    workspaceId: z.string().uuid(),
    resourceType: z.enum(['artifact', 'analysis', 'meeting']),
    resourceId: z.string().uuid(),
    daysValid: z.number().int().min(1).max(365).optional().default(7),
});

const ShareIdSchema = z.string().uuid();

/**
 * Creates a public share link for a resource
 */
export async function createShare(workspaceId: string, resourceType: 'artifact' | 'analysis' | 'meeting', resourceId: string, daysValid: number = 7) {
    // Validate Input
    const validated = CreateShareSchema.parse({ workspaceId, resourceType, resourceId, daysValid });

    const supabase = await createClient()

    // Authorization
    const { user } = await ensureMember(supabase, validated.workspaceId)

    // Expire date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (validated.daysValid || 7))

    const { data, error } = await supabase
        .from('shares')
        .insert({
            workspace_id: validated.workspaceId,
            resource_type: validated.resourceType,
            resource_id: validated.resourceId,
            expires_at: expiresAt.toISOString(),
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        logger.error("Failed to create share", error, { workspaceId: validated.workspaceId });
        throw new Error("Falha ao gerar link de compartilhamento")
    }

    return data.id
}

/**
 * Revokes a share link
 */
export async function revokeShare(shareId: string) {
    // Validate Input
    const validatedId = ShareIdSchema.parse(shareId);

    const supabase = await createClient()

    // Authorization: Fetch share to find its workspace
    const { data: share } = await supabase
        .from("shares")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (share) {
        await ensureMember(supabase, share.workspace_id)
    }

    const { error } = await supabase
        .from('shares')
        .update({ is_active: false })
        .eq('id', validatedId)

    if (error) {
        logger.error("Failed to revoke share", error, { shareId: validatedId });
        throw new Error("Falha ao cancelar compartilhamento");
    }
    revalidatePath(`/app/share/${validatedId}`)
}

/**
 * Fetches data for a public share WITHOUT auth requirement
 * Note: This uses the public policy based on is_active and expires_at
 */
export async function getPublicShare(shareId: string) {
    // Validate Input
    const validatedId = ShareIdSchema.parse(shareId);

    const supabase = await createClient() // Server client with public access level

    const { data: share, error } = await supabase
        .from('shares')
        .select('*')
        .eq('id', validatedId)
        .eq('is_active', true)
        .single()

    if (error || !share) return null

    // Fetch the target resource based on type
    let resourceData = null

    if (share.resource_type === 'artifact') {
        const { data } = await supabase
            .from('artifacts')
            .select('*, tables(title)')
            .eq('id', share.resource_id)
            .single()
        resourceData = data
    } else if (share.resource_type === 'analysis') {
        const { data } = await supabase
            .from('analysis_results')
            .select('*, analyses(*)')
            .eq('analysis_id', share.resource_id)
            .single()
        resourceData = data
    }

    return {
        share,
        resourceData
    }
}
