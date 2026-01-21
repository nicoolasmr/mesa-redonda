import { getWorkspaces } from "@/actions/workspaces"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
    const workspaces = await getWorkspaces()

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Meus Workspaces</h1>
                <Button className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="mr-2 h-4 w-4" /> Novo Workspace
                </Button>
            </header>

            {workspaces.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6 text-center py-12">
                        <p className="text-zinc-500 mb-4">Você ainda não tem nenhum workspace.</p>
                        <Button className="bg-violet-600 hover:bg-violet-700">Criar Primeiro Workspace</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((ws: any) => (
                        <Link key={ws.id} href={`/app/workspaces/${ws.id}`}>
                            <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-colors cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-white">{ws.name}</CardTitle>
                                    <CardDescription>{ws.subscription_plan.toUpperCase()}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
