import fs from "fs"
import path from "path"

type Post = {
    slug: string
    title: string
    date: string
    content: string
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

        return {
            slug,
            title: titleMatch ? titleMatch[1] : slug,
            date: dateMatch ? dateMatch[1] : "",
            content: fileContents.replace(/---[\s\S]*?---/, "").trim(), // Strip frontmatter
        }
    })

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): Post | undefined {
    const posts = getPosts()
    return posts.find((post) => post.slug === slug)
}
