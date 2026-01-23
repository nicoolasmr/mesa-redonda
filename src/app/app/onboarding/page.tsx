"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { convertDraftToRun, grantLedgerEntry } from "@/actions/demo"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateWorkspace } from "../workspace-utils"

function OnboardingContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const draftId = searchParams.get('draftId')
    const [status, setStatus] = useState("Configurando seu workspace...")
    const supabase = createClient()

    useEffect(() => {
        async function runSetup() {
            // 1. Ensure User is Logged In
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                return
            }

            try {
                // 2. Identify/Create Workspace
                setStatus("Localizando workspace...")

                const workspace = await getOrCreateWorkspace(supabase, user.id)

                if (!workspace) {
                    throw new Error("Falha ao criar workspace")
                }

                console.log('[Onboarding] Workspace ready:', workspace.id)
                const workspaceId = workspace.id

                // 3. Grant Setup Bonus (+5 Credits)
                setStatus("Adicionando 5 créditos gratuitos...")
                await grantLedgerEntry(workspaceId, 5, 'signup_bonus')

                // 4. Convert Draft (if exists)
                if (draftId) {
                    setStatus("Gerando sua primeira análise...")
                    const runId = await convertDraftToRun(draftId, workspaceId)
                    if (runId) {
                        router.push(`/app/analyzer/${runId}`)
                        return
                    }
                }

                // Default fallback
                router.push('/app')

            } catch (err) {
                console.error(err)
                setStatus("Algo deu errado. Redirecionando...")
                setTimeout(() => router.push('/app'), 2000)
            }
        }

        const timer = setTimeout(runSetup, 1000)
        return () => clearTimeout(timer)
    }, [draftId, router, supabase])

    return (
        <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-4" />
            <h1 className="text-xl font-bold">{status}</h1>
            <p className="text-zinc-500 text-sm mt-2">Isso pode levar alguns segundos.</p>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-4" />
                    <p className="text-zinc-500 text-sm">Carregando...</p>
                </div>
            }>
                <OnboardingContent />
            </Suspense>
        </div>
    )
}
