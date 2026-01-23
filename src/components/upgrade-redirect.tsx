"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createCheckoutSession } from "@/actions/stripe"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function UpgradeRedirect() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const plan = searchParams.get("plan")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!plan) return

        // Prevent double execution
        if (loading) return

        const handleUpgrade = async () => {
            console.log("UpgradeRedirect: Detected plan:", plan)
            setLoading(true)
            const toastId = toast.loading(`Preparando seu upgrade para o plano ${plan}...`, { duration: 10000 })

            try {
                console.log("UpgradeRedirect: Calling upgradeCurrentSession server action...")
                const url = await upgradeCurrentSession(plan)

                if (url) {
                    console.log("UpgradeRedirect: Success! Redirecting to:", url)
                    toast.success("Redirecionando para o Stripe...", { id: toastId })
                    window.location.href = url
                } else {
                    console.error("UpgradeRedirect: Action returned null URL")
                    toast.error("Erro ao gerar link de pagamento. Verifique se você está logado.", { id: toastId })
                    setLoading(false)
                }

            } catch (error: any) {
                console.error("UpgradeRedirect Error:", error)
                toast.error("Erro ao processar upgrade: " + (error.message || "Erro desconhecido"), { id: toastId })
                setLoading(false)
            }
        }

        handleUpgrade()

    }, [plan])

    if (!plan || !loading) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-violet-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Redirecionando para Pagamento...</h2>
                <p className="text-zinc-400">Aguarde um momento</p>
            </div>
        </div>
    )
}

// Minimal action wrapper (we will implement this in src/actions/stripe.ts really, but here for types)
// actually we can't define server action here.
import { upgradeCurrentSession } from "@/actions/stripe" 
