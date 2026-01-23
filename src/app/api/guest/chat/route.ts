import { NextRequest, NextResponse } from "next/server"
import { getServiceRoleClient, GUEST_COOKIE_NAME } from "@/lib/guest"

/**
 * POST /api/guest/chat
 * Simple chat endpoint for guest users (no credit consumption)
 * Returns a stub response for demo purposes
 */
export async function POST(req: NextRequest) {
    try {
        const cookieGuestId = req.cookies.get(GUEST_COOKIE_NAME)?.value
        const headerGuestId = req.headers.get("x-guest-id")
        const guestId = cookieGuestId || headerGuestId

        if (!guestId) {
            return NextResponse.json(
                { error: "Guest session not initialized" },
                { status: 401 }
            )
        }

        // Verify guest exists and has credits
        const supabase = getServiceRoleClient()
        const { data, error } = await supabase
            .from("guest_credits")
            .select("credits_remaining")
            .eq("guest_id", guestId)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: "Invalid guest session" },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await req.json()
        const { message, tableType } = body

        if (!message || !tableType) {
            return NextResponse.json(
                { error: "Missing required fields: message, tableType" },
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

        // Update last_seen_at
        await supabase
            .from("guest_credits")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("guest_id", guestId)

        // Return stub chat response (deterministic-first)
        const response = {
            text: `Entendi! Você quer trabalhar em **${tableType}** com o tema: "${message}". 

Para criar um artefato completo (plano executável, análise SWOT, ou roadmap), clique em **"Gerar Artefato"**.

Isso vai consumir 1 dos seus ${data.credits_remaining} créditos restantes.`,
            creditsRemaining: data.credits_remaining,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Guest chat error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
