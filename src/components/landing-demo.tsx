"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ArrowRight, Lock } from "lucide-react"

type TableType = "marketing" | "produto" | "carreira" | "estudos"

const tableOptions = [
    { id: "marketing" as TableType, label: "Marketing B2B", icon: "💼", description: "Planos de marketing, ICP, canais" },
    { id: "produto" as TableType, label: "Produto & Roadmap", icon: "🎯", description: "Roadmaps, priorização RICE" },
    { id: "carreira" as TableType, label: "Carreira & PDI", icon: "🚀", description: "Desenvolvimento, metas SMART" },
    { id: "estudos" as TableType, label: "Estudos & Aprendizado", icon: "💡", description: "Planos de estudo, Feynman" },
]

export function LandingDemo() {
    const [selectedTable, setSelectedTable] = useState<TableType>("marketing")
    const [goal, setGoal] = useState("")
    const [chatResponse, setChatResponse] = useState("")
    const [credits, setCredits] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [artifactLoading, setArtifactLoading] = useState(false)
    const [shareUrl, setShareUrl] = useState<string | null>(null)

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

    const handleChat = async () => {
        if (!goal.trim()) return

        setLoading(true)
        setChatResponse("")
        setShareUrl(null)

        try {
            const res = await fetch("/api/guest/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: goal, tableType: selectedTable }),
            })

            const data = await res.json()

            if (res.ok) {
                setChatResponse(data.text)
                if (data.creditsRemaining !== undefined) {
                    setCredits(data.creditsRemaining)
                }
            } else {
                setChatResponse(`Erro: ${data.error}`)
            }
        } catch (error) {
            setChatResponse("Erro ao processar mensagem.")
        } finally {
            setLoading(false)
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
                    // Redirect to login
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
        <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        🎯 Experimente Agora (Grátis)
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Teste a Mesa Redonda com <span className="text-violet-400 font-semibold">{credits ?? "..."} créditos grátis</span>.
                        Sem cadastro, sem cartão.
                    </p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 p-8">
                    {/* Table Type Selection */}
                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            1. Escolha o tipo de mesa:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {tableOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedTable(option.id)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedTable === option.id
                                            ? "border-violet-500 bg-violet-500/10"
                                            : "border-zinc-700 hover:border-zinc-600"
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{option.icon}</div>
                                    <div className="text-white text-sm font-semibold mb-1">
                                        {option.label}
                                    </div>
                                    <div className="text-zinc-500 text-xs">
                                        {option.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal Input */}
                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            2. O que você quer decidir?
                        </label>
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Ex: Criar estratégia de marketing para SaaS B2B"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                            onKeyDown={(e) => e.key === "Enter" && handleChat()}
                        />
                    </div>

                    {/* Chat Button */}
                    <Button
                        onClick={handleChat}
                        disabled={loading || !goal.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 mb-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Iniciar Conversa
                            </>
                        )}
                    </Button>

                    {/* Chat Response */}
                    {chatResponse && (
                        <div className="mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                            <div className="text-white text-sm whitespace-pre-wrap">
                                {chatResponse}
                            </div>
                        </div>
                    )}

                    {/* Create Artifact Button */}
                    {chatResponse && !shareUrl && (
                        <Button
                            onClick={handleCreateArtifact}
                            disabled={artifactLoading || credits === 0}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4"
                        >
                            {artifactLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Gerando Artefato...
                                </>
                            ) : credits === 0 ? (
                                <>
                                    <Lock className="mr-2 h-5 w-5" />
                                    Sem Créditos - Faça Login
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Gerar Artefato (1 crédito)
                                </>
                            )}
                        </Button>
                    )}

                    {/* Share URL */}
                    {shareUrl && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-green-400" />
                                <h3 className="text-white font-bold">Artefato Criado!</h3>
                            </div>
                            <p className="text-zinc-300 text-sm mb-4">
                                Seu artefato está pronto. Créditos restantes: <span className="font-bold text-violet-400">{credits}</span>
                            </p>
                            <a
                                href={shareUrl}
                                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors"
                            >
                                Ver Artefato
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    )}

                    {/* Credits Display */}
                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Créditos restantes: <span className="text-violet-400 font-bold">{credits ?? "..."}/5</span>
                        </p>
                        {credits === 0 && (
                            <p className="text-orange-400 text-sm mt-2">
                                Créditos esgotados! <a href="/login" className="underline font-semibold">Faça login</a> para continuar.
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
