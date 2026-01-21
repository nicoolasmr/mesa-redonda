'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { callLLM, buildSystemPrompt } from "@/lib/llm";
import { TEMPLATES } from "@/lib/ai/templates";

// Real implementation calling OpenAI via src/lib/llm.ts
export async function sendMessage(tableId: string, userContent: string, isSkeptic = false) {
    const supabase = await createClient();

    // 1. Save User Message
    const { error } = await supabase.from("messages").insert({
        table_id: tableId,
        role: "user",
        content: userContent
    });

    if (error) throw error;

    // 2. Get Context (Table Info & Template)
    const { data: table } = await supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .single();

    const template = TEMPLATES[table.template_id] || TEMPLATES['product']; // Fallback

    // 3. Get Chat History (Last 10 messages for context)
    const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("table_id", tableId)
        .order("created_at", { ascending: false }) // Get latest
        .limit(10);

    // Reverse history to chronological order for LLM
    const llmHistory = history ? history.reverse().map(m => ({ role: m.role as "user" | "assistant", content: m.content })) : [];

    // 4. Build System Prompt & Call LLM
    const systemPrompt = buildSystemPrompt(template, isSkeptic);

    // Add instruction to generate artifact if keyword detected (Heuristic trigger)
    let finalUserMessage = userContent;
    if (userContent.toUpperCase().includes("PLANO") || userContent.toUpperCase().includes("GERAR")) {
        finalUserMessage += "\n(SISTEMA: O usuário parece querer um artefato. Se tiver informações suficientes, gere o JSON no campo 'artifact'. Caso contrário, faça perguntas de follow-up.)";
    }

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
        table_id: tableId,
        role: "assistant", // Generic role for the system output
        content: responseText,
        persona_id: "moderator" // Default to moderator orchestrating
    });

    // 7. Save Artifact if present
    if (aiContent.artifact) {
        await supabase.from("artifacts").insert({
            table_id: tableId,
            type: aiContent.artifact.type || "unknown",
            title: aiContent.artifact.title || "Novo Artefato",
            content_json: aiContent.artifact,
            version: 1
        });
    }

    revalidatePath(`/app/tables/${tableId}`);
}
