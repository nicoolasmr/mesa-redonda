import { getPosts } from "@/lib/blog"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function BlogIndex() {
    const posts = getPosts()

    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-12 text-center">Blog Mesa Redonda</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                            <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-white">{post.title}</CardTitle>
                                    <CardDescription>{post.date}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
