import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus, MessageSquare } from "lucide-react"
import { createTable } from "@/actions/tables" // We'll need a client wrapper or form action
import { TEMPLATES } from "@/lib/ai/templates"

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Verify access
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single()

    if (!workspace) notFound()

    // Get Tables
    const { data: tables } = await supabase
        .from("tables")
        .select("*")
        .eq("workspace_id", id)
        .order("updated_at", { ascending: false })

    async function createNewTable(formData: FormData) {
        'use server'
        const templateId = formData.get("template") as string
        const title = TEMPLATES[templateId]?.name || "Nova Mesa"
        await createTable(id, templateId, title)
    }

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{workspace.name}</h1>
                    <p className="text-zinc-400">Workspace • {workspace.subscription_plan.toUpperCase()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content: Tables List */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Mesas Ativas</h2>
                    {tables && tables.length > 0 ? (
                        <div className="grid gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {tables.map((table: any) => (
                                <Link key={table.id} href={`/app/tables/${table.id}`}>
                                    <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-colors cursor-pointer">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-lg font-medium text-white">
                                                {table.title}
                                            </CardTitle>
                                            <MessageSquare className="h-4 w-4 text-zinc-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xs text-zinc-500">
                                                Template: {TEMPLATES[table.template_id]?.name || table.template_id}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500">Nenhuma mesa criada ainda.</p>
                    )}
                </div>

                {/* Sidebar: New Mesa Actions */}
                <div className="space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader><CardTitle className="text-sm">Iniciar Nova Mesa</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {Object.values(TEMPLATES).map((tmpl) => (
                                <form key={tmpl.id} action={createNewTable}>
                                    <input type="hidden" name="template" value={tmpl.id} />
                                    <Button variant="outline" className="w-full justify-start border-zinc-700 hover:bg-zinc-800">
                                        <Plus className="mr-2 h-4 w-4 text-violet-500" />
                                        {tmpl.name}
                                    </Button>
                                </form>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
