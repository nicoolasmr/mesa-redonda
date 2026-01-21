"use client"

import { Template } from "@/actions/library"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, FileText, AlertTriangle, Sparkles } from "lucide-react"
import Link from "next/link"

type TemplateCardProps = {
    template: Template
    showCategory?: boolean
}

export function TemplateCard({ template, showCategory = true }: TemplateCardProps) {
    const isHighRisk = template.risk_level === 'high'
    const isAdvanced = template.difficulty === 'advanced'
    const isFeatured = template.is_featured

    return (
        <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-all h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg text-white flex-1">
                        {template.name}
                    </CardTitle>
                    {isFeatured && (
                        <Sparkles className="h-5 w-5 text-violet-400 flex-shrink-0" />
                    )}
                </div>
                <p className="text-sm text-zinc-400">{template.tagline}</p>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {showCategory && template.category && (
                        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                            {template.category.icon} {template.category.name}
                        </Badge>
                    )}
                    {isAdvanced && (
                        <Badge className="text-xs bg-violet-600 text-white">
                            PRO
                        </Badge>
                    )}
                    {isHighRisk && (
                        <Badge className="text-xs bg-red-600 text-white flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            ALTO RISCO
                        </Badge>
                    )}
                </div>

                {/* Outputs */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <FileText className="h-4 w-4" />
                    <span>
                        {template.outputs.map((output, idx) => (
                            <span key={output}>
                                {output}
                                {idx < template.outputs.length - 1 && ", "}
                            </span>
                        ))}
                    </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-4 w-4" />
                    <span>~{template.estimated_time_minutes} min</span>
                </div>
            </CardContent>

            <CardFooter>
                <Link href={`/app/library/${template.key}`} className="w-full">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                        Ver Detalhes
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
