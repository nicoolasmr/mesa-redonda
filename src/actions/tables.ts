'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ensureMember } from "@/lib/auth-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateTableSchema = z.object({
    workspaceId: z.string().uuid(),
    templateId: z.string().uuid(),
    title: z.string().min(1).max(255),
});

export async function createTable(workspaceId: string, templateId: string, title: string) {
    // Validate Input
    const validated = CreateTableSchema.parse({ workspaceId, templateId, title });

    const supabase = await createClient();

    // Verify membership (Defense in Depth)
    await ensureMember(supabase, validated.workspaceId);

    // Verify limit using professional entitlement helper
    const { canPerformAction, trackUsage } = await import("@/lib/entitlements");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) throw new Error("Usuário não autenticado");

    const hasLimit = await canPerformAction(validated.workspaceId, "runs");
    if (!hasLimit) {
        throw new Error("Limite de mesas atingido para seu plano. Faça upgrade para continuar.");
    }

    const { data, error } = await supabase
        .from("tables")
        .insert({
            workspace_id: validated.workspaceId,
            template_id: validated.templateId,
            title: validated.title,
            status: "active"
        })
        .select()
        .single();

    if (error) {
        logger.error("Failed to create table", error, { workspaceId: validated.workspaceId, title: validated.title });
        throw new Error("Failed to create table");
    }

    // Initial System Message to start the conversation
    await supabase.from("messages").insert({
        table_id: data.id,
        role: "system",
        content: "Mesa iniciada. Aguardando contexto do usuário."
    });

    // Track usage
    await trackUsage(validated.workspaceId, "runs");

    // Telemetry
    await supabase.from('events').insert({
        event_name: 'table_created',
        workspace_id: validated.workspaceId,
        user_id: user.id,
        payload: { template_id: validated.templateId }
    });

    revalidatePath(`/app/workspaces/${validated.workspaceId}`);
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

export async function listTables(workspaceId: string) {
    const supabase = await createClient();

    // Verify membership
    await ensureMember(supabase, workspaceId);

    const { data, error } = await supabase
        .from("tables")
        .select("*, table_templates(name)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

    if (error) {
        logger.error("Failed to list tables", error, { workspaceId });
        return [];
    }

    return data;
}
