"use client"

import { Category, Job } from "@/actions/library"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type TemplateFiltersProps = {
    categories: Category[]
    jobs: Job[]
    filters: {
        category?: string
        job?: string
        difficulty?: 'basic' | 'advanced'
        risk?: 'low' | 'medium' | 'high'
        query?: string
    }
    onFilterChange: (filters: TemplateFiltersProps['filters']) => void
}

export function TemplateFilters({ categories, jobs, filters, onFilterChange }: TemplateFiltersProps) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-white">Buscar</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        id="search"
                        type="text"
                        placeholder="Buscar mesas..."
                        value={filters.query || ''}
                        onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
                        className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    />
                </div>
            </div>

            {/* Filters Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">Categoria</Label>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, category: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Job */}
                <div className="space-y-2">
                    <Label htmlFor="job" className="text-white">Objetivo</Label>
                    <Select
                        value={filters.job || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, job: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {jobs.map((job) => (
                                <SelectItem key={job.id} value={job.id}>
                                    {job.icon} {job.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-white">Dificuldade</Label>
                    <Select
                        value={filters.difficulty || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, difficulty: value === 'all' ? undefined : value as 'basic' | 'advanced' })
                        }
                    >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Risk */}
                <div className="space-y-2">
                    <Label htmlFor="risk" className="text-white">Risco</Label>
                    <Select
                        value={filters.risk || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, risk: value === 'all' ? undefined : value as 'low' | 'medium' | 'high' })
                        }
                    >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="low">Baixo</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
