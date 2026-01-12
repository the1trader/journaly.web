'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have the recovery token in the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the recovery tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    } else if (!accessToken) {
      // No recovery token, redirect to forgot password
      router.push('/forgot-password')
    }
  }, [searchParams, router, supabase])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
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
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-[#161f2a] border-slate-800 text-white rounded-xl font-medium px-6 pr-12 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 bg-[#161f2a] border-slate-800 text-white rounded-xl font-medium px-6 pr-12 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

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
              {loading ? 'UPDATING...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}