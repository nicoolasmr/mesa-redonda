import { NextRequest, NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/guest" // Reusing service role client logic
import { OpenAI } from "openai"
import { MeetingInsightsSchema } from "@/types/meetings"
import fs from "fs"
import path from "path"
import os from "os"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/meetings/[id]/process
 * Orchestrates: Transcription -> Analysis -> Insight Persistence
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = getServiceRoleClient()

    try {
        // 1. Get Meeting Info
        const { data: meeting, error: meetingError } = await supabase
            .from("meetings")
            .select("*")
            .eq("id", id)
            .single()

        if (meetingError || !meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
        }

        if (!meeting.audio_object_path) {
            return NextResponse.json({ error: "Audio not uploaded yet" }, { status: 400 })
        }

        // 2. Transcribing
        await supabase.from("meetings").update({ status: 'transcribing' }).eq("id", id)

        // Download audio from storage to a temp file for OpenAI
        const { data: audioData, error: downloadError } = await supabase.storage
            .from("meeting-audio")
            .download(meeting.audio_object_path)

        if (downloadError) throw new Error(`Download failed: ${downloadError.message}`)

        const tempFilePath = path.join(os.tmpdir(), `${id}.webm`)
        fs.writeFileSync(tempFilePath, Buffer.from(await audioData.arrayBuffer()))

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        })

        // Clean up temp file
        fs.unlinkSync(tempFilePath)

        await supabase.from("meeting_transcripts").upsert({
            meeting_id: id,
            transcript_text: transcription.text,
            model_used: "whisper-1"
        })

        // 3. Analyzing
        await supabase.from("meetings").update({ status: 'analyzing' }).eq("id", id)

        const analysisPrompt = `
        Analise a seguinte transcrição de reunião e gere insights estratégicos seguindo RIGOROSAMENTE o esquema JSON fornecido.
        
        Transcrição:
        ${transcription.text}
        
        Esquema JSON esperado:
        {
          "summary": { "one_liner": "Resumo em uma frase", "paragraph": "Resumo detalhado" },
          "decisions": [{ "decision": string, "why": string, "criteria": string[], "owner": string|null, "deadline": string|null }],
          "action_items": [{ "task": string, "owner": string|null, "deadline": string|null, "priority": "P0"|"P1"|"P2" }],
          "risks": [{ "risk": string, "impact": string, "mitigation": string, "owner": string|null }],
          "open_questions": [string],
          "next_agenda": [string],
          "follow_up_message": "Mensagem de follow-up para os participantes"
        }
        `

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: "Você é um consultor estratégico especialista em análise de reuniões." }, { role: "user", content: analysisPrompt }],
            response_format: { type: "json_object" }
        })

        const insightsRaw = JSON.parse(completion.choices[0].message.content || "{}")
        const validatedInsights = MeetingInsightsSchema.parse(insightsRaw)

        await supabase.from("meeting_insights").upsert({
            meeting_id: id,
            insights_json: validatedInsights,
            model_used: "gpt-4o-mini"
        })

        // 4. Done
        await supabase.from("meetings").update({ status: 'done' }).eq("id", id)

        return NextResponse.json({ success: true, insights: validatedInsights })

    } catch (error: any) {
        console.error("Process error:", error)
        await supabase.from("meetings").update({
            status: 'error',
            error_message: error.message
        }).eq("id", id)

        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
