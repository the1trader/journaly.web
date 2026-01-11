'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      }
      window.location.reload()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Join Journaly'}
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          {mode === 'login' ? 'Sign in to access your journal' : 'Start your disciplined trading journey'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-950 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-slate-200"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm font-bold text-slate-500 hover:text-slate-950 transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
