"use client"

import { useState } from "react"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

type StartMesaButtonProps = {
    isBlocked: boolean
    upgradeReason: 'advanced' | 'high-risk'
    isHighRisk: boolean
    startMesaAction: () => Promise<void>
}

export function StartMesaButton({ isBlocked, upgradeReason, isHighRisk, startMesaAction }: StartMesaButtonProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleClick() {
        if (isBlocked) {
            setShowUpgradeModal(true)
        } else {
            setIsLoading(true)
            try {
                await startMesaAction()
            } catch (error) {
                console.error("Start mesa error:", error)
                toast.error("Erro ao iniciar mesa", {
                    description: error instanceof Error ? error.message : "Tente novamente mais tarde"
                })
                setIsLoading(false)
            }
        }
    }

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Iniciando...
                    </>
                ) : (
                    <>
                        {isBlocked ? 'Fazer Upgrade para Acessar' : 'Iniciar Mesa'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>

            {isHighRisk && !isBlocked && (
                <p className="text-xs text-zinc-500 text-center mt-4">
                    Ao iniciar, você confirma que entende que este conteúdo é informativo e não substitui profissional qualificado.
                </p>
            )}

            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
                reason={upgradeReason}
            />
        </>
    )
}
