'use client'

import { useEffect, useState } from 'react'
import { TradeEntryForm } from "@/components/journal/TradeEntryForm"
import { TradeList } from "@/components/journal/TradeList"
import { AuthForm } from "@/components/auth/AuthForm"
import { authService } from "@/services/auth"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 font-black text-2xl animate-pulse tracking-tighter uppercase">Initializing Journaly...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header / Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 text-white p-2 rounded-lg font-black text-xl leading-none shadow-lg shadow-slate-200">J</div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">JOURNALY</h1>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-slate-900 border-b-2 border-slate-950 pb-1">Dashboard</Link>
            <Link href="/settings" className="text-sm font-bold text-slate-400 hover:text-slate-950 transition-colors pb-1">Settings</Link>
            {user && (
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!user ? (
            <div className="py-12">
              <AuthForm />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Form */}
              <div className="lg:col-span-8">
                <TradeEntryForm onComplete={() => window.location.reload()} />
              </div>
              
              {/* Right Column: Recent Activity */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Account Equity</h3>
                  <div className="text-3xl font-black">$24,500.00</div>
                  <div className="text-[10px] font-bold text-green-400 uppercase mt-2">▲ 1.2% this week</div>
                </div>
                
                <TradeList userId={user.id} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2026 JOURNALY SYSTEMS</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Architecture v2.0-SUPABASE</p>
        </div>
      </footer>
    </div>
  )
}
