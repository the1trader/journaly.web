'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-slate-950 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-lg">J</div>
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase italic">Journaly</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
