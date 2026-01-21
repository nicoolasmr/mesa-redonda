import { createClient } from "./supabase/server";

export const LIMITS = {
    free: { tables: 3, messages_per_day: 10 },
    starter: { tables: 10, messages_per_day: 50 },
    pro: { tables: 9999, messages_per_day: 500 },
    max: { tables: 9999, messages_per_day: 1000 },
};

export async function checkLimit(userId: string, feature: 'tables' | 'messages') {
    const supabase = await createClient();

    // 1. Get User Plan
    // Note: We need to get the user's workspace where they are owner.
    // Assuming 1 owned workspace per user for MVP simplification.
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('id, subscription_plan')
        .eq('owner_id', userId)
        .single();

    if (!workspace) return false; // Should not happen if app logic is correct

    const plan = (workspace.subscription_plan || 'free') as keyof typeof LIMITS;
    const limit = LIMITS[plan];

    // 2. Check Usage
    if (feature === 'tables') {
        const { count } = await supabase
            .from('tables')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id);

        return (count || 0) < limit.tables;
    }

    // For messages, we'd need a time-based query. 
    // Simplified MVP: Allow all messages if plan is not free.
    if (feature === 'messages') {
        if (plan === 'free') {
            // Check messages in last 24h
            // const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            // const { count } = await supabase...
            // MVP: We are not enforcing message limits strictly yet to avoid blocking early users incorrectly.
            // When we add the 'messages' table constraint, we will uncomment this.
        }
        return true;
    }

    return true;
}
