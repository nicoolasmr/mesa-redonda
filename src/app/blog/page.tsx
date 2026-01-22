"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BlogSidebar } from "@/components/blog-sidebar"

type BlogCategory = "produto-estrategia" | "marketing-growth" | "vendas-revenue" | "carreira-lideranca" | "produtividade-execucao"

type Post = {
    slug: string
    title: string
    date: string
    category?: string
    excerpt?: string
}

export default function BlogIndex() {
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all")

    useEffect(() => {
        fetch('/api/blog/posts')
            .then(res => res.json())
            .then(data => setPosts(data))
    }, [])

    const filteredPosts = useMemo(() => {
        if (selectedCategory === "all") return posts
        return posts.filter(post => post.category === selectedCategory)
    }, [posts, selectedCategory])

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

                <div className="flex flex-col lg:flex-row gap-8">
                    <BlogSidebar
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />

                    <div className="flex-1">
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-500 text-lg">
                                    Nenhum artigo encontrado nesta categoria ainda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredPosts.map((post) => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                                        <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-all h-full hover:shadow-lg hover:shadow-violet-500/10">
                                            <CardHeader>
                                                <CardTitle className="text-white text-xl mb-2">
                                                    {post.title}
                                                </CardTitle>
                                                {post.excerpt && (
                                                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                <CardDescription className="text-zinc-500 text-xs">
                                                    {post.date}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
