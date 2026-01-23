"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DashboardPack } from "@/lib/analyzer/schemas";

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];

export function DashboardRenderer({ data }: { data: DashboardPack }) {
    if (!data) return null;

    return (
        <div className="space-y-8 pb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.cards?.map((card, i) => (
                    <Card key={i} className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{card.value}</div>
                            {card.delta && (
                                <div className={`text-xs mt-1 ${card.delta.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                    {card.delta}
                                </div>
                            )}
                            {card.note && <p className="text-[10px] text-zinc-600 mt-2 italic">{card.note}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {data.charts?.map((chart, i) => (
                    <Card key={i} className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">{chart.title}</CardTitle>
                            {chart.note && <CardDescription className="text-zinc-500 text-xs">{chart.note}</CardDescription>}
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {chart.type === 'bar' ? (
                                    <BarChart data={chart.data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey={chart.xKey || ""} stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        {chart.series?.map((s, idx) => (
                                            <Bar key={s} dataKey={s} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                                        ))}
                                    </BarChart>
                                ) : chart.type === 'line' ? (
                                    <LineChart data={chart.data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey={chart.xKey || ""} stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        {chart.series?.map((s, idx) => (
                                            <Line key={s} type="monotone" dataKey={s} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                                        ))}
                                    </LineChart>
                                ) : chart.type === 'pie' ? (
                                    <PieChart>
                                        <Pie
                                            data={chart.data}
                                            dataKey={chart.yKey || "value"}
                                            nameKey={chart.xKey || "name"}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {chart.data.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-500 italic">
                                        Formato de gráfico não suportado nesta versão.
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tables */}
            {data.tables?.map((table, i) => (
                <Card key={i} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">{table.title}</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-zinc-400">
                            <thead className="text-xs uppercase bg-zinc-950 text-zinc-500 border-y border-zinc-800">
                                <tr>
                                    {table.columns.map((col, idx) => (
                                        <th key={idx} className="px-6 py-4 font-bold">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {table.rows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-6 py-4">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ))}
        </div>
    );
}
