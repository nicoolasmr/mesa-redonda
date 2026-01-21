'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get("next") || "/app"

    // Login state
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    // Signup state
    const [signupEmail, setSignupEmail] = useState("")
    const [signupPassword, setSignupPassword] = useState("")
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("")

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        })

        if (signInError) {
            setError("Email ou senha incorretos.")
            setLoading(false)
        } else {
            setMessage("Login realizado com sucesso!")
            router.push(next)
        }
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        // Validate passwords match
        if (signupPassword !== signupConfirmPassword) {
            setError("As senhas não coincidem.")
            setLoading(false)
            return
        }

        // Validate password strength
        if (signupPassword.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.")
            setLoading(false)
            return
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email: signupEmail,
            password: signupPassword,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        })

        if (signUpError) {
            setError("Erro ao criar conta: " + signUpError.message)
            setLoading(false)
        } else {
            setMessage("Conta criada! Verifique seu email para confirmar.")
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <CardTitle className="text-2xl">Mesa Redonda</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Entre ou crie sua conta para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                            <TabsTrigger value="login">Entrar</TabsTrigger>
                            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                        </TabsList>

                        {/* LOGIN TAB */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-xs text-violet-400 hover:text-violet-300"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
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
                                    Entrar
                                </Button>
                            </form>
                        </TabsContent>

                        {/* SIGNUP TAB */}
                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Senha</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="Mínimo 8 caracteres"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                                    <Input
                                        id="signup-confirm-password"
                                        type="password"
                                        placeholder="Digite a senha novamente"
                                        value={signupConfirmPassword}
                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
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
                                    Criar Conta
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}
                    {message && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-sm text-green-300">{message}</p>
                        </div>
                    )}

                    {/* Back to home */}
                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
                            ← Voltar para home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
