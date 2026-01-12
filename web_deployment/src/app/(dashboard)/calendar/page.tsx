import { NewsCalendar } from '@/components/calendar/NewsCalendar'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">News Calendar</h1>
        <p className="text-muted-foreground">Stay aware of upcoming high-impact economic events.</p>
      </div>

      <NewsCalendar />
    </div>
  )
}
