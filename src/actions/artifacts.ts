'use server'

import { createClient } from "@/lib/supabase/server";
import { ensureMember } from "@/lib/auth-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const ListArtifactsSchema = z.string().uuid();
const GetArtifactSchema = z.string().uuid();

export async function listArtifacts(workspaceId: string) {
    // Validate Input
    const validatedWsId = ListArtifactsSchema.parse(workspaceId);

    const supabase = await createClient();

    // Verify membership
    await ensureMember(supabase, validatedWsId);

    const { data, error } = await supabase
        .from("artifacts")
        .select("*, tables(title)")
        .eq("workspace_id", validatedWsId)
        .order("created_at", { ascending: false });

    if (error) {
        logger.error("Failed to list artifacts", error, { workspaceId: validatedWsId });
        return [];
    }

    return data;
}

export async function getArtifact(artifactId: string) {
    // Validate Input
    const validatedId = GetArtifactSchema.parse(artifactId);

    const supabase = await createClient();

    // Authorization: Fetch artifact to find its workspace
    const { data: art } = await supabase
        .from("artifacts")
        .select("workspace_id")
        .eq("id", validatedId)
        .single();

    if (art) {
        await ensureMember(supabase, art.workspace_id);
    }

    const { data, error } = await supabase
        .from("artifacts")
        .select("*, tables(title)")
        .eq("id", validatedId)
        .single();

    if (error) {
        logger.error("Failed to get artifact", error, { artifactId: validatedId });
        return null;
    }

    return data;
}
