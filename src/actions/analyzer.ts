'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { normalizeFiles } from "@/lib/analyzer/normalizer";
import { runStructuredAI } from "@/lib/ai-senior";
import { canPerformAction, trackUsage } from "@/lib/entitlements";
import { StudyPackSchema, DashboardPackSchema } from "@/lib/analyzer/schemas";
import { SPECIALIST_TEMPLATES } from "@/lib/analyzer/specialists";
import { SpecialistKey } from "@/lib/analyzer/specialists";

import { ensureMember } from "@/lib/auth-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateAnalysisSchema = z.object({
    workspaceId: z.string().uuid(),
    payload: z.object({
        title: z.string().min(1).max(255),
        specialist_key: z.string(),
        user_goal: z.string().min(1),
        jurisdiction: z.string().optional(),
        consent_confirmed: z.boolean().refine(v => v === true, "Consent is required"),
    })
});

const RunAnalysisSchema = z.string().uuid();

export async function createAnalysis(workspaceId: string, payload: {
    title: string;
    specialist_key: SpecialistKey;
    user_goal: string;
    jurisdiction?: string;
    consent_confirmed: boolean;
}) {
    // Validate Input
    const { workspaceId: validatedWsId, payload: validatedPayload } = CreateAnalysisSchema.parse({ workspaceId, payload });

    const supabase = await createClient();

    // Verify membership (Defense in Depth)
    await ensureMember(supabase, validatedWsId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const canAnalyze = await canPerformAction(validatedWsId, 'runs');
    if (!canAnalyze) {
        throw new Error("Limite de análises atingido para o seu plano. Faça upgrade para continuar.");
    }

    const specialist = SPECIALIST_TEMPLATES[validatedPayload.specialist_key as SpecialistKey];

    const { data, error } = await supabase
        .from("analyses")
        .insert({
            workspace_id: validatedWsId,
            created_by: user.id,
            title: validatedPayload.title,
            specialist_key: validatedPayload.specialist_key,
            user_goal: validatedPayload.user_goal,
            risk_level: specialist.risk_level,
            jurisdiction: validatedPayload.jurisdiction,
            consent_confirmed: validatedPayload.consent_confirmed,
            status: 'created'
        })
        .select()
        .single();

    if (error) {
        logger.error("Failed to create analysis", error, { workspaceId: validatedWsId });
        throw new Error("Failed to create analysis");
    }

    // 2. TRACKING: Consume a credit
    await trackUsage(validatedWsId, 'runs');

    return data.id;
}

export async function runAnalysis(analysisId: string) {
    // Validate Input
    const validatedId = RunAnalysisSchema.parse(analysisId);

    const supabase = await createClient();

    // 1. Authorization: Fetch item to find its workspace
    const { data: analysis } = await supabase
        .from("analyses")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (analysis) {
        await ensureMember(supabase, analysis.workspace_id)
    }

    // 2. Update status
    await supabase.from("analyses").update({ status: 'processing' }).eq("id", validatedId);

    try {
        // 2. Normalize Files
        const normalizedFiles = await normalizeFiles(validatedId);

        // 3. Get Analysis Meta
        const { data: meta } = await supabase.from("analyses").select("*").eq("id", validatedId).single();
        const specialist = SPECIALIST_TEMPLATES[meta.specialist_key as SpecialistKey];

        // 4. Build Prompt
        const prompt = `
            Você é um especialista em ${specialist.name}.
            OBJETIVO DO USUÁRIO: ${meta.user_goal}
            
            REGRAS DO ESPECIALISTA:
            ${specialist.prompt_rules}
            
            DADOS DOS ARQUIVOS:
            ${JSON.stringify(normalizedFiles, null, 2)}
            
            Sua tarefa é gerar:
            1. Um StudyPack (estudo detalhado em texto).
            2. Um DashboardPack (gráficos e cartões de KPI).
            
            Retorne um JSON estrito seguindo o schema fornecido.
        `;

        // 5. Call Senior AI (Structured & Transparent)
        const results = await runStructuredAI(
            prompt,
            StudyPackSchema.extend({ dashboard: DashboardPackSchema }),
            "Você é um motor de análise de dados estratégico de elite."
        );

        // 7. Save Results
        const { error: saveError } = await supabase
            .from("analysis_results")
            .insert({
                analysis_id: validatedId,
                study_json: results,
                dashboard_json: results.dashboard,
                model_used: process.env.OPENAI_MODEL || 'gpt-4o',
            });

        if (saveError) throw saveError;

        // 8. Update status
        await supabase.from("analyses").update({ status: 'done' }).eq("id", validatedId);

        revalidatePath(`/app/analyzer/${validatedId}`);
        return true;

    } catch (err) {
        logger.error("Analysis Run Error", err, { analysisId: validatedId });
        await supabase
            .from("analyses")
            .update({ status: 'error', error_message: String(err) })
            .eq("id", validatedId);
        throw err;
    }
}
