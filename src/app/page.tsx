import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingDemo } from "@/components/landing/landing-demo"
import { Header } from "@/components/landing/header"
import { PricingTable } from "@/components/landing/pricing-table"
import { BlogList } from "@/components/blog/blog-list"
import { getPosts } from "@/lib/blog"
import { Check, Shield, Users, Zap, ArrowRight, FileText, Target, Brain } from "lucide-react"

export default async function LandingPage() {
  const allPosts = await getPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans">
      <Header />

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 center left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[130px] rounded-full -z-10 opacity-50 pointer-events-none" />

        <div className="container mx-auto max-w-6xl text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider mb-8">
            <SparkleIcon className="h-3 w-3" />
            Agora com Claude 3.5 Sonnet
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Sua Diretoria Estratégica <br className="hidden md:block" />
            <span className="text-violet-500">Rodando em IA.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Substitua horas de reuniões improdutivas por debates estratégicos com personas de IA treinadas para desafiar suas ideias e criar planos de ação.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-zinc-500 mb-16">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 5 Créditos Grátis</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Setup Instantâneo</span>
          </div>
        </div>

        {/* DEMO WIDGET */}
        <div id="demo" className="container mx-auto px-4 relative z-10 scroll-mt-32">
          <LandingDemo />
        </div>
      </header>

      {/* Social Proof */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-950/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-8">
            Tecnologia de ponta utilizada
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Tech Logos (Text fallback for now) */}
            <span className="font-bold text-xl text-zinc-500">OpenAI</span>
            <span className="font-bold text-xl text-zinc-500">Anthropic</span>
            <span className="font-bold text-xl text-zinc-500">Vercel</span>
            <span className="font-bold text-xl text-zinc-500">Supabase</span>
          </div>
        </div>
      </section>

      {/* Features / Use Cases */}
      <section id="features" className="py-32 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Mais que um Chatbot. <br />Uma Mesa Redonda.</h2>
          <p className="text-xl text-zinc-400">
            Diferente do ChatGPT padrão, o Mesa Redonda estrutura o debate entre múltiplos especialistas para mitigar alucinações e vieses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-violet-500" />}
            title="Velocidade de Execução"
            description="O que levaria 3 semanas de consultoria externa, a Mesa Redonda entrega em 5 minutos de processamento paralelo."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-emerald-500" />}
            title="Privacidade Garantida"
            description="Seus dados nunca treinam modelos públicos. Ambiente isolado e seguro para suas estratégias mais sensíveis."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-amber-500" />}
            title="Conselho de Elite"
            description="Acesse personas de C-Level (CMO, CTO, CFO) calibradas para oferecer feedback crítico, não apenas concordar com você."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6 text-blue-500" />}
            title="Artefatos Prontos"
            description="Não receba apenas texto. Receba roadmaps, tabelas, e-mails e documentos prontos para uso imediato."
          />
          <FeatureCard
            icon={<Target className="h-6 w-6 text-red-500" />}
            title="Foco em Decisão"
            description="A IA atua como facilitadora para você tomar a decisão final com mais confiança e dados."
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-purple-500" />}
            title="Memória Contextual"
            description="O sistema lembra das suas preferências e do contexto da sua empresa entre diferentes sessões."
          />
        </div>
      </section>

      {/* Pricing */}
      <PricingTable />

      {/* Blog Section */}
      <section id="blog" className="py-32 container mx-auto px-4 border-t border-zinc-900 bg-zinc-950">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Últimas do Blog</h2>
            <p className="text-xl text-zinc-400">Insights sobre estratégia, IA e growth.</p>
          </div>
          <Link href="/blog">
            <Button variant="outline" className="hidden md:flex">
              Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <BlogList initialPosts={recentPosts} />

        <div className="mt-12 text-center md:hidden">
          <Link href="/blog">
            <Button variant="outline" className="w-full">
              Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 container mx-auto px-4 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <FaqItem question="A IA vai substituir meu trabalho?" answer="Não. A Mesa Redonda foi desenhada para 'aumentar' a inteligência humana, não substituí-la. Ela faz o trabalho pesado de pesquisa e estruturação, mas a decisão final é sua." />
          <FaqItem question="Meus dados estão seguros?" answer="Sim. Utilizamos provedores de LLM Enterprise com garantia de zero-retention para treinamento. Seus dados são criptografados em repouso e trânsito." />
          <FaqItem question="Posso cancelar a qualquer momento?" answer="Sim. Não há fidelidade ou contratos de longo prazo nos planos Self-Service." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-2xl mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg" />
                Mesa Redonda
              </div>
              <p className="text-zinc-400 max-w-sm">
                Sua vantagem competitiva injusta. Transforme incertezas em planos de ação executáveis em minutos.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Produto</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><Link href="#features" className="hover:text-violet-400">Recursos</Link></li>
                <li><Link href="#pricing" className="hover:text-violet-400">Preços</Link></li>
                <li><Link href="/login" className="hover:text-violet-400">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Empresa</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><Link href="/blog" className="hover:text-violet-400">Blog</Link></li>
                <li><Link href="#" className="hover:text-violet-400">Sobre nós</Link></li>
                <li><Link href="#" className="hover:text-violet-400">Contato</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-8 text-center text-zinc-600 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2024 Mesa Redonda AI. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white">Termos</Link>
              <Link href="#" className="hover:text-white">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group">
      <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-violet-300 transition-colors">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900/50 transition-colors">
      <h4 className="text-lg font-bold text-white mb-2">{question}</h4>
      <p className="text-zinc-400">{answer}</p>
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}
