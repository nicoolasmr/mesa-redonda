"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Zap, Check } from "lucide-react"
import Link from "next/link"

type UpgradeModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    reason?: 'advanced' | 'high-risk'
}

export function UpgradeModal({ open, onOpenChange, reason = 'advanced' }: UpgradeModalProps) {
    const title = reason === 'high-risk'
        ? 'Templates de Alto Risco Requerem Plano Pro'
        : 'Template Avançado Requer Plano Pro'

    const description = reason === 'high-risk'
        ? 'Templates legais e financeiros estão disponíveis apenas para usuários Pro, com guardrails e disclaimers adequados.'
        : 'Este template avançado está disponível apenas para usuários do plano Pro ou superior.'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-400 text-base">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Pro Plan Benefits */}
                    <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Plano Pro</h3>
                                <p className="text-sm text-zinc-400">Acesso completo à biblioteca</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">R$ 99</div>
                                <div className="text-sm text-zinc-400">/mês</div>
                            </div>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Mesas ilimitadas</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Todos os templates básicos e avançados</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Templates de alto risco (legal, financeiro, patentes)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Modo Cético avançado</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Workspaces colaborativos</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-300">
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span>Suporte prioritário</span>
                            </li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3">
                        <Link href="/upgrade" className="flex-1">
                            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3">
                                <Zap className="mr-2 h-4 w-4" />
                                Fazer Upgrade para Pro
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                            Voltar
                        </Button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center">
                        Cancele quando quiser. Sem taxas de cancelamento.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
