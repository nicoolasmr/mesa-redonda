"use client"

import { useState } from "react"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type StartMesaButtonProps = {
    isBlocked: boolean
    upgradeReason: 'advanced' | 'high-risk'
    isHighRisk: boolean
    startMesaAction: () => Promise<void>
}

export function StartMesaButton({ isBlocked, upgradeReason, isHighRisk, startMesaAction }: StartMesaButtonProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    async function handleClick() {
        if (isBlocked) {
            setShowUpgradeModal(true)
        } else {
            await startMesaAction()
        }
    }

    return (
        <>
            <Button
                onClick={handleClick}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
            >
                {isBlocked ? 'Fazer Upgrade para Acessar' : 'Iniciar Mesa'}
                <ArrowRight className="ml-2 h-5 w-5" />
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
