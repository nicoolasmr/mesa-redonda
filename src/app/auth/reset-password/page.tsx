'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [isValidSession, setIsValidSession] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Check if user has a valid recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsValidSession(true)
            } else {
                setError("Link inválido ou expirado. Solicite um novo link de recuperação.")
            }
        })
    }, [supabase.auth])

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("As senhas não coincidem.")
            setLoading(false)
            return
        }

        // Validate password strength
        if (password.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.")
            setLoading(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        })

        if (updateError) {
            setError("Erro ao atualizar senha: " + updateError.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // Redirect to app after 2 seconds
            setTimeout(() => {
                router.push("/app")
            }, 2000)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>Senha Atualizada!</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Sua senha foi alterada com sucesso. Redirecionando...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!isValidSession && error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>Link Inválido</CardTitle>
                        <CardDescription className="text-zinc-400">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth/forgot-password">
                            <Button className="w-full bg-violet-600 hover:bg-violet-700">
                                Solicitar Novo Link
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
                        <span className="text-2xl">🔐</span>
                    </div>
                    <CardTitle>Redefinir Senha</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Digite sua nova senha abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Digite a senha novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Atualizar Senha
                        </Button>

                        {error && !success && (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
