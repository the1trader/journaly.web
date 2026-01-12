'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PerformanceMetrics } from '@/components/dashboard/PerformanceMetrics'
import { PsychologyCard } from '@/components/dashboard/PsychologyCard'
import { PsychologyInsights } from '@/components/dashboard/PsychologyInsights'
import { calculatePMS, calculatePPI, getPsychologyStatus, TradePsychologyData } from '@/lib/psychology'
import { ICTDashboard } from '@/components/dashboard/ICTDashboard'
import { Trade } from '@/types/trade'

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rawTrades, error: fetchError } = await supabase
          .from('trades')
          .select('*')
          .order('entry_date', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setTrades(rawTrades || [])
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard data: {error}</p>
      </div>
    )
  }

  // Calculate Psychology Metrics
  const recentTrades = trades.slice(0, 10) as unknown as TradePsychologyData[]
  const pms = calculatePMS(recentTrades)
  const ppi = calculatePPI(recentTrades, 0)
  const status = getPsychologyStatus(pms, ppi)

  // Calculate psychology stats by state
  const statsByState: Record<string, { totalR: number, wins: number, count: number }> = {}
  trades.forEach(trade => {
    if (trade.psychology_state) {
      if (!statsByState[trade.psychology_state]) {
        statsByState[trade.psychology_state] = { totalR: 0, wins: 0, count: 0 }
      }
      statsByState[trade.psychology_state].totalR += Number(trade.result_rr || 0)
      if (Number(trade.result_rr) > 0) statsByState[trade.psychology_state].wins += 1
      statsByState[trade.psychology_state].count += 1
    }
  })

  const insightRows = Object.entries(statsByState).map(([state, stats]) => ({
    state: state as any,
    avgR: stats.count > 0 ? stats.totalR / stats.count : 0,
    winRate: stats.count > 0 ? stats.wins / stats.count : 0,
    count: stats.count
  })).sort((a, b) => b.avgR - a.avgR)

  // Check if we have ICT trades
  const hasICTTrades = trades.some(t => t.template_type === 'ICT')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your performance and psychological metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PsychologyCard pms={pms} ppi={ppi} status={status} />
        <div className="md:col-span-2 space-y-8">
          {/* Generic Account Performance (All Trades) */}
          {trades.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-dashed border-slate-300 text-center">
              <p className="text-slate-500">Log some trades to see your performance metrics.</p>
            </div>
          ) : (
            <>
              <PerformanceMetrics trades={trades as any} />

              {/* ICT Specific Dashboard (Conditional) */}
              {hasICTTrades && (
                <div className="pt-8 border-t">
                  <ICTDashboard trades={trades} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PsychologyInsights data={insightRows} />
    </div>
  )
}
