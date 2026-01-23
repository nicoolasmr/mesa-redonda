"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ArrowRight, Lock, CheckCircle2, User, Shield, MessageSquare, Brain } from "lucide-react"

type TableType = "marketing" | "produto" | "carreira" | "estudos"

const tableOptions = [
    { id: "marketing" as TableType, label: "Marketing B2B", icon: "💼", description: "Planos de marketing, ICP, canais" },
    { id: "produto" as TableType, label: "Produto & Roadmap", icon: "🎯", description: "Roadmaps, priorização RICE" },
    { id: "carreira" as TableType, label: "Carreira & PDI", icon: "🚀", description: "Desenvolvimento, metas SMART" },
    { id: "estudos" as TableType, label: "Estudos & Aprendizado", icon: "💡", description: "Planos de estudo, Feynman" },
]

const personas = [
    { name: "O Cético", icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
    { name: "O Estrategista", icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10" },
    { name: "O Analítico", icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/10" },
]

export function LandingDemo() {
    const [step, setStep] = useState<"selection" | "input" | "simulating" | "result">("selection")
    const [selectedTable, setSelectedTable] = useState<TableType>("marketing")
    const [goal, setGoal] = useState("")
    const [chatResponse, setChatResponse] = useState("")
    const [credits, setCredits] = useState<number | null>(null)
    const [artifactLoading, setArtifactLoading] = useState(false)
    const [shareUrl, setShareUrl] = useState<string | null>(null)
    const [simulationIndex, setSimulationIndex] = useState(0)

    // Initialize guest session
    useEffect(() => {
        async function initGuest() {
            try {
                const res = await fetch("/api/guest/init", { method: "POST" })
                const data = await res.json()
                if (data.creditsRemaining !== undefined) {
                    setCredits(data.creditsRemaining)
                }
            } catch (error) {
                console.error("Failed to init guest:", error)
            }
        }
        initGuest()
    }, [])

    const handleNextToInput = () => {
        setStep("input")
    }

    const handleStartSimulation = async (isRetry = false, forcedGuestId: string | null = null) => {
        if (!goal.trim()) return

        setStep("simulating")
        setSimulationIndex(0)

        // Clear previous response
        setChatResponse("")

        // Start simulation animation
        const interval = setInterval(() => {
            setSimulationIndex(prev => {
                if (prev >= personas.length - 1) {
                    clearInterval(interval)
                    return prev
                }
                return prev + 1
            })
        }, 1500)

        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" }
            if (forcedGuestId) {
                headers["x-guest-id"] = forcedGuestId
            }

            const res = await fetch("/api/guest/chat", {
                method: "POST",
                headers,
                body: JSON.stringify({ message: goal, tableType: selectedTable }),
            })

            const data = await res.json()

            if (res.status === 401 && data.error === "Guest session not initialized" && !isRetry) {
                console.log("Session missing - Retrying init...")
                const initRes = await fetch("/api/guest/init", { method: "POST" })
                const initData = await initRes.json()

                if (initRes.ok && initData.guestId) {
                    clearInterval(interval) // Reset animation
                    return handleStartSimulation(true, initData.guestId)
                }
            }

            // Wait for animation to finish before showing result
            setTimeout(() => {
                if (res.ok) {
                    setChatResponse(data.text)
                    if (data.creditsRemaining !== undefined) {
                        setCredits(data.creditsRemaining)
                    }
                    setStep("result")
                } else {
                    setChatResponse(`Erro: ${data.error}`)
                    setStep("result")
                }
            }, 5000)
        } catch (error) {
            console.error("Simulation error:", error)
            setChatResponse("Erro ao processar mensagem.")
            setStep("result")
        }
    }

    const handleCreateArtifact = async () => {
        if (!goal.trim()) return
        setArtifactLoading(true)

        try {
            const res = await fetch("/api/guest/create-artifact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tableType: selectedTable, goal }),
            })

            const data = await res.json()

            if (res.ok) {
                setShareUrl(data.shareUrl)
                setCredits(data.creditsRemaining)
            } else {
                if (data.upgradeRequired) {
                    window.location.href = "/login?next=/app/upgrade"
                } else {
                    alert(`Erro: ${data.error}`)
                }
            }
        } catch (error) {
            alert("Erro ao criar artefato.")
        } finally {
            setArtifactLoading(false)
        }
    }

    return (
        <section className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black py-24 px-4 overflow-hidden">
            <div className="container mx-auto max-w-4xl relative">
                {/* Visual Elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="text-center mb-12 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        🚀 Experimente Agora (Grátis)
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Teste a Mesa Redonda com <span className="text-violet-400 font-semibold">{credits ?? "..."} créditos grátis</span>.
                        Sinta como é ter uma diretoria virtual em segundos.
                    </p>
                </div>

                <div className="relative">
                    {/* Progress Sidebar/Header */}
                    <div className="absolute -left-16 top-0 bottom-0 hidden lg:flex flex-col items-center gap-8 py-8">
                        {["selection", "input", "simulating", "result"].map((s, i) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${step === s ? "border-violet-500 bg-violet-500/20 text-white scale-110" :
                                    (["selection", "input", "simulating", "result"].indexOf(step) > i ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-zinc-800 text-zinc-600")
                                    }`}>
                                    {["selection", "input", "simulating", "result"].indexOf(step) > i ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                                </div>
                                {i < 3 && <div className={`w-0.5 h-12 transition-all duration-500 ${["selection", "input", "simulating", "result"].indexOf(step) > i ? "bg-emerald-500/50" : "bg-zinc-800"}`} />}
                            </div>
                        ))}
                    </div>

                    <Card className="bg-zinc-900 border-white/10 p-1 rounded-3xl relative z-10 overflow-hidden shadow-2xl">
                        <div className="bg-zinc-950 p-6 md:p-10 rounded-[1.4rem]">

                            {/* STEP 1: SELECTION */}
                            {step === "selection" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Qual desafio vamos resolver hoje?</h3>
                                        <p className="text-zinc-500">Selecione uma mesa de especialistas treinados.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tableOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedTable(option.id)}
                                                className={`p-6 rounded-2xl border-2 transition-all text-left flex gap-4 items-start ${selectedTable === option.id
                                                    ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/50"
                                                    : "border-zinc-800 bg-black/40 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div className="text-4xl bg-zinc-900/50 p-3 rounded-xl">{option.icon}</div>
                                                <div>
                                                    <div className="text-white font-bold text-lg mb-1">{option.label}</div>
                                                    <div className="text-zinc-500 text-sm leading-relaxed">{option.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={handleNextToInput}
                                        className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl transition-all"
                                    >
                                        Próximo Passo: Definir Objetivo
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            {/* STEP 2: INPUT */}
                            {step === "input" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <button onClick={() => setStep("selection")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                                        <ArrowRight className="rotate-180 h-4 w-4" /> Voltar
                                    </button>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Qual seu objetivo na Mesa?</h3>
                                        <p className="text-zinc-500">Descreva brevemente o que você precisa decidir ou planejar.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <textarea
                                            autoFocus
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            placeholder="Ex: Preciso de um plano de marketing para o lançamento de um SaaS B2B com foco em startups..."
                                            className="w-full min-h-[160px] bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg resize-none"
                                        />
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Mesa Selecionada: {tableOptions.find(t => t.id === selectedTable)?.label}</span>
                                            <span className="text-xs text-zinc-500">{goal.length} caracteres</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleStartSimulation(false)}
                                        disabled={!goal.trim()}
                                        className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl transition-all"
                                    >
                                        Reunir Especialistas
                                        <Sparkles className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            {/* STEP 3: SIMULATING */}
                            {step === "simulating" && (
                                <div className="space-y-12 py-8 animate-in fade-in duration-500">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse mb-6">
                                            <Brain className="h-4 w-4" />
                                            Sessão em Andamento...
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Os especialistas estão debatendo</h3>
                                        <p className="text-zinc-500">Analisando seu objetivo: &quot;{goal.substring(0, 40)}{goal.length > 40 ? "..." : ""}&quot;</p>
                                    </div>

                                    <div className="space-y-6 max-w-lg mx-auto">
                                        {personas.map((p, i) => (
                                            <div
                                                key={p.name}
                                                className={`flex gap-4 p-4 rounded-2xl border border-white/5 transition-all duration-700 ${simulationIndex >= i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                                    } ${simulationIndex === i ? "bg-zinc-900/50 scale-105" : "bg-black/20"}`}
                                            >
                                                <div className={`p-3 rounded-xl ${p.bg} ${p.color} shrink-0`}>
                                                    <p.icon className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-sm font-bold ${p.color}`}>{p.name}</p>
                                                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                                                        {simulationIndex > i ? "Contribuiu com análise estratégica..." :
                                                            simulationIndex === i ? "Pensando..." : "Aguardando vez..."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-center flex-col items-center gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
                                        <p className="text-xs font-mono text-zinc-600 tracking-tighter uppercase">Gerando síntese de mesa</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: RESULT */}
                            {step === "result" && (
                                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Sua Síntese Estratégica</h3>
                                            <p className="text-zinc-500">O consenso da mesa sobre seu desafio.</p>
                                        </div>
                                        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20">
                                            ✓ CONCLUÍDO
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 max-h-[400px] overflow-auto custom-scrollbar">
                                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                            {chatResponse}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        {!shareUrl ? (
                                            <Button
                                                onClick={handleCreateArtifact}
                                                disabled={artifactLoading || credits === 0}
                                                className="w-full h-16 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-violet-900/20"
                                            >
                                                {artifactLoading ? (
                                                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Gerando Documento...</>
                                                ) : credits === 0 ? (
                                                    <><Lock className="mr-3 h-6 w-6" /> Sem Créditos - Faça Upgrade</>
                                                ) : (
                                                    <><Sparkles className="mr-3 h-6 w-6" /> Transformar em Documento Estratégico (1 crédito)</>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="p-8 bg-gradient-to-br from-emerald-950/20 to-green-950/20 border border-emerald-500/30 rounded-2xl text-center space-y-6">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                                        <CheckCircle2 className="h-10 w-10" />
                                                    </div>
                                                    <h4 className="text-2xl font-bold text-white">Documento Pronto!</h4>
                                                    <p className="text-zinc-400">Seu plano executável foi gerado com sucesso.</p>
                                                </div>
                                                <a
                                                    href={shareUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 bg-white text-black font-bold px-10 py-4 rounded-xl hover:bg-zinc-100 transition-all text-lg"
                                                >
                                                    Ver Meu Plano Estratégico
                                                    <ArrowRight className="h-5 w-5" />
                                                </a>
                                            </div>
                                        )}

                                        <div className="flex justify-center gap-6 text-sm text-zinc-600 font-medium">
                                            <button onClick={() => { setStep("selection"); setGoal(""); setChatResponse(""); setShareUrl(null); }} className="hover:text-white transition-colors">Refazer Demo</button>
                                            <span>•</span>
                                            <a href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Criar Conta Completa</a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Credits Display */}
                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-zinc-500 text-sm">
                                    Demonstração: <span className="text-violet-400 font-bold">{credits ?? "..."}/5</span> créditos grátis restantes
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full border border-black bg-zinc-800" />)}
                                    </div>
                                    <span className="text-xs text-zinc-500">+1.200 executivos usando hoje</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}
