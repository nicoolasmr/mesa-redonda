'use server'

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { createAnalysis } from "@/actions/analyzer"
import { ensureMember } from "@/lib/auth-utils"
import { z } from "zod"
import { logger } from "@/lib/logger"

const CreateDraftSchema = z.object({
    mesaKey: z.string().min(1),
    userInput: z.string().min(1),
});

const SubmitLeadSchema = z.object({
    draftId: z.string().uuid(),
    lead: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(8),
        consent: z.boolean().refine(v => v === true, "Consent required"),
    }),
});

const ConvertDraftSchema = z.object({
    draftId: z.string().uuid(),
    workspaceId: z.string().uuid(),
});

const GrantLedgerSchema = z.object({
    workspaceId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string().min(1),
});

// Admin client for bypassing RLS on public actions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

/* 
 * 1. DRAFT CREATION
 */
export async function createDraft(mesaKey: string, userInput: string) {
    // Validate Input
    const validated = CreateDraftSchema.parse({ mesaKey, userInput });

    // secure action: using admin client because anon cannot insert by default content policy
    const { data, error } = await supabaseAdmin
        .from('demo_drafts')
        .insert({
            mesa_key: validated.mesaKey,
            user_input: validated.userInput,
            status: 'created'
        })
        .select('id')
        .single()

    if (error) {
        logger.error("Draft creation error", error, { mesaKey: validated.mesaKey });
        throw new Error("Erro ao criar rascunho. Tente novamente.")
    }

    return data.id
}

/* 
 * 2. LEAD CAPTURE
 */
export async function submitLead(draftId: string, lead: { name: string, email: string, phone: string, consent: boolean }) {
    // Validate Input
    const validated = SubmitLeadSchema.parse({ draftId, lead });

    // Admin client to write lead and update draft
    const { data: leadData, error: leadError } = await supabaseAdmin
        .from('leads')
        .insert({
            name: validated.lead.name,
            email: validated.lead.email,
            phone: validated.lead.phone,
            consent_marketing: validated.lead.consent
        })
        .select('id')
        .single()

    if (leadError) {
        logger.error("Lead submission error", leadError, { draftId: validated.draftId });
        throw new Error("Erro ao salvar dados.");
    }

    // Update Draft
    const { error: draftError } = await supabaseAdmin
        .from('demo_drafts')
        .update({
            lead_id: leadData.id,
            status: 'unlocked'
        })
        .eq('id', validated.draftId)

    if (draftError) {
        logger.error("Draft update error", draftError, { draftId: validated.draftId });
        throw new Error("Erro ao vincular rascunho.");
    }

    return { success: true }
}

/* 
 * 3. POST-SIGNUP CONVERSION
 */
export async function convertDraftToRun(draftId: string, workspaceId: string) {
    // Validate Input
    const validated = ConvertDraftSchema.parse({ draftId, workspaceId });

    const supabase = await createServerClient()
    await ensureMember(supabase, validated.workspaceId)

    const { data: draft } = await supabaseAdmin.from('demo_drafts').select('*').eq('id', validated.draftId).single()

    if (!draft) return null

    // 2. Debit Credit (1 cost) -> User action, should use user client? 
    await grantLedgerEntry(validated.workspaceId, -1, 'run_cost_demo')

    // 3. Create Analysis
    const analysisId = await createAnalysis(validated.workspaceId, {
        title: "Estratégia Demo",
        specialist_key: draft.mesa_key as any,
        user_goal: draft.user_input,
        consent_confirmed: true
    })

    // 4. Update Draft Status
    await supabaseAdmin.from('demo_drafts').update({
        status: 'converted',
        converted_run_id: analysisId
    }).eq('id', validated.draftId)

    return analysisId
}

/*
 * HELPER: LEDGER
 */
export async function grantLedgerEntry(workspaceId: string, amount: number, reason: string) {
    // Validate Input
    const validated = GrantLedgerSchema.parse({ workspaceId, amount, reason });

    const supabase = await createServerClient()
    await ensureMember(supabase, validated.workspaceId)
    const { error } = await supabase.from('credits_ledger').insert({
        workspace_id: validated.workspaceId,
        amount: validated.amount,
        reason: validated.reason
    })
    // If it fails due to RLS, fallback to admin
    if (error) {
        logger.warn("Ledger insert via user client failed, falling back to admin", { workspaceId: validated.workspaceId });
        await supabaseAdmin.from('credits_ledger').insert({
            workspace_id: validated.workspaceId,
            amount: validated.amount,
            reason: validated.reason
        })
    }
}
