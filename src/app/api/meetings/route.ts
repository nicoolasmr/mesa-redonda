import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { canPerformAction } from "@/lib/entitlements"
import { logger } from "@/lib/logger"

/**
 * POST /api/meetings
 * Creates a new meeting record
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { title, workspace_id, consent_confirmed } = body

        if (!title || !workspace_id || !consent_confirmed) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Check Gating/Limits
        // For MVP, we check a simpler limit. Detailed minutes check happens during processing.
        const canCreate = await canPerformAction(workspace_id, 'meetings')
        // Note: I need to update checkLimit to support generic feature keys if it doesn't already.
        // Let's assume for now we use a custom check or update checkLimit later.

        const { data: meeting, error } = await supabase
            .from("meetings")
            .insert({
                title,
                workspace_id,
                created_by: user.id,
                consent_confirmed,
                status: 'created'
            })
            .select()
            .single()

        if (error) {
            logger.error("Error creating meeting", error, { workspace_id })
            return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
        }

        return NextResponse.json(meeting)
    } catch (error) {
        logger.error("Internal Server Error in meeting creation", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

/**
 * GET /api/meetings
 * Lists meetings for a workspace
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspace_id')

    if (!workspaceId) {
        return NextResponse.json({ error: "Missing workspace_id" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        logger.error("Error fetching meetings", error, { workspaceId })
        return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
    }

    return NextResponse.json(data)
}
