'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to our standard logger
        logger.error('Global Error Boundary caught an error', error, {
            digest: error.digest
        })
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="bg-destructive/10 p-3 rounded-full mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-destructive font-bold"
                >
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                Ocorreu um erro inesperado ao carregar esta página. Nossa equipe técnica já foi notificada.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Tentar novamente
                </Button>
                <Button onClick={() => window.location.href = '/app'} variant="outline">
                    Voltar ao Início
                </Button>
            </div>
        </div>
    )
}
