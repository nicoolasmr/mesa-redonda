import fs from "fs"
import path from "path"

export type BlogCategory =
    | "produto-estrategia"
    | "marketing-growth"
    | "vendas-revenue"
    | "carreira-lideranca"
    | "produtividade-execucao"

export type Post = {
    slug: string
    title: string
    date: string
    content: string
    category?: BlogCategory
    excerpt?: string
}

const postsDirectory = path.join(process.cwd(), "content/blog")

export function getPosts(): Post[] {
    if (!fs.existsSync(postsDirectory)) return []

    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, "")
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")

        // Simple frontmatter parsing (Manual regex to avoid dependencies)
        const titleMatch = fileContents.match(/title:\s*"(.*?)"/)
        const dateMatch = fileContents.match(/date:\s*"(.*?)"/)
        const categoryMatch = fileContents.match(/category:\s*"(.*?)"/)
        const excerptMatch = fileContents.match(/excerpt:\s*"(.*?)"/)

        return {
            slug,
            title: titleMatch ? titleMatch[1] : slug,
            date: dateMatch ? dateMatch[1] : "",
            category: categoryMatch ? categoryMatch[1] as BlogCategory : undefined,
            excerpt: excerptMatch ? excerptMatch[1] : undefined,
            content: fileContents.replace(/---[\s\S]*?---/, "").trim(), // Strip frontmatter
        }
    })

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): Post | undefined {
    const posts = getPosts()
    return posts.find((post) => post.slug === slug)
}
