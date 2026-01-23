'use client'

import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ShareButtonsProps = {
    url: string
    title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false)

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank', 'width=550,height=420')
    }

    const shareOnLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        window.open(linkedInUrl, '_blank', 'width=550,height=420')
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                Compartilhar
            </h3>
            <div className="flex flex-col gap-2">
                <Button
                    onClick={shareOnTwitter}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                >
                    <Twitter className="h-4 w-4" />
                    Twitter
                </Button>
                <Button
                    onClick={shareOnLinkedIn}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                </Button>
                <Button
                    onClick={copyLink}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Copiado!</span>
                        </>
                    ) : (
                        <>
                            <LinkIcon className="h-4 w-4" />
                            Copiar link
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
