'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PsychologyState } from '@/lib/psychology'

interface InsightRow {
    state: PsychologyState
    avgR: number
    winRate: number
    count: number
}

interface PsychologyInsightsProps {
    data: InsightRow[]
}

export function PsychologyInsights({ data }: PsychologyInsightsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">State-Based Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Psychology State</th>
                                <th className="px-4 py-3">Avg R</th>
                                <th className="px-4 py-3">Win Rate</th>
                                <th className="px-4 py-3">Trades</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                                        No data available yet.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => (
                                    <tr key={row.state} className="bg-white hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.state}</td>
                                        <td className={`px-4 py-3 ${row.avgR > 0 ? 'text-green-600' : row.avgR < 0 ? 'text-red-600' : ''}`}>
                                            {row.avgR.toFixed(2)}R
                                        </td>
                                        <td className="px-4 py-3">{(row.winRate * 100).toFixed(0)}%</td>
                                        <td className="px-4 py-3">{row.count}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
