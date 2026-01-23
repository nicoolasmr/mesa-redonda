import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { z } from "zod"

const WorkspaceIdSchema = z.string().uuid();

export type UsageMetric = 'runs' | 'upload_mb' | 'meetings'

export async function getWorkspacePlan(workspaceId: string) {
    const supabase = await createClient()

    // 1. Check direct subscription source of truth
    const { data: sub } = await supabase
        .from('stripe_subscriptions')
        .select('status, plan_key, current_period_end')
        .eq('workspace_id', workspaceId)
        .single()

    // 2. Fallback to entitlements override or 'free'
    if (!sub || sub.status !== 'active') {
        // Check for specific overrides or manual grants
        const { data: ent } = await supabase
            .from('workspace_entitlements')
            .select('plan_key')
            .eq('workspace_id', workspaceId)
            .single()

        return ent?.plan_key || 'free'
    }

    return sub.plan_key
}

export async function canPerformAction(workspaceId: string, metric: UsageMetric, amount: number = 1): Promise<boolean> {
    const supabase = await createClient()
    const planKey = await getWorkspacePlan(workspaceId)

    // 1. Get Plan Limits
    const { data: plan } = await supabase
        .from('plan_catalog')
        .select('limits')
        .eq('plan_key', planKey)
        .single()

    if (!plan) return false // Fail safe

    const limit: number = (plan.limits as any)?.[metric] || 0
    if (limit === -1) return true // Unlimited

    // 2. Get Current Usage (Month)
    const monthKey = new Date().toISOString().substring(0, 7) // 2024-01
    const { data: usage } = await supabase
        .from('workspace_usage_monthly')
        .select('counters')
        .eq('workspace_id', workspaceId)
        .eq('month_key', monthKey)
        .single()

    const current = (usage?.counters as any)?.[metric] || 0

    return (current + amount) <= limit
}

export async function trackUsage(workspaceId: string, metric: UsageMetric, amount: number = 1, refId?: string) {
    // Basic validation
    WorkspaceIdSchema.parse(workspaceId);

    const supabase = await createClient()

    // 1. Log Event (Audit)
    await supabase.from('usage_events').insert({
        workspace_id: workspaceId,
        metric,
        amount,
        ref_id: refId
    })

    // 2. Increment Counter (Atomic RPC)
    const { error } = await supabase.rpc('increment_workspace_usage', {
        target_workspace_id: workspaceId,
        target_metric: metric,
        increment_amount: amount
    })

    if (error) {
        logger.error("Error tracking usage via RPC", error, { workspaceId, metric, amount });
    }
}
