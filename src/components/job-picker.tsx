"use client"

import { Job } from "@/actions/library"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type JobPickerProps = {
    jobs: Job[]
    selectedJobId?: string | null
    onJobSelect: (job: Job) => void
}

export function JobPicker({ jobs, selectedJobId, onJobSelect }: JobPickerProps) {
    // Show only top 3 jobs for progressive disclosure
    const topJobs = jobs.slice(0, 3)

    return (
        <div className="space-y-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                    O que você quer resolver hoje?
                </h2>
                <p className="text-zinc-400 text-lg">
                    Escolha seu objetivo e veja mesas recomendadas
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {topJobs.map((job) => (
                    <Card
                        key={job.id}
                        className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            selectedJobId === job.id
                                ? "bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-500"
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        )}
                        onClick={() => onJobSelect(job)}
                    >
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl mb-3">{job.icon || "🎯"}</div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {job.name}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {job.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
