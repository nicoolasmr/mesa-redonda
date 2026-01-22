import { getPosts } from "@/lib/blog"

export async function GET() {
    const posts = getPosts()
    return Response.json(posts)
}
