"use client"

import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { upgradeCurrentSession } from "@/actions/stripe"
import { toast } from "sonner"

const PLANS = [
    {
        name: "Grátis",
        price: "R$ 0",
        description: "Para explorar o poder da IA estratégica",
        features: [
            "1 Mesa Redonda / mês",
            "5 Créditos de Análise / mês",
            "Personas básicas",
            "Upload de até 20MB"
        ],
        cta: "Começar Agora",
        planKey: "free",
        variant: "outline" as const
    },
    {
        name: "Starter",
        price: "R$ 79/mês",
        description: "Para fundadores early-stage",
        features: [
            "10 Mesas Redondas / mês",
            "50 Créditos de análise",
            "Personas C-Level",
            "Upload de até 100MB"
        ],
        cta: "Assinar Starter",
        planKey: "starter",
        highlight: false,
        variant: "secondary" as const
    },
    {
        name: "Growth",
        price: "R$ 129/mês",
        description: "Para acelerar validação e vendas",
        features: [
            "25 Mesas Redondas / mês",
            "250 Créditos de análise",
            "Acesso a templates Growth",
            "Upload de até 250MB"
        ],
        cta: "Assinar Growth",
        planKey: "growth",
        highlight: true,
        variant: "default" as const
    },
    {
        name: "Pro Founder",
        price: "R$ 197/mês",
        description: "Para operação em escala",
        features: [
            "50 Mesas Redondas / mês",
            "500 Créditos de análise",
            "Acesso antecipado a templates",
            "Upload de até 500MB",
            "Prioridade no suporte"
        ],
        cta: "Ser Pro",
        planKey: "pro",
        highlight: false,
        variant: "secondary" as const
    }
]

function PricingButton({ planKey, cta, highlight }: { planKey: string, cta: string, highlight?: boolean }) {
    const [loading, setLoading] = useState(false)

    const handleAction = async () => {
        if (planKey === 'free') {
            window.location.href = '/login'
            return
        }

        setLoading(true)
        try {
            const url = await upgradeCurrentSession(planKey)
            if (url) {
                window.location.href = url
            } else {
                toast.error("Erro ao iniciar assinatura. Tente novamente.")
                setLoading(false)
            }
        } catch (error) {
            toast.error("Erro no checkout.")
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-6 text-lg font-bold transition-all duration-300 ${highlight
                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
        >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : cta}
        </Button>
    )
}

export function PricingTable() {
    return (
        <section id="pricing" className="py-24 container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">Investimento que se paga na primeira decisão.</h2>
                <p className="text-xl text-zinc-400">
                    Escolha o plano ideal para o estágio da sua empresa.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`flex flex-col relative rounded-2xl p-8 border ${plan.highlight
                            ? "bg-zinc-900/80 border-violet-500 shadow-2xl shadow-violet-500/10"
                            : "bg-black border-zinc-800"
                            }`}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                MAIS POPULAR
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-3xl font-black text-white mb-2">{plan.price}</div>
                        <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto">
                            <PricingButton
                                planKey={plan.planKey}
                                cta={plan.cta}
                                highlight={plan.highlight}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
