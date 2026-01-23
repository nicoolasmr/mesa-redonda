"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BlogSidebar } from "@/components/blog-sidebar"
import type { Post } from "@/lib/blog"

export function BlogList({ initialPosts }: { initialPosts: Post[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all")

    const filteredPosts = useMemo(() => {
        if (selectedCategory === "all") return initialPosts
        return initialPosts.filter(post => post.category === selectedCategory)
    }, [initialPosts, selectedCategory])

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <BlogSidebar
                selectedCategory={selectedCategory as any}
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
                                <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-all h-full hover:shadow-lg hover:shadow-violet-500/10 group">
                                    <div className="h-2 w-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 group-hover:from-violet-600 group-hover:to-indigo-600 transition-colors" />
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] uppercase tracking-widest text-violet-400 font-bold border border-violet-900/50 px-2 py-1 rounded bg-violet-900/10">
                                                {post.category || "Geral"}
                                            </span>
                                            <span className="text-xs text-zinc-500">{post.date}</span>
                                        </div>
                                        <CardTitle className="text-white text-xl mb-2 group-hover:text-violet-300 transition-colors">
                                            {post.title}
                                        </CardTitle>
                                        {post.excerpt && (
                                            <p className="text-zinc-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
