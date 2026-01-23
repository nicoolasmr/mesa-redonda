"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Category, Job, Template, getCategories, getJobs, listTemplates, trackLibraryViewed } from "@/actions/library"
import { TemplateCard } from "@/components/template-card"
import { TemplateFilters } from "@/components/template-filters"
import { Loader2, Sparkles, Trophy, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function LibraryPageContent() {
    const searchParams = useSearchParams()
    const jobFromUrl = searchParams.get('job')

    const [categories, setCategories] = useState<Category[]>([])
    const [jobs, setJobs] = useState<Job[]>([])
    const [templates, setTemplates] = useState<Template[]>([])
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<{
        category?: string
        job?: string
        difficulty?: 'basic' | 'advanced'
        risk?: 'low' | 'medium' | 'high'
        query?: string
    }>({})

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [categoriesData, jobsData, templatesData] = await Promise.all([
                getCategories(),
                getJobs(),
                listTemplates()
            ])

            setCategories(categoriesData)
            setJobs(jobsData)
            setTemplates(templatesData)
            setFilteredTemplates(templatesData)

            if (jobFromUrl) {
                const matchingJob = jobsData.find(j => j.key === jobFromUrl)
                if (matchingJob) {
                    setFilters({ job: matchingJob.id })
                }
            }

            setLoading(false)
            await trackLibraryViewed()
        }
        loadData()
    }, [jobFromUrl])

    useEffect(() => {
        async function applyFilters() {
            // Optimization: if no filters, use pre-loaded templates
            if (Object.keys(filters).length === 0) {
                setFilteredTemplates(templates)
                return
            }

            setLoading(true)
            const filtered = await listTemplates(filters)
            setFilteredTemplates(filtered)
            setLoading(false)

            await trackLibraryViewed(filters)
        }
        applyFilters()
    }, [filters, templates])

    const featuredTemplates = filteredTemplates.filter(t => t.is_featured)
    const regularTemplates = filteredTemplates.filter(t => !t.is_featured)

    // Group templates by category for the "swimlanes"
    const templatesByCategory = categories.map(category => ({
        category,
        templates: regularTemplates.filter(t => t.category_id === category.id)
    })).filter(group => group.templates.length > 0)

    const selectedJob = jobs.find(j => j.id === filters.job)

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header Hero */}
            <header className="relative py-20 px-4 overflow-hidden border-b border-zinc-900 bg-zinc-950/50">
                <div className="absolute top-0 right-0 h-96 w-96 bg-violet-600/10 blur-[100px] -z-10 rounded-full" />
                <div className="container mx-auto max-w-7xl text-center">
                    <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400">
                        <Flame className="h-3 w-3 mr-1 fill-violet-400" />
                        CATÁLOGO STAFF SENIOR
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                        O que vamos decidir hoje?
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Escolha entre centenas de marcos estratégicos. Nossas personas são treinadas para
                        desafiar e estruturar suas ideias em artefatos prontos.
                    </p>
                </div>
            </header>

            <div className="container mx-auto max-w-7xl px-4 mt-12">
                {/* Active Filter Badge */}
                {selectedJob && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-violet-900/40 to-black border border-violet-500/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-900/40">
                                {selectedJob.icon || "🎯"}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Foco Atual:</p>
                                <h2 className="text-2xl font-bold text-white">{selectedJob.name}</h2>
                            </div>
                        </div>
                        <button onClick={() => setFilters({})} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors underline">
                            Ver catálogo completo
                        </button>
                    </div>
                )}

                {/* Filters Row */}
                <TemplateFilters categories={categories} jobs={jobs} filters={filters} onFilterChange={setFilters} />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                        <p className="text-zinc-500 animate-pulse">Sintonizando especialistas...</p>
                    </div>
                ) : (
                    <div className="space-y-16 mt-12">
                        {/* Featured Section */}
                        {featuredTemplates.length > 0 && (
                            <section className="animate-in fade-in duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-7 w-7 text-amber-500" />
                                        <h2 className="text-3xl font-black text-white">Essenciais Founders</h2>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Top Rated</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredTemplates.map((template) => (
                                        <TemplateCard key={template.id} template={template} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Category Sections */}
                        {templatesByCategory.length > 0 ? (
                            <div className="space-y-20">
                                {templatesByCategory.map(({ category, templates: categoryTemplates }) => (
                                    <section key={category.id} className="animate-in fade-in duration-1000">
                                        <div className="flex items-baseline gap-4 mb-8 pb-4 border-b border-zinc-900">
                                            <span className="text-3xl">{category.icon}</span>
                                            <h2 className="text-3xl font-black text-white capitalize">{category.name}</h2>
                                            <span className="text-zinc-600 font-mono text-sm ml-auto">{categoryTemplates.length} mesas</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {categoryTemplates.map((template) => (
                                                <TemplateCard key={template.id} template={template} showCategory={false} />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl">
                                <p className="text-zinc-500 text-lg mb-6">Nenhum especialista pronto para esse critério.</p>
                                <button onClick={() => setFilters({})} className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all">
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Floating CTA (Viral/Growth) */}
            {!loading && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
                    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-300">Não achou o que precisava?</p>
                        <button className="text-sm font-black text-violet-400 hover:text-violet-300">Sugira uma Mesa →</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function LibraryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Carregando Biblioteca...</p>
            </div>
        }>
            <LibraryPageContent />
        </Suspense>
    )
}
