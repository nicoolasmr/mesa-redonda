import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { trackUsage } from "@/lib/entitlements"
import { ensureMember, ensureOwner } from "@/lib/auth-utils"
import { z } from "zod"
import { logger } from "@/lib/logger"

const InviteMemberSchema = z.object({
    workspaceId: z.string().uuid(),
    email: z.string().email(),
});

const RevokeInviteSchema = z.string().uuid();

const ApplyReferralCodeSchema = z.object({
    code: z.string().min(1).max(20),
    workspaceId: z.string().uuid(),
});

/**
 * INVITES SYSTEM
 */

export async function inviteMember(workspaceId: string, email: string) {
    // Validate Input
    const { workspaceId: validatedWsId, email: validatedEmail } = InviteMemberSchema.parse({ workspaceId, email });

    const supabase = await createClient()

    // 1. Authorization: Only owners can invite
    await ensureOwner(supabase, validatedWsId)

    // 2. Check Entitlements (Max Members) -> Simpler check here for MVP
    // In production, use `canPerformAction(workspaceId, 'max_members')`

    // 3. Create Invite
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('workspace_invites')
        .insert({
            workspace_id: validatedWsId,
            email: validatedEmail,
            created_by: user.id
        })

    if (error) {
        logger.error("Failed to create invite", error, { workspaceId: validatedWsId });
        throw new Error("Falha ao criar convite")
    }

    // TODO: Send actual email via Resend/SendGrid
    console.log(`[MOCK EMAIL] Convite enviado para ${validatedEmail}`)

    revalidatePath('/app/settings')
}

export async function revokeInvite(inviteId: string) {
    // Validate Input
    const validatedId = RevokeInviteSchema.parse(inviteId);

    const supabase = await createClient()

    // 1. Authorization: Fetch invite to find its workspace
    const { data: invite } = await supabase
        .from("workspace_invites")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (invite) {
        await ensureOwner(supabase, invite.workspace_id)
    }

    const { error } = await supabase.from('workspace_invites').delete().eq('id', validatedId)
    if (error) {
        logger.error("Failed to revoke invite", error, { inviteId: validatedId });
        throw new Error("Falha ao revogar convite");
    }
    revalidatePath('/app/settings')
}

/**
 * REFERRAL SYSTEM
 */

export async function createReferralCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Generate random 6-char code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
        .from('referral_codes')
        .insert({
            user_id: user.id,
            code
        })
        .select()
        .single()

    if (error) {
        // Handle collision retry logic in prod
        throw new Error("Erro ao gerar código")
    }

    return data
}

export async function getReferralCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return data
}

export async function applyReferralCode(code: string, workspaceId: string) {
    // Validate Input
    const { code: validatedCode, workspaceId: validatedWsId } = ApplyReferralCodeSchema.parse({ code, workspaceId });

    const supabase = await createClient()

    // Authorization
    await ensureMember(supabase, validatedWsId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Find code owner
    const { data: referrerCode } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('code', validatedCode)
        .single()

    if (!referrerCode || referrerCode.user_id === user.id) {
        throw new Error("Código inválido")
    }

    // Create referral record
    const { error } = await supabase
        .from('referrals')
        .insert({
            referrer_id: referrerCode.user_id,
            referred_user_id: user.id,
            status: 'converted'
        })

    if (error) {
        logger.error("Failed to apply referral code", error, { workspaceId: validatedWsId, code: validatedCode });
        throw new Error("Código já utilizado ou inválido");
    }

    // REWARD LOGIC: Add 3 credits to both
    await trackUsage(validatedWsId, 'runs', -3) // Give 3 free runs (tables)

    // Give to referrer (Need to find their workspace)
    const { data: refWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', referrerCode.user_id)
        .limit(1)
        .single()

    if (refWorkspace) {
        await trackUsage(refWorkspace.id, 'runs', -3)
    }

    return true
}
