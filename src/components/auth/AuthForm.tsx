'use client'

import { useState } from 'react'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' | 'forgot-password' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (currentMode === 'login') {
        const { error } = await authService.signIn(email, password)
        if (error) throw error
        router.push('/')
        router.refresh()
      } else if (currentMode === 'signup') {
        const { error } = await authService.signUp(email, password)
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else if (currentMode === 'forgot-password') {
        const { error } = await authService.resetPassword(email)
        if (error) throw error
        setMessage('Password reset link sent to your email!')
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    } finally {
      if (currentMode !== 'login') setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0e14] text-white">
      <Card className="w-full max-w-md rounded-[2.5rem] border-none bg-[#0f1720] shadow-2xl p-6">
        <CardHeader className="text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
               <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logo-grad)" />
                  <text x="50%" y="65%" textAnchor="middle" fill="white" fontSize="45" fontWeight="900" fontFamily="Arial">J</text>
               </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Journaly</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">From Clicks to Clarity</p>
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-white mt-4">
            {currentMode === 'login' ? 'Sign in to your account' : 
             currentMode === 'signup' ? 'Create your account' : 
             'Reset your password'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-[#161f2a] border-slate-800 text-white rounded-xl font-medium px-6 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all placeholder:text-slate-600"
                required 
              />
            </div>
            
            {currentMode !== 'forgot-password' && (
              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-[#161f2a] border-slate-800 text-white rounded-xl font-medium px-6 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>
            )}

            {currentMode === 'login' && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-slate-700 data-[state=checked]:bg-teal-600" />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-400 cursor-pointer">Remember Me</label>
                </div>
                <button 
                  type="button"
                  onClick={() => setCurrentMode('forgot-password')}
                  className="text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-500/20 animate-in fade-in slide-in-from-top-1 text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-teal-500/10 text-teal-500 p-4 rounded-xl text-sm font-bold border border-teal-500/20 animate-in fade-in slide-in-from-top-1 text-center">
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-4">
            <Button type="submit" className="w-full h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black text-lg shadow-xl shadow-teal-950/20 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? 'PROCESSING...' : 
               currentMode === 'login' ? 'Sign in' : 
               currentMode === 'signup' ? 'Sign up' : 
               'Send Reset Link'}
            </Button>
            
            <div className="text-[11px] font-bold uppercase tracking-widest text-center">
              {currentMode === 'login' ? (
                <div className="text-slate-500">
                  Ready to trade?{' '}
                  <button 
                    type="button"
                    onClick={() => setCurrentMode('signup')}
                    className="text-teal-500 hover:text-teal-400 transition-colors ml-1"
                  >
                    Create your account
                  </button>
                </div>
              ) : (
                <div className="text-slate-500">
                  Already registered?{' '}
                  <button 
                    type="button"
                    onClick={() => setCurrentMode('login')}
                    className="text-teal-500 hover:text-teal-400 transition-colors ml-1"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
