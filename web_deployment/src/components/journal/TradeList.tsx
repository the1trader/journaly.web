'use client'

import { useEffect, useState } from 'react'

export function TradeList({ userId }: { userId: string }) {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrades() {
      try {
        const response = await fetch(`/api/trades?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setTrades(data)
        }
      } catch (error) {
        console.error('Failed to fetch trades:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrades()
  }, [userId])

  if (loading) return <div className="text-slate-400 font-bold animate-pulse">Loading trades...</div>

  if (trades.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No trades archived yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Recent Executions</h3>
      <div className="grid gap-4">
        {trades.map((trade) => (
          <div key={trade.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-900">{trade.pair}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${trade.direction === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {trade.direction}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                {new Date(trade.entry_date).toLocaleDateString()} • {trade.entry_time}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-black ${trade.result_rr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trade.result_rr > 0 ? '+' : ''}{trade.result_rr} R
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Result</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
