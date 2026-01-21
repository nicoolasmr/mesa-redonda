import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workspaces where user is owner or member
    const { data: workspaces, error } = await supabase
        .from('workspaces')
        .select(`
            *,
            workspace_members!inner(user_id, role)
        `)
        .eq('workspace_members.user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching workspaces:', error)
        return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
    }

    return NextResponse.json(workspaces || [])
}
