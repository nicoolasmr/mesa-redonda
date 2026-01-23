"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createReferralCode } from "@/actions/growth"
import { toast } from "sonner"
import { Copy, Gift, Sparkles, Loader2 } from "lucide-react"

interface ReferralCardProps {
    initialCode?: { code: string, clicks: number } | null
}

export function ReferralCard({ initialCode }: ReferralCardProps) {
    const [codeData, setCodeData] = useState(initialCode)
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const data = await createReferralCode()
            setCodeData(data)
            toast.success("Código gerado com sucesso!")
        } catch (err) {
            toast.error("Erro ao gerar código.")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!codeData) return
        const link = `${window.location.origin}/login?ref=${codeData.code}` // Simple referral link logic
        navigator.clipboard.writeText(link)
        toast.success("Link copiado!")
    }

    return (
        <div className="p-1 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl">
            <div className="bg-zinc-950 rounded-[22px] p-8 h-full flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20">
                    <Gift className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Indique e Ganhe</h3>
                <p className="text-zinc-400 mb-8 max-w-sm">
                    Convide fundadores para o Mesa Redonda.
                    <span className="text-amber-500 font-bold block mt-2">
                        Você e eles ganham 3 Mesas Extras.
                    </span>
                </p>

                {!codeData ? (
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-white text-black hover:bg-zinc-200 font-bold h-12 w-full max-w-xs rounded-xl"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gerar Meu Código"}
                    </Button>
                ) : (
                    <div className="w-full max-w-xs space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group cursor-pointer" onClick={copyToClipboard}>
                            <code className="text-xl font-mono font-bold text-amber-500 tracking-wider">
                                {codeData.code}
                            </code>
                            <Copy className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs text-zinc-600">
                            {codeData.clicks} cliques no seu link
                        </p>
                        <Button onClick={copyToClipboard} variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
                            Copiar Link de Convite
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
