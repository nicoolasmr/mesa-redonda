"use client"

import { useState, useEffect } from "react"
import { listKnowledge, createKnowledge, updateKnowledge, deleteKnowledge, KnowledgeItem, KnowledgeCategory } from "@/actions/knowledge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, Trash2, Edit3, Save, X, Lightbulb, Shield, Target, MessageSquare, Loader2 } from "lucide-react"

export default function BrainPage() {
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState<KnowledgeCategory>("business_rule")

    useEffect(() => {
        async function loadWorkspace() {
            try {
                console.log('[The Brain] Fetching workspace...')
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

                const response = await fetch('/api/workspaces', {
                    signal: controller.signal
                })
                clearTimeout(timeoutId)

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('[The Brain] API error:', response.status, errorText)
                    throw new Error(`API returned ${response.status}: ${errorText}`)
                }

                const workspaces = await response.json()
                console.log('[The Brain] Workspaces fetched:', workspaces.length)

                if (workspaces.length > 0) {
                    const wsId = workspaces[0].id
                    setWorkspaceId(wsId)
                    loadKnowledge(wsId)
                } else {
                    console.error('[The Brain] No workspaces returned from API')
                    setLoading(false)
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.error('[The Brain] Request timeout after 10 seconds')
                } else {
                    console.error("[The Brain] Error loading workspace:", error)
                }
                setLoading(false)
            }
        }
        loadWorkspace()
    }, [])

    async function loadKnowledge(wsId: string) {
        setLoading(true)
        const items = await listKnowledge(wsId)
        setKnowledge(items)
        setLoading(false)
    }

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault()
        if (!workspaceId || !title || !content) return

        try {
            await createKnowledge(workspaceId, { title, content, category })
            setTitle("")
            setContent("")
            setIsCreating(false)
            loadKnowledge(workspaceId)
        } catch (error) {
            alert("Erro ao adicionar conhecimento.")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta informação?")) return
        try {
            await deleteKnowledge(id)
            if (workspaceId) loadKnowledge(workspaceId)
        } catch (error) {
            alert("Erro ao excluir.")
        }
    }

    async function toggleActive(item: KnowledgeItem) {
        try {
            await updateKnowledge(item.id, { is_active: !item.is_active })
            if (workspaceId) loadKnowledge(workspaceId)
        } catch (error) {
            alert("Erro ao atualizar.")
        }
    }

    const categories: { id: KnowledgeCategory, label: string, icon: any, color: string }[] = [
        { id: "business_rule", label: "Regra de Negócio", icon: Shield, color: "text-red-400" },
        { id: "product_info", label: "Produto & Roadmap", icon: Target, color: "text-violet-400" },
        { id: "brand_voice", label: "Voz & Branding", icon: MessageSquare, color: "text-emerald-400" },
        { id: "customer_profile", label: "Perfil do Cliente", icon: Lightbulb, color: "text-amber-400" },
        { id: "other", label: "Outros", icon: Brain, color: "text-zinc-400" },
    ]

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-600/20 rounded-lg">
                                <Brain className="h-8 w-8 text-violet-500" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">The Brain</h1>
                        </div>
                        <p className="text-zinc-400 text-lg">
                            O cérebro do seu workspace. Armazene contextos permanentes para que a IA nunca alucine.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 px-6"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Novo Conhecimento
                    </Button>
                </header>

                {/* Create Form */}
                {isCreating && (
                    <Card className="bg-zinc-900 border-violet-500/50 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                        <CardHeader>
                            <CardTitle className="text-white">Adicionar Contexto Estratégico</CardTitle>
                            <CardDescription className="text-zinc-500">
                                Defina regras ou informações que a IA deve sempre respeitar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddItem} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Título / Nome da Regra</label>
                                        <Input
                                            placeholder="Ex: ICP Principal, Tom de Voz, Limite de Desconto"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800 text-white focus:border-violet-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Categoria</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${category === cat.id
                                                        ? "bg-violet-600 border-violet-500 text-white"
                                                        : "bg-zinc-800 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Conteúdo (O que a IA precisa saber)</label>
                                    <Textarea
                                        placeholder="Descreva detalhadamente aqui. Você pode colar documentos, listas ou regras complexas."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-white min-h-[150px] focus:border-violet-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-zinc-400">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                                        Salvar no Cérebro
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Knowledge List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                        <p className="text-zinc-500 font-medium">Lendo a base de conhecimento...</p>
                    </div>
                ) : knowledge.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-3xl">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="h-8 w-8 text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Seu Cérebro está vazio</h3>
                        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                            Adicione regras de negócio e contextos para que as IAs entendam profundamente sua empresa.
                        </p>
                        <Button onClick={() => setIsCreating(true)} variant="outline" className="border-zinc-800 hover:bg-zinc-900">
                            Adicionar Primeiro Registro
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {knowledge.map((item) => {
                            const cat = categories.find(c => c.id === item.category) || categories[4]
                            return (
                                <Card key={item.id} className={`bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all ${!item.is_active && "opacity-60"}`}>
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-zinc-950 rounded-lg ${cat.color}`}>
                                                <cat.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl text-white flex items-center gap-3">
                                                    {item.title}
                                                    {!item.is_active && <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800">INATIVO</Badge>}
                                                </CardTitle>
                                                <CardDescription className="text-zinc-600 text-xs font-mono uppercase tracking-widest mt-1">
                                                    {cat.label}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleActive(item)}
                                                className="text-zinc-500 hover:text-white"
                                                title={item.is_active ? "Desativar" : "Ativar"}
                                            >
                                                <X className={`h-4 w-4 ${item.is_active ? "text-red-500" : "text-green-500"}`} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
                                                className="text-zinc-500 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5">
                                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
                                                {item.content}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
