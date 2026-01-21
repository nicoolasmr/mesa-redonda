"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Job, Template, getJobs, recommendTemplates, saveUserIntent, trackJobSelected } from "@/actions/library"
import { JobPicker } from "@/components/job-picker"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AppHomePage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [recommendations, setRecommendations] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function loadData() {
            const jobsData = await getJobs()
            setJobs(jobsData)

            // Get first workspace (simplified for MVP)
            // In production, you'd have workspace selection
            const response = await fetch('/api/workspaces')
            const workspaces = await response.json()
            if (workspaces.length > 0) {
                setWorkspaceId(workspaces[0].id)
            }

            setLoading(false)
        }
        loadData()
    }, [])

    async function handleJobSelect(job: Job) {
        setSelectedJob(job)
        setLoading(true)

        if (workspaceId) {
            // Save intent
            await saveUserIntent(workspaceId, {
                primary_job_id: job.id,
                workspace_id: workspaceId,
                secondary_job_ids: [],
                industries: [],
                stage: null
            })

            // Track telemetry
            await trackJobSelected(job.id, job.key, workspaceId)

            // Get recommendations
            const recs = await recommendTemplates(workspaceId, 3)
            setRecommendations(recs)
        }

        setLoading(false)
    }

    if (loading && jobs.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Job Picker */}
                <JobPicker
                    jobs={jobs}
                    selectedJobId={selectedJob?.id}
                    onJobSelect={handleJobSelect}
                />

                {/* Recommendations */}
                {selectedJob && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Mesas Recomendadas para {selectedJob.name}
                                </h3>
                                <p className="text-zinc-400">
                                    Comece por aqui ou explore a biblioteca completa
                                </p>
                            </div>
                            <Link href="/app/library">
                                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                                    Ver Biblioteca Completa
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-6">
                                {recommendations.map((template) => (
                                    <TemplateCard key={template.id} template={template} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg">
                                <p className="text-zinc-400">
                                    Nenhuma mesa encontrada. Explore a biblioteca completa.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Access to Workspaces */}
                {!selectedJob && (
                    <div className="mt-12 text-center">
                        <p className="text-zinc-500 text-sm mb-4">
                            Ou acesse seus workspaces diretamente
                        </p>
                        <Link href="/app/workspaces">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white">
                                Ver Meus Workspaces
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
