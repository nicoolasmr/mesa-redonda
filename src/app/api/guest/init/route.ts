import { NextRequest, NextResponse } from "next/server"
import { getServiceRoleClient, GUEST_COOKIE_NAME, GUEST_COOKIE_MAX_AGE } from "@/lib/guest"
import { randomUUID } from "crypto"

/**
 * POST /api/guest/init
 * Initialize guest session and return credits
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = getServiceRoleClient()

        // Check if guest_id cookie exists
        const existingGuestId = req.cookies.get(GUEST_COOKIE_NAME)?.value

        if (existingGuestId) {
            // Fetch existing credits
            const { data, error } = await supabase
                .from("guest_credits")
                .select("credits_remaining")
                .eq("guest_id", existingGuestId)
                .single()

            if (!error && data) {
                // Update last_seen_at
                await supabase
                    .from("guest_credits")
                    .update({ last_seen_at: new Date().toISOString() })
                    .eq("guest_id", existingGuestId)

                return NextResponse.json({
                    guestId: existingGuestId,
                    creditsRemaining: data.credits_remaining,
                })
            }
        }

        // Create new guest
        const newGuestId = randomUUID()

        const { error: insertError } = await supabase
            .from("guest_credits")
            .insert({
                guest_id: newGuestId,
                credits_remaining: 5,
            })

        if (insertError) {
            console.error("Error creating guest:", insertError)
            return NextResponse.json(
                { error: "Failed to initialize guest session" },
                { status: 500 }
            )
        }

        // Set HttpOnly cookie
        const response = NextResponse.json({
            guestId: newGuestId,
            creditsRemaining: 5,
        })

        response.cookies.set(GUEST_COOKIE_NAME, newGuestId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: GUEST_COOKIE_MAX_AGE,
            path: "/",
        })

        return response
    } catch (error) {
        console.error("Guest init error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
