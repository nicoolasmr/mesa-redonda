import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type BlogPost = {
    slug: string
    title: string
    category: string
    readingTime?: number
}

type RelatedArticlesProps = {
    category: string
    currentSlug: string
    allPosts: BlogPost[]
    limit?: number
}

export function RelatedArticles({
    category,
    currentSlug,
    allPosts,
    limit = 3
}: RelatedArticlesProps) {
    const related = allPosts
        .filter(post => post.category === category && post.slug !== currentSlug)
        .slice(0, limit)

    if (related.length === 0) return null

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                Artigos Relacionados
            </h3>
            <div className="space-y-4">
                {related.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="block group"
                    >
                        <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors mb-1 line-clamp-2">
                            {post.title}
                        </h4>
                        {post.readingTime && (
                            <p className="text-xs text-zinc-500">
                                {post.readingTime} min de leitura
                            </p>
                        )}
                    </Link>
                ))}
            </div>
            <Link
                href={`/blog?category=${category}`}
                className="flex items-center gap-1 mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors group"
            >
                Ver todos em {category}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>
    )
}
