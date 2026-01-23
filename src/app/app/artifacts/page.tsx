import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listArtifacts } from "@/actions/artifacts"
import { Card, CardContent } from "@/components/ui/card"
import { Archive, FileText, Clock, ArrowRight, Download } from "lucide-react"
import Link from "next/link"

import { getOrCreateWorkspace } from "../workspace-utils"

// ... imports remain same

export default async function ArtifactsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/app/artifacts")
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id)

    if (!workspace) {
        return <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar workspace</p>
            <p className="text-zinc-500 text-sm">Por favor, recarregue a página ou entre em contato com o suporte.</p>
        </div>
    }

    const artifacts = await listArtifacts(workspace.id)

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Meus Artefatos</h1>
                    <p className="text-zinc-500">Documentos e planos estratégicos gerados</p>
                </div>

                {artifacts.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <Archive className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Nenhum artefato gerado</h2>
                        <p className="text-zinc-500 mb-6">Finalize uma mesa para gerar seu primeiro plano de ação.</p>
                        <Link href="/app/tables">
                            <ArrowRight className="h-5 w-5 inline mr-2" />
                            Ir para Minhas Mesas
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {artifacts.map((artifact: any) => (
                            <Link key={artifact.id} href={`/app/artifacts/${artifact.id}`}>
                                <Card className="bg-zinc-950 border-zinc-900 hover:border-violet-500/50 transition-colors cursor-pointer group">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-violet-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                                    {artifact.title || 'Artefato Sem Título'}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                                                    <span>Mesa: {artifact.tables?.title}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(artifact.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Download className="h-4 w-4 text-zinc-700 hover:text-white transition-colors" />
                                            <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                                        </div>
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
