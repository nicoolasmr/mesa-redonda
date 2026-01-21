'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sendMessage } from "@/actions/chat"
import { Loader2, Send, FileText, Bot, User } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ChatInterface({ tableId, initialMessages, template, artifacts }: any) {
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('chat-room')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `table_id=eq.${tableId}` },
                (payload) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setMessages((prev: any) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [tableId, supabase])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    async function handleSend() {
        if (!input.trim() || loading) return

        // Optimistic update
        const tempId = Math.random().toString()
        const userMsg = { id: tempId, role: "user", content: input, created_at: new Date().toISOString() }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages((prev: any) => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            await sendMessage(tableId, input)
        } catch (err) {
            console.error(err)
            // Rollback logic would go here
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-full">
            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col bg-black border-r border-zinc-800">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 max-w-3xl mx-auto pb-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {messages.map((msg: any) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role !== 'user' && (
                                    <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5 text-zinc-400" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                                    }`}>
                                    {msg.role !== 'user' && msg.persona_id && (
                                        <div className="text-xs font-bold text-violet-400 mb-1 mb:uppercase">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {template?.personas.find((p: any) => p.id === msg.persona_id)?.name || msg.role}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-zinc-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-500 italic">
                                    A Mesa está pensando...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Digite sua resposta ou comando (ex: 'Gerar Plano')..."
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-violet-600"
                            disabled={loading}
                        />
                        <Button onClick={handleSend} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ARTIFACTS SIDEBAR */}
            <div className="w-80 bg-zinc-950 p-4 border-l border-zinc-800 hidden md:flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Artefatos</h3>
                {artifacts.length > 0 ? (
                    <div className="space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {artifacts.map((art: any) => (
                            <Link key={art.id} href={`/app/artifacts/${art.id}`} target="_blank">
                                <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-colors cursor-pointer">
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-violet-900/20 text-violet-400 flex items-center justify-center">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white truncate max-w-[140px]">{art.title}</div>
                                            <div className="text-xs text-zinc-500">v{art.version} • {new Date(art.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                        <p>Nenhum artefato gerado ainda.</p>
                        <p className="mt-2 text-xs">A conversa irá produzir documentos aqui.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
