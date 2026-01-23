import { getOrCreateWorkspace } from "@/app/app/workspace-utils"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id)

    if (!workspace) {
        return NextResponse.json({
            error: "Failed to create or retrieve workspace",
        }, { status: 500 })
    }

    return NextResponse.json([workspace])
}
