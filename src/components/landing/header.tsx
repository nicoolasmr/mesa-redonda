"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Header() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={cn(
            "border-b border-transparent fixed top-0 w-full z-50 transition-all duration-300",
            scrolled ? "bg-black/80 backdrop-blur-md border-zinc-800" : "bg-transparent"
        )}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
                        MR
                    </div>
                    Mesa Redonda
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
                    <Link href="#features" className="hover:text-white transition-colors">Recursos</Link>
                    <Link href="#blog" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Preços</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
                        Entrar
                    </Link>
                    <Link href="/login">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6 transition-transform hover:scale-105">
                            Começar Grátis
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
