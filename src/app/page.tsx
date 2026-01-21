import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ArrowRight, Zap, Target, FileText, Brain, Users, MessagesSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="h-6 w-6 rounded-full bg-violet-600" />
            Mesa Redonda
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
            <Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
            <Link href="#mesas" className="hover:text-white transition-colors">Mesas</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Preços</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">Entrar</Button>
            </Link>
            <Link href="/app">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* HERO */}
        <section className="container mx-auto px-4 py-24 text-center">
          <Badge className="mb-6 bg-zinc-900 text-violet-400 border-zinc-800 px-4 py-1.5 text-sm font-normal rounded-full">
            ✨ Nova IA de Decisão Estratégica
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent pb-2">
            Decida e saia com um <br className="hidden md:block" /> plano em 15 minutos.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Pare de discutir em círculos. Convoque uma mesa de especialistas virtuais e transforme brainstorms em documentos prontos para execução.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/app">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 rounded-full font-semibold">
                Criar Minha Mesa Agota
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-zinc-500">Sem cartão de crédito necessário</p>
          </div>

          <div className="mt-12 p-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent max-w-5xl mx-auto">
            <div className="rounded-lg bg-zinc-950 border border-white/10 aspect-video flex items-center justify-center relative overflow-hidden group">
              {/* Mockup Placeholder - In a real app we'd put a screenshot or video here */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1),transparent)]" />
              <div className="text-zinc-500 font-mono text-sm flex flex-col items-center">
                <MessagesSquare className="h-12 w-12 mb-4 text-violet-500/50" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">Preview da Interface da Mesa</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-24 border-t border-white/5 bg-zinc-950/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Como funciona</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Target, title: "1. Escolha a Mesa", desc: "Defina seu objetivo: Marketing, Produto, Carreira ou Crise." },
                { icon: Users, title: "2. Debata com Experts", desc: "Nossa IA assume personas rígidas (O Cético, O Criativo) para desafiar suas ideias." },
                { icon: FileText, title: "3. Baixe o Artefato", desc: "Receba um PDF, Checklist ou Doc pronto para enviar ao time." }
              ].map((step, i) => (
                <Card key={i} className="bg-black border-zinc-800 text-zinc-200 hover:border-violet-500/50 transition-colors">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-4 text-violet-400">
                      <step.icon />
                    </div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ANTES VS DEPOIS */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Não é só mais um chat</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <span className="text-2xl">❌</span> O Jeito Antigo
                </h3>
                <Card className="bg-red-950/10 border-red-900/20">
                  <CardContent className="pt-6 space-y-4 text-zinc-400">
                    <div className="flex gap-3"><span className="text-red-500">—</span> "Vamos marcar um call pra alinhar"</div>
                    <div className="flex gap-3"><span className="text-red-500">—</span> 2 horas de papo, 0 documentos</div>
                    <div className="flex gap-3"><span className="text-red-500">—</span> ChatGPT genérico que concorda com tudo</div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <span className="text-2xl">✅</span> Mesa Redonda
                </h3>
                <Card className="bg-green-950/10 border-green-900/20">
                  <CardContent className="pt-6 space-y-4 text-zinc-300">
                    <div className="flex gap-3"><span className="text-green-500">✓</span> Alinhamento assíncrono em 15 min</div>
                    <div className="flex gap-3"><span className="text-green-500">✓</span> Debate focado → Documento pronto</div>
                    <div className="flex gap-3"><span className="text-green-500">✓</span> Personas treinadas para criticar e evoluir ideias</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24 border-t border-white/5 bg-zinc-950/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Planos simples</h2>
            <p className="text-zinc-400 text-center mb-16 max-w-lg mx-auto">Comece grátis, faça upgrade quando escalar.</p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <Card className="bg-black border-zinc-800 text-zinc-400 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Starter</CardTitle>
                  <div className="text-3xl font-bold text-white mt-2">R$ 79<span className="text-sm font-normal text-zinc-500">/mês</span></div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> 10 Mesas/mês</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> Modelos padrão</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> Exportação PDF</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">Escolher Starter</Button>
                </CardFooter>
              </Card>

              {/* Pro */}
              <Card className="bg-zinc-900 border-violet-500/50 text-zinc-300 relative flex flex-col shadow-2xl shadow-violet-900/20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  Recomendado
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-xl">Pro (Founder)</CardTitle>
                  <div className="text-3xl font-bold text-white mt-2">R$ 129<span className="text-sm font-normal text-zinc-500">/mês</span></div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-400" /> Mesas Ilimitadas</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-400" /> Modelos Smart (GPT-4)</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-400" /> Memória Editável</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">Começar Trial</Button>
                </CardFooter>
              </Card>

              {/* Team */}
              <Card className="bg-black border-zinc-800 text-zinc-400 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Team</CardTitle>
                  <div className="text-3xl font-bold text-white mt-2">R$ 197<span className="text-sm font-normal text-zinc-500">/mês</span></div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> Tudo do Pro</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> 3 Membros</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-500" /> Workspace Compartilhado</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">Falar com Vendas</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Dúvidas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-lg">É só um wrapper do ChatGPT?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-base leading-relaxed">
                Não. O ChatGPT é um chat livre. Nós somos um fluxo de trabalho estruturado com personas treinadas para NÃO concordar com você o tempo todo e focadas em gerar um artefato final específico.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-lg">Posso cancelar quando quiser?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-base leading-relaxed">
                Sim, o cancelamento é feito com 1 clique no seu painel de configurações. Sem pegadinhas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-lg">Os dados das minhas mesas são privados?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-base leading-relaxed">
                Absolutamente. Seus dados são isolados no seu Workspace e nunca são usados para treinar modelos públicos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 text-center text-zinc-600 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2024 Mesa Redonda. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
