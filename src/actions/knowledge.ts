"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureMember } from "@/lib/auth-utils"
import { z } from "zod"
import { logger } from "@/lib/logger"

const KnowledgeCategorySchema = z.enum(['business_rule', 'product_info', 'brand_voice', 'customer_profile', 'other'])

const CreateKnowledgeSchema = z.object({
    workspaceId: z.string().uuid(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    category: KnowledgeCategorySchema,
})

const UpdateKnowledgeSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    category: KnowledgeCategorySchema.optional(),
    is_active: z.boolean().optional(),
})

export type KnowledgeCategory = 'business_rule' | 'product_info' | 'brand_voice' | 'customer_profile' | 'other'

export interface KnowledgeItem {
    id: string
    workspace_id: string
    title: string
    content: string
    category: KnowledgeCategory
    is_active: boolean
    created_at: string
}

export async function listKnowledge(workspaceId: string) {
    const supabase = await createClient()

    // Verify membership
    await ensureMember(supabase, workspaceId)

    const { data, error } = await supabase
        .from("workspace_knowledge")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        logger.error("Failed to list knowledge", error, { workspaceId })
        return []
    }

    return data as KnowledgeItem[]
}

export async function createKnowledge(workspaceId: string, payload: {
    title: string
    content: string
    category: KnowledgeCategory
}) {
    // Validate Input
    const validated = CreateKnowledgeSchema.parse({ workspaceId, ...payload })

    const supabase = await createClient()

    // Verify membership
    await ensureMember(supabase, validated.workspaceId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data, error } = await supabase
        .from("workspace_knowledge")
        .insert({
            workspace_id: validated.workspaceId,
            title: validated.title,
            content: validated.content,
            category: validated.category,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        logger.error("Failed to create knowledge", error, { workspaceId: validated.workspaceId, title: validated.title })
        throw new Error("Failed to create knowledge")
    }

    revalidatePath("/app/brain")
    return data as KnowledgeItem
}

export async function updateKnowledge(id: string, payload: {
    title?: string
    content?: string
    category?: KnowledgeCategory
    is_active?: boolean
}) {
    // Validate Input
    const { id: validatedId, ...validatedPayload } = UpdateKnowledgeSchema.parse({ id, ...payload })

    const supabase = await createClient()

    // 1. Authorization: Fetch item to find its workspace
    const { data: item } = await supabase
        .from("workspace_knowledge")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (item) {
        await ensureMember(supabase, item.workspace_id)
    }

    const { data, error } = await supabase
        .from("workspace_knowledge")
        .update(validatedPayload)
        .eq("id", validatedId)
        .select()
        .single()

    if (error) {
        logger.error("Failed to update knowledge", error, { id: validatedId })
        throw new Error("Failed to update knowledge")
    }

    revalidatePath("/app/brain")
    return data as KnowledgeItem
}

export async function deleteKnowledge(id: string) {
    // Validate Input
    const validatedId = z.string().uuid().parse(id)

    const supabase = await createClient()

    // 1. Authorization: Fetch item to find its workspace
    const { data: item } = await supabase
        .from("workspace_knowledge")
        .select("workspace_id")
        .eq("id", validatedId)
        .single()

    if (item) {
        await ensureMember(supabase, item.workspace_id)
    }

    const { error } = await supabase
        .from("workspace_knowledge")
        .delete()
        .eq("id", validatedId)

    if (error) {
        logger.error("Failed to delete knowledge", error, { id: validatedId })
        throw new Error("Failed to delete knowledge")
    }

    revalidatePath("/app/brain")
    return true
}

/**
 * Fetches all active knowledge for a workspace to be used in AI prompts
 */
export async function getActiveWorkspaceContext(workspaceId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("workspace_knowledge")
        .select("category, title, content")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)

    if (error) {
        logger.error("Error fetching context for AI", error, { workspaceId })
        return ""
    }

    if (!data || data.length === 0) return ""

    // Format knowledge into a string for the prompt
    const contextString = data.map(item => {
        const categoryMap: Record<string, string> = {
            business_rule: "Regra de Negócio",
            product_info: "Informação do Produto",
            brand_voice: "Voz da Marca",
            customer_profile: "Perfil do Cliente",
            other: "Contexto"
        }
        return `### ${categoryMap[item.category] || "Contexto"}: ${item.title}\n${item.content}`
    }).join("\n\n")

    return `\n\n--- CONTEXTO DO WORKSPACE (THE BRAIN) ---\nUse as informações abaixo como verdade absoluta sobre a empresa para guiar suas respostas e evitar alucinações:\n\n${contextString}\n-------------------------------------------\n`
}
