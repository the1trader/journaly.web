'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { imageService } from '../../services/imageService'
import { authService } from '../../services/auth'
import { PlusCircle, Image as ImageIcon, X, Trash2, CheckCircle2 } from "lucide-react"

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
        images: imageUrls,
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
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl text-white">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Archive Trade</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Execution Integrity v2</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Instrument</label>
            <input 
              value={pair}
              onChange={e => setPair(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-200"
              placeholder="BTCUSD"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Risk %</label>
            <div className="relative">
              <input 
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={e => setRiskPercent(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-200">%</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Result RR</label>
            <div className="relative">
              <input 
                type="number"
                step="0.1"
                value={resultRR}
                onChange={e => setResultRR(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-200"
                placeholder="0.0"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-200">R</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <ImageIcon className="h-3 w-3" />
            Charts & Documentation
          </label>
          <div className="relative group">
            <textarea 
              onPaste={handlePaste}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste your charts directly here (CMD+V)..."
              className="w-full h-48 p-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-200 resize-none"
            />
            
            <div className="mt-6 flex flex-wrap gap-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group/img animate-in fade-in zoom-in duration-300">
                  <img 
                    src={url} 
                    alt="Uploaded chart" 
                    className="h-24 w-40 object-cover rounded-2xl border-2 border-slate-100 shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      await imageService.deleteImage(url);
                      setImageUrls(prev => prev.filter((_, index) => index !== i));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {loading && (
                <div className="h-24 w-40 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-pulse">
                  <ImageIcon className="h-6 w-6 text-slate-200 mb-1" />
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Uploading</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 flex justify-end items-center gap-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-auto ml-4">
          {loading ? 'Processing transaction...' : 'Ready for archival'}
        </p>
        <button 
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-black transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-slate-200 hover:shadow-slate-300"
        >
          {loading ? (
            'Archiving...'
          ) : (
            <>
              Archive Trade
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
