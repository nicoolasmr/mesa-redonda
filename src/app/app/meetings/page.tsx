"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Video, Calendar, Clock, ArrowRight, Loader2, Play } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [workspace, setWorkspace] = useState<any>(null)

    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get user's first workspace (MVP assumption)
            const { data: ws } = await supabase
                .from("workspaces")
                .select("*")
                .eq("owner_id", user.id)
                .single()

            if (ws) {
                setWorkspace(ws)
                const { data: mtgs } = await supabase
                    .from("meetings")
                    .select("*")
                    .eq("workspace_id", ws.id)
                    .order("created_at", { ascending: false })

                setMeetings(mtgs || [])
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'done': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Concluído</Badge>
            case 'error': return <Badge variant="destructive">Erro</Badge>
            case 'created':
            case 'uploaded': return <Badge variant="outline" className="animate-pulse">Aguardando</Badge>
            default: return <Badge variant="outline" className="animate-pulse bg-violet-500/10 text-violet-400">Processando...</Badge>
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Reuniões</h1>
                    <p className="text-zinc-500">Grave ou faça upload de áudios para transcrição e análise estratégica.</p>
                </div>
                <Link href="/app/meetings/new">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Reunião
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
                </div>
            ) : meetings.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800 border-dashed py-20 text-center">
                    <CardContent className="space-y-4">
                        <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                            <Video className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Nenhuma reunião encontrada</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto">Comece gravando sua primeira reunião estratégica para gerar insights automáticos.</p>
                        <Link href="/app/meetings/new" className="inline-block">
                            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                                Gravar Agora
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((meeting) => (
                        <Link key={meeting.id} href={`/app/meetings/${meeting.id}`}>
                            <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all group cursor-pointer h-full flex flex-col">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-white text-lg line-clamp-2 leading-tight">
                                            {meeting.title}
                                        </CardTitle>
                                        {getStatusBadge(meeting.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(meeting.created_at), "dd MMM", { locale: ptBR })}
                                        </div>
                                        {meeting.duration_seconds && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                {Math.floor(meeting.duration_seconds / 60)} min
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
                                        <span className="text-xs font-bold uppercase tracking-wider">Ver Insights</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
