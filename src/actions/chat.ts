'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { callLLM, buildSystemPrompt } from "@/lib/llm";
import { TEMPLATES } from "@/lib/ai/templates";

import { ensureMember } from "@/lib/auth-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const SendMessageSchema = z.object({
    tableId: z.string().uuid(),
    userContent: z.string().min(1),
    isSkeptic: z.boolean().optional(),
});

// Real implementation calling OpenAI via src/lib/llm.ts
export async function sendMessage(tableId: string, userContent: string, isSkeptic = false) {
    // Validate Input
    const validated = SendMessageSchema.parse({ tableId, userContent, isSkeptic });

    const supabase = await createClient();

    // 1. Authorization: Fetch table to find its workspace
    const { data: table } = await supabase
        .from("tables")
        .select("workspace_id, template_id")
        .eq("id", validated.tableId)
        .single();

    if (table) {
        await ensureMember(supabase, table.workspace_id);
    } else {
        throw new Error("Mesa não encontrada");
    }

    // 2. Save User Message
    const { error } = await supabase.from("messages").insert({
        table_id: validated.tableId,
        role: "user",
        content: validated.userContent
    });

    if (error) {
        logger.error("Failed to save user message", error, { tableId: validated.tableId });
        throw error;
    }

    const template = TEMPLATES[table.template_id] || TEMPLATES['product']; // Fallback

    // 3. Get Chat History (Last 10 messages for context)
    const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("table_id", validated.tableId)
        .order("created_at", { ascending: false }) // Get latest
        .limit(10);

    // Reverse history to chronological order for LLM
    const llmHistory = history ? history.reverse().map(m => ({ role: m.role as "user" | "assistant", content: m.content })) : [];

    // 4. Build System Prompt & Call LLM
    const { getActiveWorkspaceContext } = await import("@/actions/knowledge");
    const workspaceContext = await getActiveWorkspaceContext(table.workspace_id);

    let systemPrompt = buildSystemPrompt(template, validated.isSkeptic);
    if (workspaceContext) {
        systemPrompt += workspaceContext;
    }

    // Add instruction to generate artifact if keyword detected (Heuristic trigger)
    let finalUserMessage = validated.userContent;
    if (validated.userContent.toUpperCase().includes("PLANO") || validated.userContent.toUpperCase().includes("GERAR")) {
        finalUserMessage += "\n(SISTEMA: O usuário parece querer um artefato. Se tiver informações suficientes, gere o JSON no campo 'artifact'. Caso contrário, faça perguntas de follow-up.)";
    }

    try {
        const aiResponseRaw = await callLLM([
            { role: "system", content: systemPrompt },
            ...llmHistory,
            { role: "user", content: finalUserMessage }
        ]);

        // 5. Parse Response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aiContent: any = {};
        try {
            aiContent = JSON.parse(aiResponseRaw);
        } catch {
            aiContent = { text: aiResponseRaw }; // Fallback if not JSON
        }

        const responseText = aiContent.text || "Estou processando sua solicitação...";

        // 6. Save AI Message
        await supabase.from("messages").insert({
            table_id: validated.tableId,
            role: "assistant",
            content: responseText,
            persona_id: "moderator"
        });

        // 7. Save Artifact if present
        if (aiContent.artifact) {
            await supabase.from("artifacts").insert({
                workspace_id: table.workspace_id,
                table_id: validated.tableId,
                type: aiContent.artifact.type || "unknown",
                title: aiContent.artifact.title || "Novo Artefato",
                content_json: aiContent.artifact,
                version: 1
            });
        }

        revalidatePath(`/app/tables/${validated.tableId}`);

    } catch (llmError) {
        logger.error("LLM call failed", llmError, { tableId: validated.tableId });
        throw new Error("Falha na comunicação com a IA");
    }
}
