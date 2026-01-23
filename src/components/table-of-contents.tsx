'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Heading = {
    id: string
    text: string
    level: number
}

type TableOfContentsProps = {
    headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-100px 0px -80% 0px',
                threshold: 0.5
            }
        )

        headings.forEach(({ id }) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [headings])

    if (headings.length === 0) return null

    return (
        <nav className="space-y-1">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                Neste Artigo
            </h3>
            {headings.map((heading) => (
                <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={cn(
                        'block text-sm transition-colors py-1 border-l-2',
                        activeId === heading.id
                            ? 'text-violet-400 font-semibold border-violet-400'
                            : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700'
                    )}
                    style={{ paddingLeft: `${(heading.level - 2) * 12 + 12}px` }}
                    onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(heading.id)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        })
                    }}
                >
                    {heading.text}
                </a>
            ))}
        </nav>
    )
}
