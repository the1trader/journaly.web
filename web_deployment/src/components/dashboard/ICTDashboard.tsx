
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trade } from '@/types/trade'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, Activity, Zap, Target } from 'lucide-react'

interface ICTDashboardProps {
    trades: Trade[]
}

export function ICTDashboard({ trades }: ICTDashboardProps) {
    // Filter only ICT trades (double check)
    const ictTrades = trades.filter(t => t.template_type === 'ICT')

    if (ictTrades.length === 0) return null

    // --- 1. Alignment Distribution ---
    const tierCounts = { High: 0, Average: 0, Low: 0 }
    ictTrades.forEach(t => {
        const tier = t.strategy_data?.alignment_tier || 'Low' // Default to Low if missing
        if (tierCounts[tier as keyof typeof tierCounts] !== undefined) {
            tierCounts[tier as keyof typeof tierCounts]++
        }
    })

    const alignmentData = [
        { name: 'High Quality', value: tierCounts.High, color: '#10b981' }, // Green
        { name: 'Average', value: tierCounts.Average, color: '#f59e0b' },      // Orange
        { name: 'Low Quality', value: tierCounts.Low, color: '#ef4444' },     // Red
    ].filter(d => d.value > 0)

    // --- 2. Alignment vs Performance ---
    const performanceByTier = ['High', 'Average', 'Low'].map(tier => {
        const subset = ictTrades.filter(t => t.strategy_data?.alignment_tier === tier)
        const count = subset.length
        if (count === 0) return null

        const wins = subset.filter(t => t.pnl > 0).length
        const winRate = (wins / count) * 100
        const totalRR = subset.reduce((sum, t) => sum + t.result_rr, 0)
        const avgRR = totalRR / count
        const netR = totalRR

        return { tier, count, winRate, avgRR, netR }
    }).filter(Boolean) as any[]

    // --- 3. Bias Consistency (Simplified) ---
    // Count how many times bias flipped from previous trade (sorted by date)
    // This is tricky without strict daily buckets, so we'll just show current bias distribution for now
    // Or "flips" implies we track sequence.
    const sortedTrades = [...ictTrades].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    let weeklyFlips = 0
    let dailyFlips = 0
    for (let i = 1; i < sortedTrades.length; i++) {
        if (sortedTrades[i].strategy_data?.weeklyBias !== sortedTrades[i - 1].strategy_data?.weeklyBias) weeklyFlips++
        if (sortedTrades[i].strategy_data?.dailyBias !== sortedTrades[i - 1].strategy_data?.dailyBias) dailyFlips++
    }

    // --- 4. Session Performance ---
    const sessions = ['Asian', 'London', 'NY']
    const sessionData = sessions.map(s => {
        // Note: stored as 'Asian', 'London', 'NY' in current form
        const subset = ictTrades.filter(t => t.strategy_data?.tradeSession === s)
        const netR = subset.reduce((sum, t) => sum + t.result_rr, 0)
        return { name: s, netR, count: subset.length }
    })

    // --- 5. Liquidity & POI Reality Check ---
    const liqTypes = ['Swing H/L', 'Internal H/L', 'Continuation FVG', 'No Liq']
    const liqPerformance = liqTypes.map(l => {
        const subset = ictTrades.filter(t => t.strategy_data?.liqType === l)
        const netR = subset.reduce((sum, t) => sum + t.result_rr, 0)
        return { name: l, netR, count: subset.length }
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">ICT Model Analytics</h2>
                    <p className="text-slate-500">Performance broken down by your alignment to the system.</p>
                </div>
                <div className="flex gap-4">
                    {/* Summary Stats Headers */}
                    <div className="bg-white p-3 rounded-lg border shadow-sm text-center min-w-[100px]">
                        <div className="text-xs text-slate-500">ICT Trades</div>
                        <div className="text-xl font-bold">{ictTrades.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm text-center min-w-[100px]">
                        <div className="text-xs text-slate-500">Model Net R</div>
                        <div className={`text-xl font-bold ${ictTrades.reduce((s, t) => s + t.result_rr, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ictTrades.reduce((s, t) => s + t.result_rr, 0).toFixed(1)}R
                        </div>
                    </div>
                </div>
            </div>

            {/* A. Alignment Distribution & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Alignment Distribution</CardTitle>
                        <CardDescription>Are you following the plan?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={alignmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {alignmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Alignment vs Performance</CardTitle>
                        <CardDescription>Does following the rules pay off?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Custom Table Layout */}
                            <div className="grid grid-cols-5 text-sm font-medium text-slate-500 border-b pb-2">
                                <div>Tier</div>
                                <div className="text-right">Trades</div>
                                <div className="text-right">Win %</div>
                                <div className="text-right">Avg RR</div>
                                <div className="text-right">Net R</div>
                            </div>
                            {performanceByTier.map((row) => (
                                <div key={row.tier} className="grid grid-cols-5 items-center py-2 border-b last:border-0 hover:bg-slate-50">
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className={`w-3 h-3 rounded-full ${row.tier === 'High' ? 'bg-green-500' : row.tier === 'Average' ? 'bg-amber-400' : 'bg-red-500'}`} />
                                        {row.tier}
                                    </div>
                                    <div className="text-right text-slate-600">{row.count}</div>
                                    <div className="text-right text-slate-900 font-semibold">{row.winRate.toFixed(1)}%</div>
                                    <div className="text-right text-slate-600">{row.avgRR.toFixed(2)}</div>
                                    <div className={`text-right font-bold ${row.netR >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {row.netR > 0 ? '+' : ''}{row.netR.toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* B. Bias & Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="netR" radius={[4, 4, 0, 0]}>
                                    {sessionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.netR >= 0 ? '#3b82f6' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bias Consistency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <div className="text-sm text-slate-500 mb-1">Weekly Bias Flips</div>
                                <div className="text-3xl font-bold text-slate-800">{weeklyFlips}</div>
                                <div className="text-xs text-slate-400 mt-2">Frequency across all trades</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <div className="text-sm text-slate-500 mb-1">Daily Bias Flips</div>
                                <div className="text-3xl font-bold text-slate-800">{dailyFlips}</div>
                                <div className="text-xs text-slate-400 mt-2">Frequency across all trades</div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                            <h4 className="flex items-center gap-2 font-semibold text-blue-900 text-sm mb-2">
                                <Zap className="h-4 w-4" /> Insight
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Frequent bias flips (Daily {'>'} Weekly) often indicate over-trading or lack of conviction.
                                Stick to one bias per session for higher expectancy.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* C. Liquidity & Reality Check */}
            <Card>
                <CardHeader>
                    <CardTitle>Liquidity Type Performance</CardTitle>
                    <CardDescription>Which setups are paying the bills?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {liqPerformance.map(item => (
                            <div key={item.name} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{item.name} <span className="text-slate-400 font-normal">({item.count} trades)</span></span>
                                    <span className={item.netR >= 0 ? 'text-green-600' : 'text-red-500'}>
                                        {item.netR > 0 ? '+' : ''}{item.netR.toFixed(1)} R
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    {/* Normalize for visual bar: assume range -10 to +10 for visual scale or just width relative to max */}
                                    <div
                                        className={`h-full ${item.netR >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(Math.abs(item.netR) * 10, 100)}%` }} // Simple scaling for now
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
