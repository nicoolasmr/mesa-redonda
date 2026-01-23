import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listTables } from "@/actions/tables"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

import { getOrCreateWorkspace } from "../workspace-utils"

// ... imports remain same

export default async function TablesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/app/tables")
    }

    const minsWorkspace = await getOrCreateWorkspace(supabase, user.id)

    if (!minsWorkspace) {
        return <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar workspace</p>
            <p className="text-zinc-500 text-sm">Por favor, recarregue a página ou entre em contato com o suporte.</p>
        </div>
    }

    const tables = await listTables(minsWorkspace.id)

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Minhas Mesas</h1>
                        <p className="text-zinc-500">Histórico de conversas estratégicas</p>
                    </div>
                    <Link href="/app/library">
                        <Button className="bg-violet-600 hover:bg-violet-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Mesa
                        </Button>
                    </Link>
                </div>

                {tables.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Nenhuma mesa iniciada</h2>
                        <p className="text-zinc-500 mb-6">Comece sua primeira conversa estratégica agora.</p>
                        <Link href="/app/library">
                            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white">
                                Explorar Biblioteca
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tables.map((table: any) => (
                            <Link key={table.id} href={`/app/tables/${table.id}`}>
                                <Card className="bg-zinc-950 border-zinc-900 hover:border-violet-500/50 transition-colors cursor-pointer group">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-violet-900/30 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                                    {table.title || 'Mesa Sem Título'}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                                                    <span>{table.table_templates?.name}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(table.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
