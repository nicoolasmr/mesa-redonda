'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


export async function createTable(workspaceId: string, templateId: string, title: string) {
    const supabase = await createClient();

    // Verify membership (optional if RLS handles it, but good for UX error)

    const { data, error } = await supabase
        .from("tables")
        .insert({
            workspace_id: workspaceId,
            template_id: templateId,
            title: title,
            status: "active"
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating table:", error);
        throw new Error("Failed to create table");
    }

    // Initial System Message to start the conversation
    await supabase.from("messages").insert({
        table_id: data.id,
        role: "system",
        content: "Mesa iniciada. Aguardando contexto do usuário."
    });

    revalidatePath(`/app/workspaces/${workspaceId}`);
    return data.id;
}

export async function getTable(tableId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .single();

    return data;
}

export async function getMessages(tableId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("table_id", tableId)
        .order("created_at", { ascending: true });

    return data || [];
}
