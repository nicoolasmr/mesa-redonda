import { getPost } from "@/lib/blog"
import { notFound } from "next/navigation"

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = getPost(slug)

    if (!post) notFound()

    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-12">
            <article className="container mx-auto px-4 max-w-3xl prose prose-invert">
                <h1>{post.title}</h1>
                <p className="text-zinc-500">{post.date}</p>
                <div className="mt-8 whitespace-pre-wrap font-sans text-lg leading-relaxed text-zinc-300">
                    {post.content}
                </div>
            </article>
        </div>
    )
}
