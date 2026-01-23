import { getTemplate, listTemplates } from "@/actions/library"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Play, Lock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ category: string, slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const template = await getTemplate(slug)

    if (!template) return {}

    return {
        title: `${template.name} - Mesa Redonda`,
        description: template.tagline,
        openGraph: {
            title: template.name,
            description: template.tagline,
            // images: [template.image_url] // MVP: Placeholder
        }
    }
}

export default async function PublicTemplatePage({ params }: { params: Promise<{ category: string, slug: string }> }) {
    const { slug } = await params
    const template = await getTemplate(slug)

    if (!template) notFound()

    return (
        <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
            {/* Nav */}
            <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-violet-600" />
                        Mesa Redonda
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" className="border-zinc-800 bg-black text-white hover:bg-zinc-900">
                            Entrar
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="py-24 px-4 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600/20 w-[500px] h-[500px] blur-[120px] rounded-full -z-10 pointer-events-none" />
                <Badge variant="outline" className="mb-6 border-violet-500/40 text-violet-400 uppercase tracking-widest text-[10px]">
                    Template de IA para {template.category?.name || "Estratégia"}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent max-w-4xl mx-auto">
                    {template.name}
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                    {template.tagline}
                </p>
                <Link href={`/app/library/${template.key}`}>
                    <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-14 px-8 rounded-full font-bold text-lg group">
                        <Play className="mr-2 h-5 w-5 fill-black" />
                        Usar este Template
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </header>

            {/* Preview Section */}
            <section className="container mx-auto max-w-5xl px-4 pb-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">O que você recebe</h2>
                            <ul className="space-y-3">
                                {template.outputs.map((output) => (
                                    <li key={output} className="flex items-start gap-3 text-zinc-300">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        {output}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4">Por que usar?</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                {template.description || "Este template foi desenhado para acelerar sua tomada de decisão estratégica, provendo insights profundos e acionáveis em minutos, não semanas."}
                            </p>
                        </div>
                    </div>

                    {/* Visual Mockup */}
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 aspect-square flex flex-col items-center justify-center text-center shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 rounded-2xl" />
                        <Lock className="h-12 w-12 text-zinc-600 mb-4 relative z-10" />
                        <h3 className="text-xl font-bold text-white relative z-10">Prévia Bloqueada</h3>
                        <p className="text-zinc-500 max-w-xs relative z-10 mt-2">
                            Crie uma conta gratuita para interagir com este especialista e gerar seus artefatos.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
