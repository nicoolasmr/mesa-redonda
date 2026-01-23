"use client"

import { Button } from "@/components/ui/button"
import { Download, Copy, Share2, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ArtifactActionsProps {
    artifactTitle: string
    content: string | object
    onShare?: () => void
}

export function ArtifactActions({ artifactTitle, content, onShare }: ArtifactActionsProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("Conteúdo copiado para a área de transferência")
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-zinc-700 hover:bg-zinc-800">
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="border-zinc-700 hover:bg-zinc-800">
                <Download className="h-4 w-4 mr-2" />
                PDF
            </Button>
            {onShare && (
                <Button size="sm" onClick={onShare} className="bg-violet-600 hover:bg-violet-700 text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                </Button>
            )}
        </div>
    )
}
