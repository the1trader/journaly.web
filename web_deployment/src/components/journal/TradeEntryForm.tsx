'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { imageService } from '../../services/imageService'
import { authService } from '../../services/auth'

/**
 * TradeEntryForm - Storage and Auth Agnostic (Rule 1)
 */
export function TradeEntryForm({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pair, setPair] = useState('')
  const [resultRR, setResultRR] = useState('')
  const [riskPercent, setRiskPercent] = useState('1.0')
  const [notes, setNotes] = useState('')
  
  const router = useRouter()

  const handlePaste = async (e: React.ClipboardEvent) => {
    await imageService.handlePaste(e, async (file) => {
      try {
        setLoading(true)
        const user = await authService.getCurrentUser()
        if (!user) {
          alert('Please login to upload images')
          return
        }

        const url = await imageService.uploadImage(file, user.id)
        setImageUrls(prev => [...prev, url])
      } catch (error) {
        alert('Failed to upload image')
      } finally {
        setLoading(false)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await authService.getCurrentUser()
      if (!user) {
        alert('Please login')
        return
      }

      const tradeData = {
        user_id: user.id,
        account_id: 'default-account',
        pair,
        result_rr: parseFloat(resultRR),
        risk_percent: parseFloat(riskPercent),
        notes,
        images: imageUrls, // Array of strings (Rule 3)
        entry_date: new Date().toISOString().split('T')[0],
        entry_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      }

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save trade')
      }

      if (onComplete) onComplete()
      else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900">NEW TRADE ENTRY</h1>
        <p className="text-slate-500">Document your execution with storage-portable architecture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase">Pair</label>
          <input 
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. BTCUSD"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase">Risk %</label>
          <input 
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={e => setRiskPercent(e.target.value)}
            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase">Result RR</label>
          <input 
            type="number"
            step="0.1"
            value={resultRR}
            onChange={e => setResultRR(e.target.value)}
            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500"
            placeholder="2.5"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase">Documentation & Charts</label>
        <div className="relative">
          <textarea 
            onPaste={handlePaste}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Paste your charts here or write notes..."
            className="w-full h-48 p-4 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-4 flex flex-wrap gap-4">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img 
                  src={url} 
                  alt="Uploaded chart" 
                  className="h-24 w-40 object-cover rounded-lg border border-slate-200"
                />
                <button 
                  type="button"
                  onClick={async () => {
                    await imageService.deleteImage(url);
                    setImageUrls(prev => prev.filter((_, index) => index !== i));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            {loading && (
              <div className="h-24 w-40 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                <span className="text-xs font-bold text-slate-400">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-black transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Save Trade Entry'}
        </button>
      </div>
    </form>
  )
}
