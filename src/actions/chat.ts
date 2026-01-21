'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Simple "Stub" for the deterministic engine to start.
// In a real implementation this would call OpenAI/Anthropic.
export async function sendMessage(tableId: string, userContent: string) {
    const supabase = await createClient();

    // 1. Save User Message
    const { error } = await supabase.from("messages").insert({
        table_id: tableId,
        role: "user",
        content: userContent
    });

    if (error) throw error;

    // 2. Trigger "Thinking" (Simulation) (We just create the response immediately here)
    // In V1 this should be a streaming response or background job.

    // Logic: 
    // If user says "PLANO", generate artifact.
    // Else, reply as Moderator.

    let aiResponse = "";
    const role = "assistant";
    const persona = "moderator";

    if (userContent.toUpperCase().includes("PLANO")) {
        aiResponse = "Entendido. Gerando seu plano estratégico base... (Simulação: Artefato criado)";
        // Create artifact stub
        await supabase.from("artifacts").insert({
            table_id: tableId,
            type: "plan",
            title: "Plano Estratégico V1",
            content_json: { status: "draft", sections: ["Objetivo", "Metas", "Ações"] }
        });
    } else {
        aiResponse = `(Simulando IA) Recebi seu input: "${userContent}". \n\nComo moderador, pergunto: Qual o prazo ideal para essa iniciativa?`;
    }

    // 3. Save AI Message
    await supabase.from("messages").insert({
        table_id: tableId,
        role: role,
        content: aiResponse,
        persona_id: persona
    });

    revalidatePath(`/app/tables/${tableId}`);
}
