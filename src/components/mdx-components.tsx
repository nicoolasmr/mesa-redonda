import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'

export const mdxComponents: MDXComponents = {
    // Headers
    h1: ({ children }) => (
        <h1 className="text-4xl font-bold mb-6 text-white mt-8 first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-3xl font-bold mb-4 mt-12 text-white scroll-mt-24" id={String(children).toLowerCase().replace(/\s+/g, '-')}>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-2xl font-bold mb-3 mt-8 text-white scroll-mt-24" id={String(children).toLowerCase().replace(/\s+/g, '-')}>
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-xl font-bold mb-2 mt-6 text-zinc-200">
            {children}
        </h4>
    ),

    // Paragraphs
    p: ({ children }) => (
        <p className="text-zinc-300 mb-4 leading-relaxed text-lg">
            {children}
        </p>
    ),

    // Lists
    ul: ({ children }) => (
        <ul className="list-disc list-outside ml-6 mb-4 text-zinc-300 space-y-2">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-outside ml-6 mb-4 text-zinc-300 space-y-2">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="text-zinc-300 leading-relaxed">
            {children}
        </li>
    ),

    // Checkboxes (GFM task lists) - render as styled checkboxes
    input: (props) => {
        if (props.type === 'checkbox') {
            return (
                <input
                    type="checkbox"
                    checked={props.checked}
                    disabled
                    className="mr-2 accent-violet-600 cursor-default"
                />
            )
        }
        return <input {...props} />
    },

    // Code blocks
    code: ({ children, className }) => {
        const isInline = !className
        if (isInline) {
            return (
                <code className="bg-zinc-800 text-violet-400 px-2 py-0.5 rounded text-sm font-mono">
                    {children}
                </code>
            )
        }
        return (
            <code className={`block bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm font-mono text-zinc-300 my-4 ${className || ''}`}>
                {children}
            </code>
        )
    },
    pre: ({ children }) => (
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto my-6">
            {children}
        </pre>
    ),

    // Links
    a: ({ href, children }) => (
        <Link
            href={href || '#'}
            className="text-violet-400 hover:text-violet-300 underline decoration-violet-400/30 hover:decoration-violet-300/50 transition-colors"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
            {children}
        </Link>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-violet-500 pl-4 py-2 my-6 bg-violet-900/10 text-zinc-300 italic">
            {children}
        </blockquote>
    ),

    // Horizontal rule
    hr: () => (
        <hr className="border-zinc-800 my-8" />
    ),

    // Tables
    table: ({ children }) => (
        <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-zinc-800 rounded-lg overflow-hidden">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-zinc-900">
            {children}
        </thead>
    ),
    th: ({ children }) => (
        <th className="border border-zinc-800 px-4 py-3 text-left text-white font-semibold">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border border-zinc-800 px-4 py-3 text-zinc-300">
            {children}
        </td>
    ),

    // Strong/Bold
    strong: ({ children }) => (
        <strong className="font-bold text-white">
            {children}
        </strong>
    ),

    // Emphasis/Italic
    em: ({ children }) => (
        <em className="italic text-zinc-200">
            {children}
        </em>
    ),
}
