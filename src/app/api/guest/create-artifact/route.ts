import { NextRequest, NextResponse } from "next/server"
import { getServiceRoleClient, GUEST_COOKIE_NAME } from "@/lib/guest"

/**
 * POST /api/guest/create-artifact
 * Create artifact and consume 1 credit
 */
export async function POST(req: NextRequest) {
    try {
        const cookieGuestId = req.cookies.get(GUEST_COOKIE_NAME)?.value
        const headerGuestId = req.headers.get("x-guest-id")
        const guestId = cookieGuestId || headerGuestId

        if (!guestId) {
            return NextResponse.json(
                { error: "Guest session not initialized", upgradeRequired: true },
                { status: 401 }
            )
        }

        const supabase = getServiceRoleClient()

        // Fetch current credits (with row lock for transaction safety)
        const { data: creditData, error: creditError } = await supabase
            .from("guest_credits")
            .select("credits_remaining")
            .eq("guest_id", guestId)
            .single()

        if (creditError || !creditData) {
            return NextResponse.json(
                { error: "Invalid guest session", upgradeRequired: true },
                { status: 401 }
            )
        }

        // Check if credits available
        if (creditData.credits_remaining <= 0) {
            return NextResponse.json(
                {
                    error: "No credits remaining. Sign up to continue!",
                    upgradeRequired: true,
                    creditsRemaining: 0
                },
                { status: 402 }
            )
        }

        // Parse request body
        const body = await req.json()
        const { tableType, goal, conversation } = body

        if (!tableType || !goal) {
            return NextResponse.json(
                { error: "Missing required fields: tableType, goal" },
                { status: 400 }
            )
        }

        // Validate tableType
        const validTypes = ["marketing", "produto", "carreira", "estudos"]
        if (!validTypes.includes(tableType)) {
            return NextResponse.json(
                { error: "Invalid table type" },
                { status: 400 }
            )
        }

        // Generate deterministic artifact (stub for demo)
        const artifactJson = generateDemoArtifact(tableType, goal)

        // Insert artifact
        const { data: artifactData, error: artifactError } = await supabase
            .from("guest_artifacts")
            .insert({
                guest_id: guestId,
                table_type: tableType,
                prompt: goal,
                result_json: artifactJson,
            })
            .select("public_id")
            .single()

        if (artifactError || !artifactData) {
            console.error("Error creating artifact:", artifactError)
            return NextResponse.json(
                { error: "Failed to create artifact" },
                { status: 500 }
            )
        }

        // Decrement credits
        const newCredits = creditData.credits_remaining - 1
        const { error: updateError } = await supabase
            .from("guest_credits")
            .update({
                credits_remaining: newCredits,
                last_seen_at: new Date().toISOString()
            })
            .eq("guest_id", guestId)

        if (updateError) {
            console.error("Error updating credits:", updateError)
            // Artifact was created but credit not decremented - log for manual review
        }

        return NextResponse.json({
            success: true,
            artifactPublicId: artifactData.public_id,
            creditsRemaining: newCredits,
            shareUrl: `/share/guest/${artifactData.public_id}`,
        })
    } catch (error) {
        console.error("Guest create-artifact error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * Generate demo artifact (deterministic-first)
 */
function generateDemoArtifact(tableType: string, goal: string) {
    const baseArtifact = {
        type: "exec_summary",
        goal,
        tableType,
        createdAt: new Date().toISOString(),
    }

    switch (tableType) {
        case "marketing":
            return {
                ...baseArtifact,
                summary: `Plano de Marketing para: ${goal}`,
                sections: [
                    {
                        title: "Objetivo Principal",
                        content: `Desenvolver estratégia de marketing para ${goal} com foco em aquisição e retenção.`
                    },
                    {
                        title: "Canais Prioritários",
                        content: "1. SEO/Content Marketing\n2. LinkedIn Organic\n3. Cold Email Outreach"
                    },
                    {
                        title: "Métricas-Chave",
                        content: "CAC, LTV, Conversion Rate, MQL→SQL"
                    },
                    {
                        title: "Próximos Passos (7 dias)",
                        content: "1. Definir ICP\n2. Criar landing page\n3. Setup analytics\n4. Primeiro conteúdo"
                    }
                ],
                cta: "Entre para criar planos completos com análise SWOT, roadmap e métricas detalhadas!"
            }
        case "produto":
            return {
                ...baseArtifact,
                summary: `Roadmap de Produto para: ${goal}`,
                sections: [
                    {
                        title: "Visão do Produto",
                        content: `Desenvolver ${goal} com foco em outcome-based delivery.`
                    },
                    {
                        title: "Features Prioritárias (RICE)",
                        content: "1. MVP Core (Reach: Alto, Impact: Alto)\n2. Onboarding (Reach: Alto, Impact: Médio)\n3. Analytics (Reach: Médio, Impact: Alto)"
                    },
                    {
                        title: "Horizonte Now/Next/Later",
                        content: "**Now:** MVP\n**Next:** Growth features\n**Later:** Enterprise features"
                    },
                    {
                        title: "Métricas de Sucesso",
                        content: "Activation Rate, Retention D7/D30, NPS"
                    }
                ],
                cta: "Entre para criar roadmaps completos com priorização RICE e stakeholder management!"
            }
        case "carreira":
            return {
                ...baseArtifact,
                summary: `PDI (Plano de Desenvolvimento) para: ${goal}`,
                sections: [
                    {
                        title: "Objetivo de Carreira",
                        content: `Crescer em ${goal} nos próximos 6-12 meses.`
                    },
                    {
                        title: "Diagnóstico Atual",
                        content: "Identificar gaps de skills, experiências e network."
                    },
                    {
                        title: "Regra 70-20-10",
                        content: "**70%** Projetos práticos\n**20%** Mentoria/Feedback\n**10%** Cursos/Leitura"
                    },
                    {
                        title: "Metas SMART (3 meses)",
                        content: "1. Liderar 1 projeto cross-funcional\n2. Apresentar para C-level\n3. Completar certificação X"
                    }
                ],
                cta: "Entre para criar PDIs completos com tracking, 1-on-1s e plano de 90 dias!"
            }
        case "estudos":
            return {
                ...baseArtifact,
                summary: `Plano de Estudos para: ${goal}`,
                sections: [
                    {
                        title: "Objetivo de Aprendizado",
                        content: `Dominar ${goal} em 30-60 dias.`
                    },
                    {
                        title: "Técnica Feynman",
                        content: "1. Estude o conceito\n2. Ensine para uma criança\n3. Identifique gaps\n4. Revise e simplifique"
                    },
                    {
                        title: "Cronograma Semanal",
                        content: "**Seg-Qua:** Teoria (2h/dia)\n**Qui-Sex:** Prática (3h/dia)\n**Sáb:** Revisão e projeto"
                    },
                    {
                        title: "Recursos",
                        content: "Livros, cursos online, projetos práticos, comunidades"
                    }
                ],
                cta: "Entre para criar planos de estudo completos com Pomodoro, tracking e gamificação!"
            }
        default:
            return baseArtifact
    }
}
