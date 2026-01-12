'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function TradeList() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('entry_time', { ascending: false })

    if (!error && data) {
      setTrades(data)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center">Loading trades...</div>

  if (trades.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg border border-dashed border-slate-300 text-center space-y-4">
        <p className="text-slate-500 text-lg">Your journal is empty.</p>
        <p className="text-slate-400">Consistent journaling is the path to profitability.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>RR</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id} className="cursor-pointer hover:bg-slate-50 relative group">
              <TableCell className="font-medium relative">
                <a href={`/trades/${trade.id}`} className="absolute inset-0 z-10" />
                {format(new Date(trade.entry_date), 'MMM dd, yyyy')}
                <div className="text-xs text-slate-500">{trade.entry_time}</div>
              </TableCell>
              <TableCell>{trade.pair}</TableCell>
              <TableCell>
                <Badge variant={trade.direction === 'Long' ? 'default' : 'destructive'}>
                  {trade.direction}
                </Badge>
              </TableCell>
              <TableCell>{trade.session}</TableCell>
              <TableCell className={trade.result_rr >= 0 ? 'text-green-600' : 'text-red-600'}>
                {trade.result_rr > 0 ? `+${trade.result_rr}` : trade.result_rr} R
              </TableCell>
              <TableCell className={trade.pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {trade.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
