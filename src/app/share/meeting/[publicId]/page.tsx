"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle2, FileText, Target, Shield, MessageSquare } from "lucide-react"

export default function PublicMeetingPage() {
    const { publicId } = useParams()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function loadSharedMeeting() {
            setLoading(true)
            // 1. Get Meeting Share record (using service role via a special server-side check if needed, 
            // but for MVP we use a client query if RLS allows or a safe API endpoint)

            // Assuming for MVP we can query meeting_shares if we have the public_id
            const { data: share } = await supabase
                .from("meeting_shares")
                .select("*, meetings(*, meeting_transcripts(*), meeting_insights(*))")
                .eq("public_id", publicId)
                .single()

            if (share) {
                setData(share)
            }
            setLoading(false)
        }
        loadSharedMeeting()
    }, [publicId])

    if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
    if (!data) return <div className="h-screen flex items-center justify-center bg-black text-zinc-500">Link de compartilhamento inválido ou expirado.</div>

    const meeting = data.meetings
    const insights = meeting.meeting_insights?.[0]?.insights_json
    const transcript = meeting.meeting_transcripts?.[0]?.transcript_text

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="h-10 w-10 bg-violet-600 rounded-full mx-auto" />
                    <h1 className="text-4xl font-bold tracking-tight">{meeting.title}</h1>
                    <p className="text-zinc-500">Mesa Redonda: Insights Estratégicos Partilhados</p>
                </div>

                {insights ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
                                <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs mb-4">Resumo</h3>
                                <h2 className="text-2xl font-bold mb-4">{insights.summary.one_liner}</h2>
                                <p className="text-zinc-400 leading-relaxed">{insights.summary.paragraph}</p>
                            </div>

                            <Tabs defaultValue="decisions">
                                <TabsList className="bg-zinc-900 border-none">
                                    <TabsTrigger value="decisions">Decisões</TabsTrigger>
                                    <TabsTrigger value="actions">Ações</TabsTrigger>
                                    <TabsTrigger value="transcript">Transcrição</TabsTrigger>
                                </TabsList>
                                <TabsContent value="decisions" className="pt-6 space-y-4">
                                    {insights.decisions.map((d: any, i: number) => (
                                        <div key={i} className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                            <div className="font-bold text-emerald-400 flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="h-4 w-4" /> {d.decision}
                                            </div>
                                            <p className="text-sm text-zinc-500">{d.why}</p>
                                        </div>
                                    ))}
                                </TabsContent>
                                <TabsContent value="transcript" className="pt-6">
                                    <div className="p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-sm whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-auto">
                                        {transcript}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-zinc-900 border-white/5 p-6 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Próximos Passos</h4>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        {insights.next_agenda.map((a: string, i: number) => (
                                            <li key={i}><span className="text-violet-500 mr-2">•</span>{a}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-zinc-500">Aguardando processamento dos insights...</div>
                )}
            </div>
        </div>
    )
}
