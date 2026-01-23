"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Loader2, CheckCircle2, AlertCircle, FileText,
    Share2, Download, Play, MessageSquare,
    ChevronRight, Target, Shield, ListTodo, Archive
} from "lucide-react"

export default function MeetingResultPage() {
    const { id } = useParams()
    const router = useRouter()
    const [meeting, setMeeting] = useState<any>(null)
    const [transcript, setTranscript] = useState<any>(null)
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [polling, setPolling] = useState(false)
    const [processingAction, setProcessingAction] = useState(false)

    const supabase = createClient()

    async function handleShare() {
        try {
            const { shareMeeting } = await import("@/actions/meetings")
            const publicId = await shareMeeting(id as string)
            const url = `${window.location.origin}/share/meeting/${publicId}`
            await navigator.clipboard.writeText(url)
            alert("Link de compartilhamento copiado para a área de transferência!")
        } catch (err: any) {
            alert(err.message)
        }
    }

    async function handleSaveArtifact() {
        if (!meeting?.workspace_id) return
        setProcessingAction(true)
        try {
            const { saveMeetingAsArtifact } = await import("@/actions/meetings")
            await saveMeetingAsArtifact(id as string, meeting.workspace_id)
            alert("Insights salvos na sua biblioteca de artefatos!")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setProcessingAction(false)
        }
    }

    useEffect(() => {
        loadMeeting()
    }, [id])

    // Polling logic if status is not 'done' or 'error'
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (meeting && !['done', 'error'].includes(meeting.status)) {
            setPolling(true)
            interval = setInterval(() => {
                refreshStatus()
            }, 3000)
        } else {
            setPolling(false)
        }
        return () => clearInterval(interval)
    }, [meeting?.status])

    async function loadMeeting() {
        setLoading(true)
        const { data: mtg } = await supabase.from("meetings").select("*").eq("id", id).single()
        if (mtg) {
            setMeeting(mtg)
            if (mtg.status === 'done') {
                const { data: trans } = await supabase.from("meeting_transcripts").select("*").eq("meeting_id", id).single()
                const { data: inst } = await supabase.from("meeting_insights").select("*").eq("meeting_id", id).single()
                setTranscript(trans)
                setInsights(inst?.insights_json)
            }
        }
        setLoading(false)
    }

    async function refreshStatus() {
        const { data: mtg } = await supabase.from("meetings").select("*").eq("id", id).single()
        if (mtg) {
            setMeeting(mtg)
            if (mtg.status === 'done' && !insights) {
                loadMeeting()
            }
        }
    }

    if (loading && !meeting) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
            </div>
        )
    }

    if (!meeting) return <div className="p-8 text-center text-zinc-500">Reunião não encontrada.</div>

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => router.push("/app/meetings")} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium underline-offset-4 hover:underline">Reuniões</button>
                        <ChevronRight className="h-4 w-4 text-zinc-700" />
                        <span className="text-zinc-300 text-sm">{meeting.title}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{meeting.title}</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                    </Button>
                    {meeting.status === 'done' && (
                        <Button
                            onClick={handleSaveArtifact}
                            disabled={processingAction}
                            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20 px-6"
                        >
                            {processingAction ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Archive className="h-4 w-4 mr-2" />
                            )}
                            Salvar na Biblioteca
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Banner */}
            {meeting.status !== 'done' && (
                <Card className={`border-none ${meeting.status === 'error' ? "bg-red-500/10" : "bg-violet-500/10"}`}>
                    <CardContent className="p-6 flex items-center gap-4">
                        {meeting.status === 'error' ? (
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        ) : (
                            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                        )}
                        <div>
                            <p className="font-bold text-white uppercase tracking-wider text-sm">
                                {meeting.status === 'error' ? "Ocorreu um Erro" : "Análise em Andamento"}
                            </p>
                            <p className="text-zinc-400 text-sm">
                                {meeting.status === 'error' ? meeting.error_message : "Estamos transcrevendo e analisando sua reunião. Geralmente leva de 1 a 3 minutos."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {meeting.status === 'done' && insights && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Insights) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary One-Liner */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-5 w-5 text-violet-400" />
                                <h3 className="text-sm font-bold text-violet-400 uppercase tracking-widest">Resumo Executivo</h3>
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight mb-4">{insights.summary.one_liner}</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">{insights.summary.paragraph}</p>
                        </div>

                        {/* Tabs for details */}
                        <Tabs defaultValue="decisions" className="w-full">
                            <TabsList className="bg-zinc-900 border border-white/5 w-full justify-start h-12 p-1">
                                <TabsTrigger value="decisions" className="data-[state=active]:bg-zinc-800 font-bold">Decisões</TabsTrigger>
                                <TabsTrigger value="actions" className="data-[state=active]:bg-zinc-800 font-bold">Plano de Ação</TabsTrigger>
                                <TabsTrigger value="risks" className="data-[state=active]:bg-zinc-800 font-bold">Riscos</TabsTrigger>
                                <TabsTrigger value="transcript" className="data-[state=active]:bg-zinc-800 font-bold">Transcrição</TabsTrigger>
                            </TabsList>

                            <TabsContent value="decisions" className="pt-6 space-y-4">
                                {insights.decisions.map((d: any, i: number) => (
                                    <div key={i} className="p-5 rounded-xl border border-white/5 bg-zinc-900/50 space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-bold">{d.decision}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm pl-6">{d.why}</p>
                                        <div className="flex flex-wrap gap-2 pl-6 mt-2">
                                            {d.criteria.map((c: string, j: number) => (
                                                <Badge key={j} variant="outline" className="text-[10px] uppercase border-zinc-800">{c}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="actions" className="pt-6 space-y-3">
                                {insights.action_items.map((a: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                                        <div className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs ${a.priority === 'P0' ? "bg-red-500/10 text-red-500" :
                                            a.priority === 'P1' ? "bg-orange-500/10 text-orange-500" : "bg-zinc-500/10 text-zinc-500"
                                            }`}>
                                            {a.priority}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{a.task}</p>
                                            <div className="flex gap-4 mt-1">
                                                {a.owner && <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Responsável: {a.owner}</span>}
                                                {a.deadline && <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Prazo: {a.deadline}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="risks" className="pt-6 space-y-4">
                                {insights.risks.map((r: any, i: number) => (
                                    <div key={i} className="p-5 rounded-xl border border-red-500/10 bg-red-500/5 space-y-2">
                                        <div className="flex items-center gap-2 text-red-400 font-bold">
                                            <Shield className="h-4 w-4" />
                                            {r.risk}
                                        </div>
                                        <div className="pl-6 space-y-2">
                                            <p className="text-zinc-300 text-sm"><strong>Impacto:</strong> {r.impact}</p>
                                            <p className="text-zinc-300 text-sm"><strong>Mitigação:</strong> {r.mitigation}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="transcript" className="pt-6">
                                <div className="p-6 rounded-2xl bg-black border border-zinc-800 max-h-[600px] overflow-auto custom-scrollbar font-sans leading-relaxed text-zinc-400 whitespace-pre-wrap">
                                    {transcript?.transcript_text}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar Content */}
                    <div className="space-y-6">
                        {/* Questions & Next Steps */}
                        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                            <CardHeader className="bg-zinc-900/50 border-b border-white/5">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Próximos Passos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Perguntas em Aberto</h4>
                                    <ul className="space-y-2">
                                        {insights.open_questions.map((q: string, i: number) => (
                                            <li key={i} className="text-sm text-zinc-400 flex gap-2">
                                                <span className="text-violet-500">•</span> {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agenda da Próxima Meeting</h4>
                                    <ul className="space-y-2">
                                        {insights.next_agenda.map((a: string, i: number) => (
                                            <li key={i} className="text-sm text-zinc-400 flex gap-2">
                                                <span className="text-emerald-500">{i + 1}.</span> {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow up message */}
                        <Card className="bg-zinc-900 border-zinc-500/20 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-400">
                                    <MessageSquare className="h-4 w-4" />
                                    Sugestão de Follow-up
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="p-4 bg-black rounded-lg text-sm text-zinc-500 italic border border-white/5 leading-relaxed">
                                    &quot;{insights.follow_up_message}&quot;
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-[10px] uppercase tracking-tighter text-zinc-600 hover:text-white">Copiar Mensagem</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
