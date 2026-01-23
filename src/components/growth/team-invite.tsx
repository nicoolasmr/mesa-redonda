"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { inviteMember, revokeInvite } from "@/actions/growth"
import { toast } from "sonner"
import { Mail, X, UserPlus, Loader2 } from "lucide-react"

export function TeamInvite({ workspaceId, invites = [] }: { workspaceId: string, invites: any[] }) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await inviteMember(workspaceId, email)
            toast.success(`Convite enviado para ${email}`)
            setEmail("")
        } catch (err) {
            toast.error("Erro ao enviar convite. Verifique o limite do seu plano.")
        } finally {
            setLoading(false)
        }
    }

    const handleRevoke = async (id: string) => {
        try {
            await revokeInvite(id)
            toast.success("Convite cancelado")
        } catch (err) {
            toast.error("Erro ao cancelar convite")
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-violet-500" />
                    Convidar Membro
                </h3>
                <form onSubmit={handleInvite} className="flex gap-3">
                    <Input
                        type="email"
                        placeholder="email@colega.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-black border-zinc-700"
                    />
                    <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-zinc-200">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                    </Button>
                </form>
            </div>

            {invites.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                        <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-widest">Convites Pendentes</h4>
                    </div>
                    <div>
                        {invites.map((invite) => (
                            <div key={invite.id} className="p-4 flex items-center justify-between border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{invite.email}</p>
                                        <p className="text-xs text-zinc-500">Enviado em {new Date(invite.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleRevoke(invite.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
