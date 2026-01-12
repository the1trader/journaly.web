'use client'

import { useState } from 'react'
import { TradeEntryForm } from '@/components/journal/TradeEntryForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { TradeList } from '@/components/journal/TradeList'

export default function JournalPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground">Log and review your trades.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" /> Log Trade
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-none w-full md:w-[85vw] lg:w-[75vw] xl:w-[65vw] p-0 border-l shadow-2xl overflow-hidden flex flex-col">
            <SheetHeader className="p-6 md:px-10 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <SheetTitle className="text-2xl font-bold">Log New Trade</SheetTitle>
              <SheetDescription>
                Fill in the details of your trade according to your plan.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12 pb-24">
                <TradeEntryForm onComplete={() => setOpen(false)} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <TradeList />
    </div>
  )
}
