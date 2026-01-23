'use client'

import { useEffect, useState } from 'react'

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            setProgress(Math.min(100, Math.max(0, scrollPercent)))
        }

        updateProgress()
        window.addEventListener('scroll', updateProgress, { passive: true })
        return () => window.removeEventListener('scroll', updateProgress)
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-1 bg-zinc-900 z-50">
            <div
                className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
