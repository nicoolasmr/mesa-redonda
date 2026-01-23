import { getPost, getPosts } from "@/lib/blog"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReadingProgressBar } from "@/components/reading-progress-bar"
import { TableOfContents } from "@/components/table-of-contents"
import { ShareButtons } from "@/components/share-buttons"
import { RelatedArticles } from "@/components/related-articles"
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx-components'
import remarkGfm from 'remark-gfm'

// Helper to extract headings from MDX content
function extractHeadings(content: string) {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    const headings: Array<{ id: string; text: string; level: number }> = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        headings.push({ id, text, level })
    }

    return headings
}

// Helper to calculate reading time
function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
}

import { Metadata } from "next"

// ... existing helpers ...

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = getPost(slug)

    if (!post) return {}

    return {
        title: `${post.title} - Mesa Redonda`,
        description: post.excerpt || "Artigo sobre estratégia, growth e produto no blog Mesa Redonda.",
        openGraph: {
            title: post.title,
            description: post.excerpt || "Artigo sobre estratégia, growth e produto no blog Mesa Redonda.",
            type: 'article',
            publishedTime: post.date,
            authors: ['Mesa Redonda Team']
        }
    }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = getPost(slug)

    if (!post) notFound()

    const headings = extractHeadings(post.content)
    const readingTime = calculateReadingTime(post.content)
    const allPosts = getPosts()
    const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mesaredonda.app'}/blog/${slug}`

    return (
        <>
            {/* Progress Bar */}
            <ReadingProgressBar />

            <div className="bg-black min-h-screen text-white">
                {/* Header */}
                <header className="border-b border-zinc-800 py-4 sticky top-0 bg-black/80 backdrop-blur-sm z-40">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar para o Blog
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Clock className="h-4 w-4" />
                            {readingTime} min de leitura
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Sidebar Esquerda - Table of Contents */}
                        <aside className="col-span-3 hidden lg:block">
                            <div className="sticky top-24">
                                <TableOfContents headings={headings} />
                            </div>
                        </aside>

                        {/* Article */}
                        <article className="col-span-12 lg:col-span-6">
                            {/* Meta */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                                    <span className="px-2 py-1 bg-violet-900/30 text-violet-400 rounded">
                                        {post.category}
                                    </span>
                                    <span>•</span>
                                    <time>{post.date}</time>
                                </div>
                                <h1 className="text-5xl font-bold mb-4 text-white leading-tight">
                                    {post.title}
                                </h1>
                                {post.excerpt && (
                                    <p className="text-xl text-zinc-400 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>

                            {/* Content with MDX */}
                            <div className="prose prose-invert prose-lg max-w-none">
                                <MDXRemote
                                    source={post.content}
                                    components={mdxComponents}
                                    options={{
                                        mdxOptions: {
                                            remarkPlugins: [remarkGfm],
                                        }
                                    }}
                                />
                            </div>

                            {/* CTA Final */}
                            <div className="mt-12 p-6 bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-lg">
                                <h3 className="text-2xl font-bold mb-2">🎯 Coloque em Prática</h3>
                                <p className="text-zinc-300 mb-4">
                                    Use a Mesa Redonda para criar seu próprio plano estratégico.
                                </p>
                                <Link href="/upgrade">
                                    <Button className="bg-violet-600 hover:bg-violet-700">
                                        Explorar Templates →
                                    </Button>
                                </Link>
                            </div>
                        </article>

                        {/* Sidebar Direita - Related Articles + Share */}
                        <aside className="col-span-12 lg:col-span-3">
                            <div className="sticky top-24 space-y-6">
                                {/* Share */}
                                <ShareButtons url={currentUrl} title={post.title} />

                                {/* Related Articles */}
                                {post.category && (
                                    <RelatedArticles
                                        category={post.category}
                                        currentSlug={slug}
                                        allPosts={allPosts
                                            .filter(p => p.category) // Only posts with category
                                            .map(p => ({
                                                slug: p.slug,
                                                title: p.title,
                                                category: p.category!,
                                                readingTime: calculateReadingTime(p.content)
                                            }))
                                        }
                                    />
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    )
}
