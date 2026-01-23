"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, ShieldAlert } from "lucide-react";
import { StudyPack } from "@/lib/analyzer/schemas";

export function StudyRenderer({ data }: { data: StudyPack }) {
    if (!data) return null;

    return (
        <div className="space-y-12 pb-12">
            {/* Summary */}
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">{data.summary.one_liner}</h2>
                <div className="p-6 bg-violet-600/5 border border-violet-500/20 rounded-2xl text-zinc-300 leading-relaxed text-lg italic">
                    &ldquo;{data.summary.paragraph}&rdquo;
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Findings */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-400" />
                        Principais Descobertas
                    </h3>
                    <div className="space-y-4">
                        {data.key_findings.map((f, i) => (
                            <Card key={i} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white uppercase text-xs tracking-widest">{f.title}</h4>
                                        <Badge variant="outline" className={`text-[10px] ${f.confidence === 'high' ? 'text-green-400 border-green-500/30' :
                                                f.confidence === 'med' ? 'text-amber-400 border-amber-500/30' : 'text-red-400 border-red-500/30'
                                            }`}>
                                            Confiança {f.confidence.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{f.evidence}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Risks */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Riscos e Mitigação
                    </h3>
                    <div className="space-y-4">
                        {data.risks.map((r, i) => (
                            <div key={i} className="p-4 bg-red-950/10 border-l-2 border-red-500 rounded-r-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                                    <ShieldAlert className="h-4 w-4" />
                                    {r.risk}
                                </div>
                                <div className="text-zinc-500 text-xs">
                                    <strong>Impacto:</strong> {r.impact}
                                </div>
                                <div className="text-zinc-300 text-xs leading-relaxed">
                                    <strong>Mitigação Sugerida:</strong> {r.mitigation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Plano de Ação (Próximos Passos)
                </h3>
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <div className="divide-y divide-zinc-800">
                        {data.next_steps.map((step, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${step.priority === 'P0' ? 'bg-red-500 text-white' :
                                            step.priority === 'P1' ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {step.priority}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{step.step}</p>
                                        <p className="text-zinc-500 text-xs">{step.owner || 'Não atribuído'} • Prazo: {step.deadline || 'ASAP'}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-zinc-700" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Disclaimer for high risk */}
            {data.disclaimer && (
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl border-t-4 border-t-amber-500">
                    <h4 className="text-amber-500 font-bold text-sm mb-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        AVISO LEGAL E LIMITAÇÃO DE RESPONSABILIDADE
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed italic">
                        {data.disclaimer}
                    </p>
                </div>
            )}
        </div>
    );
}
