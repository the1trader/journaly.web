'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

interface Trade {
  id: string
  pnl: number
  result_rr: number
  pair: string
  session: string
  balance_after: number
  entry_date: string
}

export function PerformanceMetrics({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) return null

  // Calculations
  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const winRate = (winningTrades / totalTrades) * 100
  const totalRR = trades.reduce((sum, t) => sum + t.result_rr, 0)
  const avgRR = totalRR / totalTrades
  
  // Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
  const winningRR = trades.filter(t => t.result_rr > 0)
  const losingRR = trades.filter(t => t.result_rr <= 0)
  const avgWinRR = winningRR.length > 0 ? winningRR.reduce((sum, t) => sum + t.result_rr, 0) / winningRR.length : 0
  const avgLossRR = losingRR.length > 0 ? Math.abs(losingRR.reduce((sum, t) => sum + t.result_rr, 0) / losingRR.length) : 0
  const expectancy = (winRate / 100 * avgWinRR) - ((1 - winRate / 100) * avgLossRR)

  // Equity Curve Data
  const equityData = [...trades]
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map((t, i) => ({
      name: `Trade ${i + 1}`,
      balance: t.balance_after
    }))

  // Performance by Session
  const sessionData = ['Asia', 'London', 'New York', 'Custom'].map(s => {
    const sessionTrades = trades.filter(t => t.session === s)
    return {
      name: s,
      pnl: sessionTrades.reduce((sum, t) => sum + t.pnl, 0),
      count: sessionTrades.length
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg RR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRR.toFixed(2)} R</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expectancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expectancy.toFixed(2)} R</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trades.reduce((sum, t) => sum + t.pnl, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by Session</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl">
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
