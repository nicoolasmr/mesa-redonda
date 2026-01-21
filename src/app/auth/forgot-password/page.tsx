'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")
    const supabase = createClient()

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        })

        if (resetError) {
            setError("Erro ao enviar email: " + resetError.message)
            setLoading(false)
        } else {
            setSent(true)
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>Email Enviado!</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full bg-violet-600 hover:bg-violet-700">
                                Voltar para Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center">
                        <span className="text-2xl">🔑</span>
                    </div>
                    <CardTitle>Esqueceu sua senha?</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Digite seu email e enviaremos um link para redefinir sua senha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <Button
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            type="submit"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Link de Recuperação
                        </Button>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
                                ← Voltar para login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
