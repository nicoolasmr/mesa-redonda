import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ArtifactPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: artifact } = await supabase
        .from("artifacts")
        .select("*")
        .eq("id", id)
        .single()

    if (!artifact) notFound()

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-8 flex justify-center">
            <Card className="w-full max-w-4xl bg-white dark:bg-zinc-900 shadow-xl print:shadow-none min-h-[29.7cm]">
                <CardHeader className="border-b dark:border-zinc-800 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2">{artifact.type.toUpperCase()}</Badge>
                            <CardTitle className="text-3xl font-bold">{artifact.title}</CardTitle>
                        </div>
                        <div className="text-right text-sm text-zinc-500">
                            <p>Versão {artifact.version}</p>
                            <p>{new Date(artifact.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border dark:border-zinc-800">
                        {JSON.stringify(artifact.content_json, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
