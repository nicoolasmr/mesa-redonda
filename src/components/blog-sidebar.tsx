"use client"

import { cn } from "@/lib/utils"

type BlogCategory = "produto-estrategia" | "marketing-growth" | "vendas-revenue" | "carreira-lideranca" | "produtividade-execucao"

type BlogSidebarProps = {
    selectedCategory: BlogCategory | "all"
    onCategoryChange: (category: BlogCategory | "all") => void
}

const categories = [
    { id: "all" as const, label: "Todos os Artigos", icon: "📚", count: 0 },
    { id: "produto-estrategia" as BlogCategory, label: "Produto & Estratégia", icon: "🎯", count: 0 },
    { id: "marketing-growth" as BlogCategory, label: "Marketing & Growth", icon: "💼", count: 0 },
    { id: "vendas-revenue" as BlogCategory, label: "Vendas & Revenue", icon: "💰", count: 0 },
    { id: "carreira-lideranca" as BlogCategory, label: "Carreira & Liderança", icon: "🚀", count: 0 },
    { id: "produtividade-execucao" as BlogCategory, label: "Produtividade & Execução", icon: "💡", count: 0 },
]

export function BlogSidebar({ selectedCategory, onCategoryChange }: BlogSidebarProps) {
    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Categorias</h2>
                <nav className="space-y-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3",
                                selectedCategory === category.id
                                    ? "bg-violet-600 text-white font-semibold"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                        >
                            <span className="text-xl">{category.icon}</span>
                            <span className="flex-1 text-sm">{category.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-zinc-800">
                    <h3 className="text-sm font-semibold text-white mb-3">Sobre o Blog</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Guias profundos e acionáveis sobre produto, marketing, vendas, carreira e produtividade.
                        Sem conteúdo raso.
                    </p>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-lg">
                    <p className="text-xs text-violet-300 mb-3">
                        💡 Transforme insights em decisões
                    </p>
                    <a
                        href="/login"
                        className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Criar Minha Mesa
                    </a>
                </div>
            </div>
        </aside>
    )
}
