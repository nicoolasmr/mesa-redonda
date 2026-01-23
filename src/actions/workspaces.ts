'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateWorkspaceSchema = z.object({
    name: z.string().min(1).max(255),
});

export async function createWorkspace(formData: FormData) {
    const name = formData.get("name") as string;

    // Validate Input
    const validated = CreateWorkspaceSchema.parse({ name });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Create Workspace
    const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
            name: validated.name,
            owner_id: user.id
        })
        .select()
        .single();

    if (wsError) {
        logger.error("Failed to create workspace", wsError, { userId: user.id });
        throw new Error(wsError.message);
    }

    // 2. Add Owner as Member
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "owner"
        });

    if (memberError) {
        // Cleanup if member creation fails (optional but good practice)
        throw new Error(memberError.message);
    }

    revalidatePath("/app");
    redirect(`/app/workspaces/${workspace.id}`);
}

export async function getWorkspaces() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("workspaces")
        .select("*, workspace_members!inner(role)")
        .eq("workspace_members.user_id", user.id);

    return data || [];
}
