import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/meetings/[id]/upload
 * Receives audio file and uploads to Supabase Storage
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Get workspace_id for the path
        const { data: meeting } = await supabase
            .from("meetings")
            .select("workspace_id")
            .eq("id", id)
            .single()

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
        }

        const fileExt = file.name.split(".").pop() || "webm"
        const filePath = `workspace/${meeting.workspace_id}/meetings/${id}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from("meeting-audio")
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return NextResponse.json({ error: "Upload failed" }, { status: 500 })
        }

        // Update meeting record with path and status
        await supabase
            .from("meetings")
            .update({
                audio_object_path: filePath,
                status: 'uploaded'
            })
            .eq("id", id)

        return NextResponse.json({ success: true, path: filePath })
    } catch (error) {
        console.error("Upload API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
