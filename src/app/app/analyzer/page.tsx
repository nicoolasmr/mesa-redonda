import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSearch, Plus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { getOrCreateWorkspace } from "../workspace-utils"

// ... 

export default async function AnalyzerListPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8 text-center">Usuário não autenticado</div>

    const workspace = await getOrCreateWorkspace(supabase, user.id);

    if (!workspace) {
        return <div className="p-12 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar workspace</p>
            <p className="text-zinc-500 text-sm">Por favor, recarregue a página ou entre em contato com o suporte.</p>
        </div>
    }
    const wsId = workspace.id;

    const { data: analyses } = await supabase
        .from("analyses")
        .select("*")
        .eq("workspace_id", wsId)
        .order("created_at", { ascending: false });

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Analyzer</h1>
                    <p className="text-zinc-400">Extraia inteligência estratégica de seus arquivos.</p>
                </div>
                <Link href="/app/analyzer/new">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 px-6">
                        <Plus className="mr-2 h-5 w-5" />
                        Nova Análise
                    </Button>
                </Link>
            </header>

            {!analyses || analyses.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/30">
                    <div className="bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-zinc-800">
                        <FileSearch className="h-10 w-10 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Sem análises ainda</h2>
                    <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
                        Suba PDFs ou Planilhas para começar a extrair insights automáticos de seus documentos.
                    </p>
                    <Link href="/app/analyzer/new">
                        <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12">
                            <Plus className="mr-2 h-5 w-5" />
                            Criar Primeira Análise
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {analyses.map((a) => (
                        <Link key={a.id} href={`/app/analyzer/${a.id}`}>
                            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-violet-500/50 transition-all cursor-pointer group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-3 rounded-xl bg-zinc-950 ${a.status === 'done' ? 'text-violet-500' : 'text-zinc-600'
                                            }`}>
                                            <FileSearch className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{a.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                                                    {a.specialist_key}
                                                </Badge>
                                                <span className="text-zinc-600 text-[10px] flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(a.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {a.status === 'done' ? (
                                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                                <CheckCircle2 className="h-4 w-4" />
                                                CONCLUÍDO
                                            </div>
                                        ) : a.status === 'error' ? (
                                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                                                <AlertTriangle className="h-4 w-4" />
                                                ERRO
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold animate-pulse">
                                                PROCESSSANDO...
                                            </div>
                                        )}
                                        <ArrowRight className="h-5 w-5 text-zinc-800 group-hover:text-white transition-all group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}
