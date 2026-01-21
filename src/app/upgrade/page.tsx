import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default async function UpgradePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/app/upgrade")
    }

    // Check if user already has subscription
    // TODO: Implement subscription check via Stripe
    // For now, show upgrade page

    const plans = [
        {
            name: "Starter",
            price: "R$ 49",
            period: "/mês",
            description: "Para profissionais que querem decisões melhores",
            features: [
                "10 mesas por mês",
                "Todas as personas (Cético, Criativo, Analítico)",
                "Exportar artefatos em PDF",
                "Histórico de 30 dias",
            ],
            cta: "Começar Agora",
            highlighted: false,
        },
        {
            name: "Pro",
            price: "R$ 99",
            period: "/mês",
            description: "Para times que precisam de agilidade estratégica",
            features: [
                "Mesas ilimitadas",
                "Modo Cético avançado",
                "Workspaces colaborativos",
                "Histórico ilimitado",
                "Suporte prioritário",
                "Integrações (Notion, Slack)",
            ],
            cta: "Upgrade para Pro",
            highlighted: true,
        },
        {
            name: "Team",
            price: "R$ 299",
            period: "/mês",
            description: "Para empresas que tomam decisões em escala",
            features: [
                "Tudo do Pro",
                "Até 10 membros",
                "SSO (Single Sign-On)",
                "Admin dashboard",
                "SLA de suporte",
                "Onboarding dedicado",
            ],
            cta: "Falar com Vendas",
            highlighted: false,
        },
    ]

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/30 rounded-full px-4 py-2 mb-6">
                        <Lock className="h-4 w-4 text-violet-400" />
                        <span className="text-sm text-violet-300">Upgrade Necessário</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Continue Tomando Decisões Melhores
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Escolha o plano ideal para você ou seu time e desbloqueie todo o potencial da Mesa Redonda.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.highlighted
                                    ? "bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500"
                                    : "bg-zinc-900 border-zinc-800"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        MAIS POPULAR
                                    </div>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    {plan.description}
                                </CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-zinc-500">{plan.period}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                            <span className="text-zinc-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full ${plan.highlighted
                                            ? "bg-violet-600 hover:bg-violet-700"
                                            : "bg-zinc-800 hover:bg-zinc-700"
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ / Benefits */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        Por que assinar a Mesa Redonda?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm text-zinc-400">
                        <div>
                            <div className="text-3xl mb-2">⚡</div>
                            <p className="font-semibold text-white mb-1">Decisões em 15 min</p>
                            <p>Não perca mais tempo em reuniões improdutivas</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">🎯</div>
                            <p className="font-semibold text-white mb-1">Artefatos prontos</p>
                            <p>PDFs, checklists e docs para executar imediatamente</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">🧠</div>
                            <p className="font-semibold text-white mb-1">IA determinística</p>
                            <p>Baseado em frameworks reais, não respostas genéricas</p>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link href="/app" className="text-sm text-zinc-400 hover:text-white">
                        ← Voltar para o app
                    </Link>
                </div>
            </div>
        </div>
    )
}
