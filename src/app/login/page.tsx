'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            },
        })

        if (error) {
            setMessage("Erro ao enviar link: " + error.message)
        } else {
            setMessage("Link mágico enviado! Verifique seu email.")
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-black text-white">
                <CardHeader>
                    <CardTitle>Entrar na Mesa Redonda</CardTitle>
                    <CardDescription>Digite seu email para receber um link de acesso magic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-zinc-900 border-zinc-800"
                        />
                        <Button disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Link Mágico
                        </Button>
                        {message && (
                            <p className="text-center text-sm text-zinc-400 mt-2">{message}</p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
