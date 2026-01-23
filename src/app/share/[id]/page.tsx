import { getPublicShare } from "@/actions/shares"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Rocket, Clock, Share2 } from "lucide-react"
import Link from "next/link"

export default async function PublicSharePage({ params }: { params: { id: string } }) {
    const shareId = (await params).id
    const data = await getPublicShare(shareId)

    if (!data) {
        notFound()
    }

    const { share, resourceData } = data

    return (
        <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
            {/* Header / Banner */}
            <div className="bg-zinc-950 border-b border-zinc-900 py-4 px-4 sticky top-0 z-50 backdrop-blur-md bg-black/80">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <div className="h-5 w-5 rounded-full bg-violet-600" />
                        Mesa Redonda
                    </div>
                    <Link href="/login">
                        <Button variant="outline" className="border-zinc-800 text-xs font-bold h-9 bg-black">
                            CRIAR MINHA MESA
                        </Button>
                    </Link>
                </div>
            </div>

            <main className="container mx-auto max-w-4xl px-4 py-16">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 px-3 py-1 text-[10px] tracking-widest uppercase">
                            Plano Estratégico Compartilhado
                        </Badge>
                        <span className="text-zinc-600 text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expira em: {new Date(share.expires_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        {resourceData.title || resourceData.analyses?.title || "Documento Sem Título"}
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Este documento foi gerado através de um debate estratégico com as personas do Mesa Redonda.
                    </p>
                </header>

                <Card className="bg-zinc-900 border-zinc-800 mb-12">
                    <CardHeader className="border-b border-zinc-800 pb-8">
                        <CardTitle className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Conteúdo do Artefato</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 prose prose-invert prose-violet max-w-none">
                        {/* Render simple markdown/content here - for MVP we assume raw text or simple JSON */}
                        <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans text-lg">
                            {resourceData.content || resourceData.study_json?.content || "Conteúdo não disponível para visualização pública."}
                        </div>
                    </CardContent>
                </Card>

                {/* Viral CTA Section */}
                <section className="p-12 bg-gradient-to-br from-violet-600 to-purple-900 rounded-3xl text-center space-y-6 shadow-2xl shadow-violet-900/40">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto">
                        <Rocket className="h-8 w-8 text-violet-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white">Também quer transformar suas conversas em planos de ação?</h2>
                    <p className="text-violet-100 max-w-lg mx-auto opacity-80">
                        O Mesa Redonda usa especialistas de IA para desafiar suas ideias e entregar documentos estratégicos prontos para execução em 15 minutos.
                    </p>
                    <Link href="/login" className="inline-block mt-4">
                        <Button className="bg-white text-black hover:bg-zinc-100 font-black h-14 px-12 rounded-2xl text-lg group">
                            COMEÇAR AGORA
                            <Share2 className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </Link>
                </section>
            </main>

            <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-xs">
                © 2024 Mesa Redonda • Desenvolvido para Tomadores de Decisão.
            </footer>
        </div>
    )
}
