import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    User, CreditCard, Shield, Check,
    ArrowRight, Rocket, Star, Users
} from "lucide-react"
import Link from "next/link"
import { createPortalSession } from "@/actions/stripe"
import { TeamInvite } from "@/components/growth/team-invite"
import { ReferralCard } from "@/components/growth/referral-card"

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/app/settings")
    }

    // Get workspace (resiliently)
    let { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)

    let workspace = workspaces?.[0]

    // Plan data for UI
    const currentPlan = workspace?.subscription_plan || 'free'
    const planNames: Record<string, string> = {
        free: 'Plano Gratuito',
        starter: 'Starter',
        pro: 'Pro (Founder)',
        team: 'Team'
    }

    // Get Growth Data (Invites & Referral)
    const { data: invites } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('workspace_id', workspace?.id || '')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    const { data: referralData } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-12" >
            <div className="max-w-4xl mx-auto">
                {/* Header Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-2xl font-bold shadow-xl shadow-violet-900/20">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{user.email}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase text-[10px] tracking-widest">
                                    ID: {user.id.substring(0, 8)}
                                </Badge>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] uppercase tracking-widest">
                                    {planNames[currentPlan]}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="general" className="space-y-8">
                    <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar">
                        <TabsTrigger value="general" className="rounded-xl px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                            <User className="h-4 w-4 mr-2" />
                            Geral
                        </TabsTrigger>
                        <TabsTrigger value="subscription" className="rounded-xl px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Assinatura & Preços
                        </TabsTrigger>
                        <TabsTrigger value="team" className="rounded-xl px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                            <Users className="h-4 w-4 mr-2" />
                            Equipe & Indique
                        </TabsTrigger>
                        <TabsTrigger value="pioneer" className="rounded-xl px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 font-bold border-l border-zinc-800">
                            <Star className="h-4 w-4 mr-2 text-amber-500" />
                            Programa Pioneiro
                        </TabsTrigger>
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* ... (Existing General Content) ... */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg">Informações da Conta</CardTitle>
                                <CardDescription>Seus dados de acesso e workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Endereço de Email</label>
                                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nome do Workspace</label>
                                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 flex justify-between items-center group">
                                        {workspace?.name || "Meu Workspace"}
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Editar</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-emerald-500" />
                                    Segurança e Privacidade
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                                    Suas conversas e arquivos são privados. Seus dados no <strong>The Brain</strong> são isolados e nunca usados para treinamento de modelos de terceiros.
                                </p>
                                <Button variant="outline" className="border-zinc-800 text-zinc-400" disabled>Alterar Senha (em breve)</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TEAM & REFERRAL TAB */}
                    <TabsContent value="team" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Sua Equipe</h3>
                                    <p className="text-zinc-400 mb-6">Convide membros para colaborar nas mesas.</p>

                                    {/* Team Invite Component */}
                                    <TeamInvite
                                        workspaceId={workspace?.id!}
                                        invites={invites || []} // Need to fetch invites
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2">Programa de Indicação</h3>
                                <p className="text-zinc-400 mb-6">Ganhe créditos extras indicando amigos.</p>
                                {/* Referral Component */}
                                <ReferralCard initialCode={referralData} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* SUBSCRIPTION TAB */}
                    <TabsContent value="subscription" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Current Plan Hero */}
                        <div className="p-8 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Seu Plano Atual</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">{planNames[currentPlan]}</span>
                                    {workspace?.subscription_status === 'active' && <Badge className="bg-emerald-500 text-black font-bold text-[10px]">ATIVO</Badge>}
                                </div>
                            </div>
                            {currentPlan !== 'free' && (
                                <form action={createPortalSession}>
                                    <Button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white h-12 px-8 rounded-xl font-bold">
                                        Gerenciar Assinatura
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Upgrade Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex justify-between items-center">
                                        Pro (Founder)
                                        <Rocket className="h-5 w-5 text-violet-500" />
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-white mt-2">R$ 129<span className="text-sm text-zinc-500 font-normal">/mês</span></div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Mesas Ilimitadas</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Modelos GPT-4o</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> The Brain (Memória)</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Analyzer (PDF/Excel)</li>
                                    </ul>
                                    <Link href="/upgrade" className="block">
                                        <Button className="w-full bg-violet-600 hover:bg-violet-700 h-14 rounded-2xl font-black shadow-xl shadow-violet-900/20 group-hover:scale-[1.02] transition-transform">
                                            COMEÇAR AGORA
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden opacity-80 border-dashed">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex justify-between items-center">
                                        Team
                                        <Users className="h-5 w-5 text-zinc-600" />
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-white mt-2">R$ 197<span className="text-sm text-zinc-500 font-normal">/mês</span></div>
                                </CardHeader>
                                <CardContent className="space-y-4 text-zinc-400">
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Tudo do Pro</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 3 Membros inclusos</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Workspace Privado</li>
                                    </ul>
                                    <Link href="/upgrade" className="block">
                                        <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 h-14 rounded-2xl font-bold">
                                            CONTRATAR TEAM
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* PIONEER TAB */}
                    <TabsContent value="pioneer" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-12 text-center bg-violet-600/5 border border-violet-500/20 rounded-3xl space-y-6">
                            <div className="h-20 w-20 bg-violet-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30">
                                <Star className="h-10 w-10 text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white mb-2">Programa Pioneiro</h1>
                                <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed">
                                    Ao ser um dos primeiros membros Pro, você garante bônus vitalícios e acesso antecipado a todos os novos "Experts" que lançaremos mensalmente.
                                </p>
                            </div>
                            <Link href="/upgrade" className="inline-block">
                                <Button className="bg-white text-black hover:bg-zinc-200 h-14 px-12 rounded-2xl font-black">
                                    Quero ser Pioneiro
                                </Button>
                            </Link>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer Footer */}
                <footer className="mt-12 text-center pb-12">
                    <Link href="/app" className="text-zinc-600 hover:text-white text-xs transition-colors flex items-center justify-center gap-2">
                        ← Voltar para Minhas Mesas
                    </Link>
                </footer>
            </div>
        </div >
    )
}
