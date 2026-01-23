import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Standard Safety Schema that all outputs must inherit/include
export const SafetyMetaSchema = z.object({
    summary: z.string().describe("Executive summary of the analysis (1 paragraph)"),
    assumptions: z.array(z.string()).describe("List of assumptions made due to missing data"),
    confidence: z.enum(['low', 'medium', 'high']).describe("Confidence level of the analysis based on provided data"),
    evidence_refs: z.array(z.string()).describe("Direct citations from source files (e.g. 'Page 3, Table 1')"),
    missing_info_questions: z.array(z.string()).describe("Questions to ask user to improve confidence"),
})

export async function runStructuredAI<T extends z.ZodType>(
    prompt: string,
    schema: T,
    systemContext: string = "You are a senior strategic analyst."
): Promise<z.infer<T> & z.infer<typeof SafetyMetaSchema>> {

    // 1. Enrich Schema with Safety Meta
    // Note: Zod intersection might be tricky with generateObject if not handled well. 
    // We assume the caller passes a schema that *includes* or *extends* base fields, 
    // OR we force the output to be an object containing 'data' and 'meta'.
    // For seamless usage, we'll try to use intersection in the prompt instruction mostly.

    // Actually, simpler approach for "SaaS Real": Force a standard envelope.
    const EnvelopeSchema = z.object({
        analysis: schema,
        meta: SafetyMetaSchema
    })

    try {
        const { object } = await generateObject({
            model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
            schema: EnvelopeSchema,
            system: `
                ${systemContext}
                
                CRITICAL SAFETY RULES:
                1. You must extract evidence references (evidence_refs). If you claim usage increased 10%, cite where.
                2. If data is ambiguous, state it in 'assumptions' and set confidence to 'low' or 'medium'.
                3. Do not hallucinate data. If missing, ask in 'missing_info_questions'.
                4. Always provide an executive 'summary'.
            `,
            prompt: prompt,
            temperature: 0.2, // Low temp for rigorous analysis
            maxRetries: 2,
        })

        // Flatten for consumer convenience
        return {
            ...(object as any).analysis,
            ...object.meta
        }

    } catch (error) {
        console.error("AI Generation Error:", error)
        // Fail closed / Fail safe
        throw new Error("Falha na geração segura da análise. Por favor, tente novamente com mais contexto.")
    }
}
