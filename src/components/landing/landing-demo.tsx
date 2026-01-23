"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDraft } from "@/actions/demo"
import { LeadGateModal } from "@/components/landing/lead-gate-modal"
import { Loader2, Sparkles, Lock } from "lucide-react"

const DEMO_TEMPLATES = [
    { key: "marketing-strategy", name: "Planejamento de Marketing", role: "CMO" },
    { key: "product-roadmap", name: "Roadmap de Produto", role: "CPO" },
    { key: "pitch-deck", name: "Revisão de Pitch Deck", role: "VC Analyst" },
    { key: "legal-risk", name: "Análise de Riscos Legais", role: "Legal Counsel" }
]

export function LandingDemo() {
    const [template, setTemplate] = useState("marketing-strategy")
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [draftId, setDraftId] = useState<string | null>(null)
    const [openLeadGate, setOpenLeadGate] = useState(false)

    const handleStart = async () => {
        console.log("Starting demo...", { template, input })
        if (!input.trim()) {
            console.log("Input empty")
            return
        }
        setLoading(true)
        try {
            const id = await createDraft(template, input)
            console.log("Draft created:", id)
            setDraftId(id)
            setOpenLeadGate(true)
        } catch (err) {
            console.error("Demo Error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-violet-600/10 rounded-bl-2xl border-b border-l border-violet-500/20 text-xs font-bold text-violet-400 uppercase tracking-widest">
                Demo Gratuita • 5 Créditos
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">1. Escolha seu Especialista</label>
                    <Select value={template} onValueChange={setTemplate}>
                        <SelectTrigger className="bg-black border-zinc-700 h-12 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DEMO_TEMPLATES.map(t => (
                                <SelectItem key={t.key} value={t.key}>{t.name} ({t.role})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">2. Descreva seu Desafio</label>
                    <Textarea
                        placeholder="Ex: Preciso lançar um SaaS B2B no Brasil focando em leads qualificados..."
                        className="bg-black border-zinc-700 min-h-[120px] text-white p-4 text-lg resize-none"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                </div>

                <div className="pt-2">
                    <Button
                        size="lg"
                        onClick={handleStart}
                        disabled={loading || !input.trim()}
                        className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-lg font-black group"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                GERAR ESTRATÉGIA AGORA
                            </>
                        )}
                    </Button>
                    <p className="text-center text-xs text-zinc-500 mt-4">
                        <Lock className="h-3 w-3 inline mr-1" />
                        O resultado será gerado e liberado após seu cadastro gratuito.
                    </p>
                </div>
            </div>

            {/* LeadGate Modal */}
            <LeadGateModal
                open={openLeadGate}
                onOpenChange={setOpenLeadGate}
                draftId={draftId}
                initialData={{ mesaKey: template, userInput: input }}
            />
        </div>
    )
}
