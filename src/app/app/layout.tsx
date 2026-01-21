import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, CreditCard, Settings, Archive } from "lucide-react"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-zinc-950 text-white">
            {/* Sidebar */}
            <aside className="w-16 md:w-64 border-r border-zinc-800 flex flex-col">
                <div className="h-16 flex items-center px-4 md:px-6 border-b border-zinc-800">
                    <div className="h-6 w-6 rounded-full bg-violet-600 shrink-0" />
                    <span className="ml-3 font-bold hidden md:block">Mesa Redonda</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/app">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Home className="mr-0 md:mr-2 h-5 w-5" />
                            <span className="hidden md:inline">Dashboard</span>
                        </Button>
                    </Link>
                    <Link href="/app/tables">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <MessageSquare className="mr-0 md:mr-2 h-5 w-5" />
                            <span className="hidden md:inline">Mesas</span>
                        </Button>
                    </Link>
                    <Link href="/app/artifacts">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Archive className="mr-0 md:mr-2 h-5 w-5" />
                            <span className="hidden md:inline">Artefatos</span>
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <Link href="/app/settings/billing">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <CreditCard className="mr-0 md:mr-2 h-5 w-5" />
                            <span className="hidden md:inline">Billing</span>
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-black">
                {children}
            </main>
        </div>
    )
}
