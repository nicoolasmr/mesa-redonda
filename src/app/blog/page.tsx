import { getPosts } from "@/lib/blog"
import { BlogList } from "@/components/blog/blog-list"

export const metadata = {
    title: "Blog Mesa Redonda - Estratégia, Growth e Produto",
    description: "Guias práticos e profundos para fundadores e líderes. Aprenda a usar IA para escalar sua empresa.",
}

export default function BlogIndexPage() {
    const posts = getPosts()

    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        Blog Mesa Redonda
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Guias profundos sobre produto, marketing, vendas, carreira e produtividade.
                        Conteúdo denso, frameworks reais, zero fluff.
                    </p>
                </div>

                {/* Client Component for filtering interactivity */}
                <BlogList initialPosts={posts} />
            </div>
        </div>
    )
}
