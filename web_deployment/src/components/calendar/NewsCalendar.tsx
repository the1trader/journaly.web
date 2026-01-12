'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import { Timer } from 'lucide-react'

interface NewsEvent {
  id: string
  title: string
  country: string
  impact: 'High' | 'Medium' | 'Low'
  time: string // ISO string
}

const MOCK_NEWS: NewsEvent[] = [
  {
    id: '1',
    title: 'Non-Farm Employment Change',
    country: 'USD',
    impact: 'High',
    time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
  },
  {
    id: '2',
    title: 'Unemployment Rate',
    country: 'USD',
    impact: 'High',
    time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    title: 'Average Hourly Earnings m/m',
    country: 'USD',
    impact: 'Medium',
    time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    title: 'CPI m/m',
    country: 'USD',
    impact: 'High',
    time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
  },
]

export function NewsCalendar() {
  const [events, setEvents] = useState<NewsEvent[]>([])
  const [nextEvent, setNextEvent] = useState<NewsEvent | null>(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    // In a real app, fetch from API here
    const highImpact = MOCK_NEWS.filter(e => e.impact === 'High')
    setEvents(highImpact)

    const futureEvents = highImpact.filter(e => new Date(e.time) > new Date())
    if (futureEvents.length > 0) {
      const next = futureEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0]
      setNextEvent(next)
    }
  }, [])

  useEffect(() => {
    if (!nextEvent) return

    const interval = setInterval(() => {
      setCountdown(formatDistanceToNow(new Date(nextEvent.time), { addSuffix: true }))
    }, 1000)

    return () => clearInterval(interval)
  }, [nextEvent])

  return (
    <div className="space-y-6">
      {nextEvent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" />
              Next High Impact News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{nextEvent.title}</div>
                <div className="text-slate-500">{nextEvent.country} - {format(new Date(nextEvent.time), 'PPP p')}</div>
              </div>
              <div className="text-xl font-mono font-bold text-blue-700">
                {countdown}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Economic Calendar (High Impact Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-bold w-12 text-center text-slate-600">{event.country}</div>
                  <div>
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-sm text-slate-500">{format(new Date(event.time), 'PPP p')}</div>
                  </div>
                </div>
                <Badge variant="destructive">High Impact</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
