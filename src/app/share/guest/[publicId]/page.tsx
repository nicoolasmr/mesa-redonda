import { getServiceRoleClient } from "@/lib/guest"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock } from "lucide-react"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        publicId: string
    }
}

export default async function GuestArtifactSharePage({ params }: PageProps) {
    const { publicId } = params

    // Fetch artifact
    const supabase = getServiceRoleClient()
    const { data: artifact, error } = await supabase
        .from("guest_artifacts")
        .select("*")
        .eq("public_id", publicId)
        .single()

    if (error || !artifact) {
        notFound()
    }

    const artifactData = artifact.result_json as any

    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        {artifactData.summary || "Artefato Gerado"}
                    </h1>
                    <p className="text-zinc-400">
                        Criado em {new Date(artifact.created_at).toLocaleDateString("pt-BR")}
                    </p>
                </div>

                {/* Artifact Content */}
                <Card className="bg-zinc-900 border-zinc-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">
                            📋 {artifactData.type === "exec_summary" ? "Resumo Executivo" : "Artefato"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {artifactData.sections?.map((section: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-violet-500 pl-4">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-zinc-300 whitespace-pre-wrap">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 text-center">
                    <Lock className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        {artifactData.cta || "Quer criar artefatos completos?"}
                    </h2>
                    <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
                        Entre na Mesa Redonda e crie planos executáveis com análise SWOT, roadmaps detalhados,
                        métricas-chave e muito mais. Sem limites.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="/login">
                            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3">
                                Entrar e Continuar
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                        <a href="/">
                            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-3">
                                Voltar para Home
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
