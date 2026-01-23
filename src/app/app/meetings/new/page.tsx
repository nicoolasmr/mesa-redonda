"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Upload, X, Save, Loader2, StopCircle, Volume2 } from "lucide-react"

export default function NewMeetingPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [consent, setConsent] = useState(false)
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [uploading, setUploading] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getWorkspace() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).single()
            if (ws) setWorkspaceId(ws.id)
        }
        getWorkspace()
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            recorder.ondataavailable = (e) => chunks.push(e.data)
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            mediaRecorderRef.current = recorder
            setIsRecording(true)

            setRecordingTime(0)
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (err) {
            console.error("Recording error:", err)
            alert("Erro ao acessar microfone.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setAudioBlob(file)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleSave = async () => {
        if (!title.trim() || !consent || !audioBlob || !workspaceId) return

        setUploading(true)
        try {
            // 1. Create meeting record
            const res = await fetch("/api/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    workspace_id: workspaceId,
                    consent_confirmed: consent
                })
            })
            const meeting = await res.json()
            if (!res.ok) throw new Error(meeting.error)

            // 2. Upload file
            const formData = new FormData()
            formData.append("file", audioBlob, "audio.webm")
            const uploadRes = await fetch(`/api/meetings/${meeting.id}/upload`, {
                method: "POST",
                body: formData
            })
            if (!uploadRes.ok) throw new Error("Falha no upload")

            // 3. Trigger processing (async)
            fetch(`/api/meetings/${meeting.id}/process`, { method: "POST" })

            router.push(`/app/meetings/${meeting.id}`)
        } catch (err: any) {
            alert(err.message)
            setUploading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Nova Análise de Reunião</h1>
                <p className="text-zinc-500">Capture o áudio para obter transcrição e insights automáticos.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 p-8">
                <CardContent className="space-y-8 p-0">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-400">Título da Reunião</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Sync de Produto - Roadmap Q2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-white h-12"
                        />
                    </div>

                    {/* Consent */}
                    <div className="flex items-start space-x-3 p-4 bg-violet-950/20 border border-violet-500/20 rounded-xl">
                        <input
                            type="checkbox"
                            id="consent"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-violet-500 text-violet-500 focus:ring-violet-500 bg-zinc-950"
                        />
                        <div className="space-y-1">
                            <Label htmlFor="consent" className="text-zinc-200 cursor-pointer">Confirmo que tenho o consentimento dos participantes</Label>
                            <p className="text-xs text-zinc-500">A gravação e processamento de áudio exige conformidade com a LGPD e regulamentações locais.</p>
                        </div>
                    </div>

                    {/* Capture Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recording */}
                        <div className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${isRecording ? "border-red-500 bg-red-500/5" : "border-zinc-800 hover:border-zinc-700 bg-black/40"}`}>
                            {isRecording ? (
                                <div className="text-center space-y-4">
                                    <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                        <StopCircle className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="text-red-500 font-mono text-2xl font-bold">{formatTime(recordingTime)}</div>
                                    <Button onClick={stopRecording} variant="destructive">Parar Gravação</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                                        <Mic className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-semibold">Gravar no Navegador</p>
                                        <p className="text-xs text-zinc-600">Recomendado para reuniões ao vivo</p>
                                    </div>
                                    <Button onClick={startRecording} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white">Iniciar Gravação</Button>
                                </>
                            )}
                        </div>

                        {/* Upload */}
                        <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer relative group">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold">Fazer Upload de Áudio</p>
                                <p className="text-xs text-zinc-600">MP3, M4A, WEBM (Max 25MB)</p>
                            </div>
                            <Button variant="ghost" className="text-zinc-500 text-xs">Selecionar Arquivo</Button>
                        </div>
                    </div>

                    {/* Selected File Feedback */}
                    {audioBlob && (
                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                                    <Volume2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-semibold">Áudio Selecionado</p>
                                    <p className="text-xs text-zinc-500">Pronto para processamento</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)} className="text-zinc-500 hover:text-white">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500">Cancelar</Button>
                        <Button
                            disabled={!title.trim() || !consent || !audioBlob || uploading}
                            onClick={handleSave}
                            className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-8"
                        >
                            {uploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Iniciar Análise Estratégica</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
