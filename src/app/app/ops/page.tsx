import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default async function OpsDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. HARD ADMIN CHECK
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['nicoolasmoreira@gmail.com']
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        redirect('/')
    }

    // 2. FETCH DATA
    const { data: webhooks } = await supabase
        .from('stripe_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    const { data: usage } = await supabase
        .from('workspace_usage_monthly')
        .select('*, workspaces(name)')
        .order('updated_at', { ascending: false })
        .limit(10)

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-12">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="text-red-500" />
                    Ops Center <Badge variant="outline" className="text-red-500 border-red-900">ADMIN</Badge>
                </h1>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* STRIPE WEBHOOKS */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-widest text-zinc-400">Recent Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-500">Event</TableHead>
                                    <TableHead className="text-zinc-500">Status</TableHead>
                                    <TableHead className="text-zinc-500 text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {webhooks?.map(wh => (
                                    <TableRow key={wh.id} className="border-zinc-800">
                                        <TableCell className="font-mono text-xs">{wh.type}</TableCell>
                                        <TableCell>
                                            {wh.status === 'processed'
                                                ? <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</Badge>
                                                : <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{wh.status}</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-zinc-500">
                                            {new Date(wh.created_at).toLocaleTimeString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* USAGE MONITOR */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-widest text-zinc-400">Top Usage (This Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-500">Workspace</TableHead>
                                    <TableHead className="text-zinc-500">Month</TableHead>
                                    <TableHead className="text-zinc-500 text-right">Counters</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usage?.map(row => (
                                    <TableRow key={row.workspace_id} className="border-zinc-800">
                                        <TableCell className="font-medium text-sm text-zinc-300">{(row.workspaces as any)?.name || 'Unknown'}</TableCell>
                                        <TableCell className="text-xs text-zinc-500">{row.month_key}</TableCell>
                                        <TableCell className="text-right font-mono text-xs text-violet-300">
                                            {JSON.stringify(row.counters).substring(0, 30)}...
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
