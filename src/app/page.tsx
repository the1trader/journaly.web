'use client'

import { useEffect, useState } from 'react'
import { TradeEntryForm } from "@/components/journal/TradeEntryForm"
import { TradeList } from "@/components/journal/TradeList"
import { AuthForm } from "@/components/auth/AuthForm"
import { authService } from "@/services/auth"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Settings, LogOut, TrendingUp } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (e) {
        console.error("Auth check failed", e)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      return () => subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 font-black text-2xl animate-pulse tracking-tighter uppercase">Initializing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 text-white p-2 rounded-lg font-black text-xl leading-none">J</div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">JOURNALY</h1>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b-2 border-slate-950 pb-1">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/settings" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-950 transition-colors pb-1">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            {user && supabase && (
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="flex items-center gap-2 text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
              >
                <LogOut className="h-3 w-3" />
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
                <TradeEntryForm onComplete={() => typeof window !== 'undefined' && window.location.reload()} />
              </div>
              
              {/* Right Column: Recent Activity */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <TrendingUp className="absolute right-[-10px] bottom-[-10px] h-32 w-32 text-white/5" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Account Equity</h3>
                  <div className="text-4xl font-black">$24,500.00</div>
                  <div className="text-[10px] font-bold text-green-400 uppercase mt-2 flex items-center gap-1">
                    <span className="bg-green-400/20 px-1.5 py-0.5 rounded">▲ 1.2%</span>
                    <span>this week</span>
                  </div>
                </div>
                
                <TradeList userId={user.id} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2026 JOURNALY SYSTEMS</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Architecture v2.0-SUPABASE</p>
        </div>
      </footer>
    </div>
  )
}
