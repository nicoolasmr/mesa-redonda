"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { submitLead, convertDraftToRun } from "@/actions/demo"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Lock, ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface LeadGateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    draftId: string | null
    initialData: { mesaKey: string, userInput: string }
}

export function LeadGateModal({ open, onOpenChange, draftId, initialData }: LeadGateModalProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        consent: false,
        password: ""
    })
    const supabase = createClient()
    const router = useRouter()

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!draftId) return

        setLoading(true)
        try {
            await submitLead(draftId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                consent: formData.consent
            })
            setStep(2)
        } catch (err) {
            toast.error("Erro ao salvar dados. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!draftId) return

        setLoading(true)
        try {
            // 1. Supabase Auth Signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                        consent_marketing: formData.consent
                    }
                }
            })

            if (authError) {
                if (authError.message.includes("already registered")) {
                    toast.error("Este email já possui conta. Redirecionando para login...")
                    // Redirect to login with callback to convert draft
                    // Ideally we'd have a specific route, but we'll just push to login
                    router.push(`/login?email=${formData.email}&next=/app`)
                } else {
                    toast.error(authError.message)
                }
                return
            }

            if (authData.user) {
                // 2. Wait for session to be established (client-side) usually happens fast, 
                // but we might need to manually trigger conversion via server action now that we have a user?
                // CAUTION: The server action `convertDraftToRun` relies on `getUser()`. 
                // If the session isn't fully propagated to cookie yet (which happens after signUp returns in some flows), logic might fail.
                // robust way: wait a tick or rely on `onAuthStateChange`. 
                // For MVP, we'll try to call it. usage of `createClient` in action reads `cookies()`.
                // Supabase client handles cookie setting.

                // Artificial delay to ensure cookie set? Or trust the client.
                // We will optimistic redirect to a special 'setup' route which runs the conversion?
                // Or call the action.

                // If we call action here, the request contains the cookie set by supabase-js? 
                // Actually, supabase-js `signUp` sets the session in local storage/memory, 
                // Next.js middleware or Auth helpers enable the cookie sync. 
                // We might need `router.refresh()` before calling server action?

                // Let's force a hard reload or navigate to an onboarding page that finalizes it.
                // Safer: "/app/onboarding?draftId=..."

                toast.success("Conta criada! Preparando seu ambiente...")
                router.push(`/app/onboarding?draftId=${draftId}`)
            }

        } catch (err) {
            toast.error("Erro inesperado.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto h-12 w-12 bg-violet-600/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-violet-500" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">
                        {step === 1 ? "Desbloqueie seu Resultado" : "Crie sua Senha"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        {step === 1
                            ? "Informe seus dados para acessar a análise completa e ganhar 5 créditos gratuitos."
                            : "Defina uma senha segura para acessar sua conta no futuro."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <form onSubmit={handleLeadSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Profissional</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone / WhatsApp</Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                                placeholder="(11) 99999-9999"
                                className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                            />
                        </div>
                        <div className="flex items-start gap-2 pt-2">
                            <Checkbox
                                id="consent"
                                checked={formData.consent}
                                onCheckedChange={(c: boolean) => setFormData({ ...formData, consent: c })}
                                required
                                className="mt-1 data-[state=checked]:bg-violet-600 border-zinc-700"
                            />
                            <label htmlFor="consent" className="text-xs text-zinc-500 leading-tight">
                                Concordo em receber comunicações sobre o Mesa Redonda. Entendo que posso cancelar a inscrição a qualquer momento.
                            </label>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200 mt-2 font-bold h-12">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    Continuar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 text-sm">
                                {formData.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 mt-2 font-bold h-12 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Finalizar Cadastro
                                </>
                            )}
                        </Button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-zinc-500 hover:text-white mt-2">
                            Voltar
                        </button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
