import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import { TEMPLATES } from "@/lib/ai/templates"

export default async function TablePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: table } = await supabase
        .from("tables")
        .select("*")
        .eq("id", id)
        .single()

    if (!table) notFound()

    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("table_id", id)
        .order("created_at", { ascending: true })

    const { data: artifacts } = await supabase
        .from("artifacts")
        .select("*")
        .eq("table_id", id)
        .order("version", { ascending: false })

    const template = TEMPLATES[table.template_id]

    return (
        <div className="h-full flex flex-col">
            <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-950">
                <div>
                    <h1 className="font-bold text-white">{table.title}</h1>
                    <span className="text-xs text-zinc-500">{template?.name || "Custom Table"}</span>
                </div>
                <div>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">Status: {table.status}</span>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <ChatInterface
                    tableId={id}
                    initialMessages={messages || []}
                    template={template}
                    artifacts={artifacts || []}
                />
            </div>
        </div>
    )
}
