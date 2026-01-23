import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StudyRenderer } from "@/components/analyzer/study-renderer";
import { DashboardRenderer } from "@/components/analyzer/dashboard-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, BarChart3, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: analysis } = await supabase
        .from("analyses")
        .select("*, analysis_results(*)")
        .eq("id", id)
        .single();

    if (!analysis) notFound();

    const results = analysis.analysis_results;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <Link href="/app/analyzer" className="text-zinc-600 hover:text-white text-sm mb-4 inline-block transition-colors">
                        ← Voltar para Lista
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">{analysis.title}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-violet-600/10 text-violet-400 border-violet-500/20 px-3 uppercase text-[10px] tracking-tighter">
                                    Especialista: {analysis.specialist_key}
                                </Badge>
                                <span className="text-zinc-500 text-xs">ID: {analysis.id.substring(0, 8)}</span>
                            </div>
                        </div>
                        {analysis.status === 'processing' && (
                            <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/20 animate-pulse flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                PROCESSANDO...
                            </div>
                        )}
                        {analysis.status === 'done' && (
                            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
                                ✓ CONCLUÍDO
                            </div>
                        )}
                    </div>
                </header>

                {analysis.status === 'error' && (
                    <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-3xl mb-12">
                        <div className="flex items-center gap-3 text-red-500 font-bold mb-4 text-xl">
                            <ShieldAlert className="h-8 w-8" />
                            Erro na Análise
                        </div>
                        <p className="text-zinc-400 leading-relaxed mb-6">
                            Não conseguimos processar seus arquivos. {analysis.error_message}
                        </p>
                        <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold transition-all">
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {analysis.status === 'done' && results && (
                    <Tabs defaultValue="study" className="space-y-8">
                        <TabsList className="bg-zinc-900 border-zinc-800 p-1 rounded-2xl h-14">
                            <TabsTrigger value="study" className="rounded-xl data-[state=active]:bg-zinc-800 px-8 py-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Estudo Estratégico
                            </TabsTrigger>
                            <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-zinc-800 px-8 py-2 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Dashboard Executivo
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="study" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <StudyRenderer data={results.study_json} />
                        </TabsContent>

                        <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DashboardRenderer data={results.dashboard_json} />
                        </TabsContent>
                    </Tabs>
                )}

                {(analysis.status === 'created' || analysis.status === 'processing') && (
                    <div className="py-24 text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-violet-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Analisando seus dados...</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto">
                            Isso pode levar até 2 minutos dependendo do volume de dados dos seus arquivos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
