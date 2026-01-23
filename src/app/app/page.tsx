import { getJobs, recommendTemplates } from "@/actions/library"
import { JobPicker } from "@/components/job-picker"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { getOrCreateWorkspace } from "./workspace-utils"

// ... imports remain the same

export default async function AppHomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id)

    if (!workspace) {
        return <div className="p-12 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar workspace</p>
            <p className="text-zinc-500 text-sm">Por favor, recarregue a página ou entre em contato com o suporte.</p>
        </div>
    }

    // 2. Fetch Data Parallel
    const [jobs, recommendations] = await Promise.all([
        getJobs(),
        recommendTemplates(workspace.id, 6) // Fetch 6 recommendations/featured
    ])

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-16">

                {/* Section 1: Job Picker (Quick Start) */}
                <JobPicker
                    jobs={jobs}
                    selectedJobId={null}
                // Client component handles interactions via router.push
                />

                {/* Section 2: Featured Objectives (Requested by User) */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-violet-400" />
                                Objetivos em Destaque
                            </h2>
                            <p className="text-zinc-500 mt-1">
                                Mesas prontas para gerar entregáveis de alto valor.
                            </p>
                        </div>
                        <Link href="/app/library">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white">
                                Ver todos
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-zinc-500 text-sm mb-4">
                            Não encontrou o que busca?
                        </p>
                        <Link href="/app/library">
                            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl px-8">
                                Explorar Biblioteca Completa
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}
