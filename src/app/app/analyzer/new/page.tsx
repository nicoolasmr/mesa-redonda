"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createAnalysis, runAnalysis } from "@/actions/analyzer"
import { SPECIALIST_TEMPLATES, SpecialistKey } from "@/lib/analyzer/specialists"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, ShieldAlert, Upload, Loader2, CheckCircle2 } from "lucide-react"

export default function NewAnalysisPage() {
    const router = useRouter()
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Form state
    const [title, setTitle] = useState("")
    const [specialistKey, setSpecialistKey] = useState<SpecialistKey>("marketing")
    const [userGoal, setUserGoal] = useState("")
    const [jurisdiction, setJurisdiction] = useState("")
    const [consent, setConsent] = useState(false)

    useEffect(() => {
        async function loadWorkspace() {
            try {
                const response = await fetch('/api/workspaces')
                const workspaces = await response.json()
                if (workspaces.length > 0) setWorkspaceId(workspaces[0].id)
            } catch (error) { console.error(error) }
        }
        loadWorkspace()
    }, [])

    const selectedSpecialist = SPECIALIST_TEMPLATES[specialistKey]

    async function handleCreate() {
        if (!workspaceId) return
        setLoading(true)
        try {
            const id = await createAnalysis(workspaceId, {
                title,
                specialist_key: specialistKey,
                user_goal: userGoal,
                jurisdiction,
                consent_confirmed: consent
            })

            // For MVP: Simulated upload and auto-run
            // In Production: User uploads files first, then runs.
            await runAnalysis(id)

            router.push(`/app/analyzer/${id}`)
        } catch (error) {
            alert("Erro ao criar análise.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Nova Análise Estratégica</h1>
                    <p className="text-zinc-500">Siga os passos para extrair inteligência dos seus arquivos.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Steps */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${step === s ? "border-violet-500 bg-violet-500/20 text-white" :
                                        step > s ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-zinc-800 text-zinc-600"
                                    }`}>
                                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                                </div>
                                <span className={`text-sm font-medium ${step === s ? "text-white" : "text-zinc-600"}`}>
                                    {s === 1 ? "Especialista" : s === 2 ? "Objetivo" : "Anexos"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-3">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-white text-emerald-500">1. Escolha o Especialista</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.values(SPECIALIST_TEMPLATES).map((tmpl) => (
                                            <button
                                                key={tmpl.key}
                                                onClick={() => setSpecialistKey(tmpl.key as SpecialistKey)}
                                                className={`p-6 rounded-2xl border-2 transition-all text-left flex gap-4 items-start ${specialistKey === tmpl.key
                                                        ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/50"
                                                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div className="text-3xl bg-zinc-950 p-3 rounded-xl">{tmpl.icon}</div>
                                                <div>
                                                    <div className="text-white font-bold mb-1 text-sm">{tmpl.name}</div>
                                                    <Badge variant="outline" className={`text-[9px] mb-2 uppercase tracking-tighter ${tmpl.risk_level === 'high' ? 'text-red-400 border-red-500/30' :
                                                            tmpl.risk_level === 'medium' ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
                                                        }`}>
                                                        {tmpl.risk_level} Risk
                                                    </Badge>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={() => setStep(2)} className="w-full bg-violet-600 hover:bg-violet-700 h-14 rounded-2xl text-lg font-bold">
                                    Próximo: Definir Objetivo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold mb-6 text-white text-emerald-500">2. Qual o seu Objetivo?</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Título da Análise</label>
                                        <Input
                                            placeholder="Ex: Análise de Fluxo de Caixa Q4, Auditoria de Contrato Social..."
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800 h-14 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">O que a IA deve buscar nos arquivos?</label>
                                        <Textarea
                                            placeholder="Descreva seu pedido. Ex: 'Encontre gastos desnecessários', 'Identifique cláusulas de rescisão', 'Compare conversão por canal'..."
                                            value={userGoal}
                                            onChange={(e) => setUserGoal(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800 min-h-[150px] rounded-xl"
                                        />
                                    </div>

                                    {selectedSpecialist.risk_level === 'high' && (
                                        <div className="p-6 bg-red-950/10 border border-red-500/20 rounded-2xl space-y-4">
                                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                                <ShieldAlert className="h-5 w-5" />
                                                Especialista de Alto Risco Selecionado
                                            </div>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="Jurisdição (ex: Brasil/SP, EUA/Delaware)"
                                                    value={jurisdiction}
                                                    onChange={(e) => setJurisdiction(e.target.value)}
                                                    className="bg-zinc-950 border-red-500/20"
                                                />
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={consent}
                                                        onChange={(e) => setConsent(e.target.checked)}
                                                        className="h-5 w-5 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-violet-500"
                                                    />
                                                    <span className="text-xs text-zinc-400 leading-relaxed">
                                                        Entendo que esta análise é baseada em IA e não substitui um profissional especializado. Aceito os riscos e confirmo que os dados são para fins informativos.
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} className="h-14 px-8 text-zinc-500">Voltar</Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        disabled={!title || !userGoal || (selectedSpecialist.risk_level === 'high' && (!jurisdiction || !consent))}
                                        className="flex-1 bg-violet-600 hover:bg-violet-700 h-14 rounded-2xl text-lg font-bold"
                                    >
                                        Próximo: Anexar Arquivos
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold mb-6 text-white text-emerald-500">3. Anexar Arquivos</h2>
                                <div className="p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30 text-center space-y-4">
                                    <div className="bg-zinc-900 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                                        <Upload className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Solte seus arquivos aqui ou clique para buscar</p>
                                        <p className="text-zinc-600 text-sm mt-1">PDF, XLSX, CSV ou Imagens (Máx 20MB)</p>
                                    </div>
                                    <Button variant="outline" className="border-zinc-700 text-zinc-400">Explorar Arquivos</Button>
                                </div>

                                <div className="p-4 bg-violet-600/5 border border-violet-500/20 rounded-2xl flex gap-4 items-start">
                                    <AlertCircle className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        <strong>Nota do Sistema:</strong> No MVP, arquivos simulados serão usados para validar o pipeline estratégico. O upload real de arquivos grandes requer uma conta Pro+.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={() => setStep(2)} className="h-14 px-8 text-zinc-500">Voltar</Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={loading}
                                        className="flex-1 bg-violet-600 hover:bg-violet-700 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-violet-900/20"
                                    >
                                        {loading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando Análise...</>
                                        ) : (
                                            <><ArrowRight className="mr-2 h-5 w-5" /> Iniciar Análise de Especialista</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
