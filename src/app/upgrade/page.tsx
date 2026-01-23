import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Lock, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createCheckoutSession } from "@/actions/stripe"

export default async function UpgradePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/upgrade")
    }

    // Get workspace to check current plan
    const { data: workspaces } = await supabase
        .from('workspaces')
        .select('subscription_plan')
        .eq('owner_id', user.id)
        .limit(1)

    const currentPlan = (workspaces && workspaces.length > 0) ? workspaces[0].subscription_plan : 'free'

    const plans = [
        {
            id: 'starter',
            name: "Starter",
            price: "R$ 79",
            period: "/mês",
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '',
            description: "Para profissionais que querem decisões melhores",
            features: [
                "10 Mesas/mês",
                "Modelos padrão",
                "Exportação PDF",
            ],
            cta: "COMEÇAR AGORA",
            highlighted: false,
        },
        {
            id: 'pro',
            name: "Pro (Founder)",
            price: "R$ 129",
            period: "/mês",
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
            description: "Para times que precisam de agilidade estratégica",
            features: [
                "Mesas Ilimitadas",
                "Modelos Smart (GPT-4o)",
                "Memória Editável (The Brain)",
            ],
            cta: "COMEÇAR AGORA",
            highlighted: true,
        },
        {
            id: 'team',
            name: "Team",
            price: "R$ 197",
            period: "/mês",
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM || '',
            description: "Para empresas que tomam decisões em escala",
            features: [
                "Tudo do Pro",
                "3 Membros inclusos",
                "Workspace Compartilhado",
            ],
            cta: "COMEÇAR AGORA",
            highlighted: false,
        },
    ]

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Escolha o Plano Ideal
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Upgrade, downgrade ou cancele a qualquer momento. Sem taxas.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${plan.highlighted
                                ? "bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/50 shadow-2xl shadow-violet-900/20"
                                : "bg-zinc-900 border-zinc-800"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Mais Popular
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

                            <CardContent className="flex-1 flex flex-col">
                                <ul className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-zinc-300">
                                            <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-violet-400' : 'text-zinc-500'
                                                }`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <form action={createCheckoutSession.bind(null, plan.priceId)}>
                                    <Button
                                        type="submit"
                                        className={`w-full ${plan.highlighted
                                            ? "bg-violet-600 hover:bg-violet-700 text-white"
                                            : "bg-zinc-800 hover:bg-zinc-700 text-white"
                                            }`}
                                        disabled={currentPlan === plan.id}
                                    >
                                        {currentPlan === plan.id ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Plano Atual
                                            </>
                                        ) : (
                                            <>
                                                {plan.cta}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h3 className="font-semibold text-white mb-2">Posso cancelar a qualquer momento?</h3>
                            <p className="text-zinc-400">
                                Sim. Sem taxas de cancelamento. Cancele direto no app.
                            </p>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h3 className="font-semibold text-white mb-2">Como funciona o upgrade/downgrade?</h3>
                            <p className="text-zinc-400">
                                Você pode mudar de plano a qualquer momento. O valor é ajustado proporcionalmente.
                            </p>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h3 className="font-semibold text-white mb-2">Meus dados estão seguros?</h3>
                            <p className="text-zinc-400">
                                Sim. Usamos criptografia end-to-end. Seus dados não são usados para treinar modelos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to App */}
                <div className="text-center mt-12">
                    <Link href="/app" className="text-zinc-400 hover:text-white transition-colors">
                        ← Voltar para o App
                    </Link>
                </div>
            </div>
        </div>
    )
}
