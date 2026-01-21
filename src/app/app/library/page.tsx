"use client"

import { useState, useEffect } from "react"
import { Category, Job, Template, getCategories, getJobs, listTemplates, trackLibraryViewed } from "@/actions/library"
import { TemplateCard } from "@/components/template-card"
import { TemplateFilters } from "@/components/template-filters"
import { Loader2, Sparkles } from "lucide-react"

export default function LibraryPage() {
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
            const [categoriesData, jobsData, templatesData] = await Promise.all([
                getCategories(),
                getJobs(),
                listTemplates()
            ])

            setCategories(categoriesData)
            setJobs(jobsData)
            setTemplates(templatesData)
            setFilteredTemplates(templatesData)
            setLoading(false)

            // Track telemetry
            await trackLibraryViewed()
        }
        loadData()
    }, [])

    useEffect(() => {
        async function applyFilters() {
            setLoading(true)
            const filtered = await listTemplates(filters)
            setFilteredTemplates(filtered)
            setLoading(false)

            // Track filter usage
            if (Object.keys(filters).length > 0) {
                await trackLibraryViewed(filters)
            }
        }
        applyFilters()
    }, [filters])

    const featuredTemplates = filteredTemplates.filter(t => t.is_featured)
    const regularTemplates = filteredTemplates.filter(t => !t.is_featured)

    // Group by category
    const templatesByCategory = categories.map(category => ({
        category,
        templates: regularTemplates.filter(t => t.category_id === category.id)
    })).filter(group => group.templates.length > 0)

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Biblioteca de Mesas
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Tudo que você precisa para criar e escalar um negócio
                    </p>
                </div>

                {/* Filters */}
                <TemplateFilters
                    categories={categories}
                    jobs={jobs}
                    filters={filters}
                    onFilterChange={setFilters}
                />

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        {featuredTemplates.length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="h-6 w-6 text-violet-400" />
                                    <h2 className="text-2xl font-bold text-white">
                                        Mesas em Destaque
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {featuredTemplates.map((template) => (
                                        <TemplateCard key={template.id} template={template} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Templates by Category */}
                        {templatesByCategory.length > 0 ? (
                            <div className="mt-12 space-y-12">
                                {templatesByCategory.map(({ category, templates: categoryTemplates }) => (
                                    <div key={category.id}>
                                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="text-3xl">{category.icon}</span>
                                            {category.name}
                                        </h2>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {categoryTemplates.map((template) => (
                                                <TemplateCard key={template.id} template={template} showCategory={false} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-12 text-center py-24 bg-zinc-900 border border-zinc-800 rounded-lg">
                                <p className="text-zinc-400 text-lg mb-4">
                                    Nenhuma mesa encontrada com esses filtros.
                                </p>
                                <button
                                    onClick={() => setFilters({})}
                                    className="text-violet-400 hover:text-violet-300 underline"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
