'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureMember } from "@/lib/auth-utils"
import { z } from "zod"
import { logger } from "@/lib/logger"

const ShareMeetingSchema = z.string().uuid();
const SaveMeetingAsArtifactSchema = z.object({
    meetingId: z.string().uuid(),
    workspaceId: z.string().uuid(),
});

/**
 * Generates a public share link for a meeting
 */
export async function shareMeeting(meetingId: string) {
    // Validate Input
    const validatedId = ShareMeetingSchema.parse(meetingId);

    const supabase = await createClient()

    // 1. Authorization: Fetch meeting to find its workspace
    const { data: meeting } = await supabase
        .from("meetings")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (meeting) {
        await ensureMember(supabase, meeting.workspace_id)
    }

    // Generate a non-enumerable public_id (using random hex for MVP)
    const publicId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const { data, error } = await supabase
        .from("meeting_shares")
        .insert({
            meeting_id: validatedId,
            public_id: publicId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
        })
        .select()
        .single()

    if (error) {
        logger.error("Failed to share meeting", error, { meetingId: validatedId });
        throw new Error("Falha ao gerar link de compartilhamento")
    }

    return publicId
}

/**
 * Saves meeting insights as standard artifacts in the library
 */
export async function saveMeetingAsArtifact(meetingId: string, workspaceId: string) {
    // Validate Input
    const { meetingId: validatedMeetingId, workspaceId: validatedWsId } = SaveMeetingAsArtifactSchema.parse({ meetingId, workspaceId });

    const supabase = await createClient()

    // 1. Authorization
    await ensureMember(supabase, validatedWsId)

    // 2. Get Insights
    const { data: insights } = await supabase
        .from("meeting_insights")
        .select("*")
        .eq("meeting_id", validatedMeetingId)
        .single()

    if (!insights) throw new Error("Insights não encontrados")

    // 3. Create one or more artifacts
    // We'll create a "Resumo Executivo" artifact for now
    const { error } = await supabase
        .from("artifacts")
        .insert({
            workspace_id: validatedWsId,
            title: `Resumo: ${insights.insights_json.summary.one_liner}`,
            type: "summary",
            content_json: insights.insights_json,
            is_public: false
        })

    if (error) {
        logger.error("Failed to save meeting as artifact", error, { meetingId: validatedMeetingId });
        throw new Error("Falha ao salvar na biblioteca")
    }

    revalidatePath(`/app/artifacts`)
}
