import { getTemplate, trackTemplateView } from "@/actions/library"
import { createTable } from "@/actions/tables"
import { createClient } from "@/lib/supabase/server"
import { RiskBanner } from "@/components/risk-banner"
import { StartMesaButton } from "./start-mesa-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

type PageProps = {
    params: {
        templateKey: string
    }
}

import { getOrCreateWorkspace } from "../../workspace-utils"

// ... imports remain the same

export default async function TemplateDetailPage(props: PageProps) {
    const params = await props.params
    const { templateKey } = params

    // Get template
    const template = await getTemplate(templateKey)
    if (!template) {
        notFound()
    }

    // Get user and workspace
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?next=/app/library/${templateKey}`)
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id)

    if (!workspace) {
        return (
            <div className="min-h-screen bg-black text-white p-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Erro ao Configurar Workspace</h1>
                <p className="text-red-500 mb-4">Não foi possível carregar seu workspace.</p>
                <p className="text-zinc-500 text-sm">Por favor, recarregue a página ou entre em contato com o suporte.</p>
            </div>
        )
    }

    // Track view
    await trackTemplateView(template.id, workspace.id)

    const isHighRisk = template.risk_level === 'high'
    const isAdvanced = template.difficulty === 'advanced'

    // Check if user has access to this template
    const plan = workspace.subscription_plan || 'free'
    let isBlocked = (plan === 'free' && (isAdvanced || isHighRisk)) ||
        (plan === 'starter' && isHighRisk)

    if (user.email === 'nicoolascf55@gmail.com') {
        isBlocked = false
    }

    const upgradeReason = isHighRisk ? 'high-risk' : 'advanced'

    // Server action to start mesa
    async function startMesa() {
        'use server'

        if (!template) {
            redirect('/app/library')
        }

        // Double-check access server-side
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) redirect('/login')

        const ws = await getOrCreateWorkspace(supabase, user.id)

        const currentPlan = ws?.subscription_plan || 'free'
        let blocked = (currentPlan === 'free' && (template.difficulty === 'advanced' || template.risk_level === 'high')) ||
            (currentPlan === 'starter' && template.risk_level === 'high')

        if (user && user.email === 'nicoolascf55@gmail.com') {
            blocked = false
        }

        if (blocked) {
            redirect('/upgrade')
        }

        if (!ws) throw new Error("Workspace not found")

        const tableId = await createTable(ws.id, template.key, template.name)
        redirect(`/app/tables/${tableId}`)
    }




    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Back Link */}
                <Link
                    href="/app/library"
                    className="inline-flex items-center text-zinc-400 hover:text-white mb-8 text-sm"
                >
                    ← Voltar para biblioteca
                </Link>

                {/* Risk Banner */}
                {isHighRisk && <RiskBanner />}

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-3">
                                {template.name}
                            </h1>
                            <p className="text-xl text-zinc-400">
                                {template.tagline}
                            </p>
                        </div>
                        {template.category && (
                            <div className="text-4xl">
                                {template.category.icon}
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {template.category && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                {template.category.name}
                            </Badge>
                        )}
                        {template.job && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                {template.job.icon} {template.job.name}
                            </Badge>
                        )}
                        {isAdvanced && (
                            <Badge className="bg-violet-600 text-white">
                                PRO
                            </Badge>
                        )}
                        {isHighRisk && (
                            <Badge className="bg-red-600 text-white flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                ALTO RISCO
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Description */}
                {template.description && (
                    <Card className="bg-zinc-900 border-zinc-800 mb-8">
                        <CardHeader>
                            <CardTitle className="text-white">Sobre esta Mesa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-zinc-300 leading-relaxed">
                                {template.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* What You'll Get */}
                <Card className="bg-zinc-900 border-zinc-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            O que você vai receber
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {template.outputs.map((output) => (
                                <li key={output} className="flex items-start gap-3 text-zinc-300">
                                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="capitalize">{output.replace(/-/g, ' ')}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* How It Works */}
                <Card className="bg-zinc-900 border-zinc-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Como funciona</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Forneça contexto</h4>
                                    <p className="text-sm text-zinc-400">
                                        Responda perguntas sobre seu objetivo e contexto
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Converse com especialistas</h4>
                                    <p className="text-sm text-zinc-400">
                                        Debata com personas de IA (Cético, Criativo, Analítico)
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Receba artefatos prontos</h4>
                                    <p className="text-sm text-zinc-400">
                                        Baixe documentos estruturados para executar imediatamente
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Estimate */}
                <div className="flex items-center gap-2 text-zinc-400 mb-8">
                    <Clock className="h-5 w-5" />
                    <span>Tempo estimado: ~{template.estimated_time_minutes} minutos</span>
                </div>

                {/* CTA */}
                <StartMesaButton
                    isBlocked={isBlocked}
                    upgradeReason={upgradeReason}
                    isHighRisk={isHighRisk}
                    startMesaAction={startMesa}
                />
            </div>
        </div>
    )
}
