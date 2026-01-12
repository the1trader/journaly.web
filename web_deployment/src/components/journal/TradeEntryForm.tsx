'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { calculatePMS, calculatePPI, getPsychologyStatus, PsychologyState, TradePsychologyData } from '@/lib/psychology'
import { calculateICTAlignmentScore } from '@/lib/ict-logic'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, LayoutGrid, Brain, PenTool, ClipboardCheck, CheckCircle2 } from 'lucide-react'
import { NotionBlockEditor, Block } from '@/components/ui/notion-editor'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface CustomField {
  id: string
  name: string
  type: string
  options: string[]
}

const PSYCHOLOGY_STATES: PsychologyState[] = ['FOMO', 'Fear', 'Neutral', 'Calm', 'Calm & Confident']

export function TradeEntryForm({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [account, setAccount] = useState<any>(null)
  const [recentTrades, setRecentTrades] = useState<TradePsychologyData[]>([])
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Template State
  const [template, setTemplate] = useState('MANUAL') // MANUAL | ICT

  // Form State
  const [pair, setPair] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [entryTime, setEntryTime] = useState('')
  const [session, setSession] = useState('New York')
  const [direction, setDirection] = useState('Long')
  const [resultRR, setResultRR] = useState('')
  const [riskPercent, setRiskPercent] = useState('')

  // Psychology State
  const [psychologyState, setPsychologyState] = useState<PsychologyState>('Neutral')
  const [confidenceScore, setConfidenceScore] = useState<number>(3)

  // ICT Specific State
  const [ictValues, setIctValues] = useState({
    weeklyBias: 'LONG',
    dailyBias: 'LONG',
    tradeSession: 'NY',
    tradePOI: '1h',
    htfPOI: 'D-FVG',
    liqType: 'Internal H/L',
    smtConfirmation: 'No'
  })

  // Custom values state - ensure it's always an object
  const [customValues, setCustomValues] = useState<Record<string, any>>({})

  // Content (Rich Blocks)
  const [contentBefore, setContentBefore] = useState<Block[]>([])
  const [contentAfter, setContentAfter] = useState<Block[]>([])

  // Reflections
  const [isFollowingPlan, setIsFollowingPlan] = useState<boolean | null>(null)
  const [willRepeatTrade, setWillRepeatTrade] = useState<string>('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsInitialized(true)
          return
        }

        const [accResult, fieldsResult, tradesResult] = await Promise.all([
          supabase.from('accounts').select('*').eq('user_id', user.id).single(),
          supabase.from('custom_field_definitions').select('*').order('sort_order'),
          supabase
            .from('trades')
            .select('psychology_state, confidence_score, result_rr')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false })
            .limit(10)
        ])

        if (accResult.data) {
          setAccount(accResult.data)
          if (accResult.data.default_risk_percent) {
            setRiskPercent(accResult.data.default_risk_percent.toString())
          }
        }

        if (fieldsResult.data) {
          setCustomFields(fieldsResult.data)
        }

        if (tradesResult.data) {
          setRecentTrades(tradesResult.data as TradePsychologyData[])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsInitialized(true)
      }
    }
    fetchData()
  }, [])

  const handleIctChange = (key: string, value: string) => {
    setIctValues(prev => ({ ...prev, [key]: value }))
  }

  const checkSafety = () => {
    if (!isInitialized || recentTrades.length === 0) {
      return true // Allow submission if data not yet loaded
    }

    const pms = calculatePMS(recentTrades)
    const ppi = calculatePPI(recentTrades, 0)
    const status = getPsychologyStatus(pms, ppi)

    if (status === 'Stand Down') {
      setIsWarningOpen(true)
      return false
    }
    return true
  }

  const onPreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (checkSafety()) {
      executeSubmit()
    }
  }

  const executeSubmit = async () => {
    setLoading(true)
    setIsWarningOpen(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !account) return

    const rr = parseFloat(resultRR)
    const riskPct = parseFloat(riskPercent)
    const riskAmount = (account.size * riskPct) / 100
    const pnl = riskAmount * rr
    const balanceAfter = account.size + pnl

    let strategyData: any = {}
    if (template === 'ICT') {
      const { score, tier } = calculateICTAlignmentScore(ictValues, direction)
      strategyData = {
        ...ictValues,
        alignment_score: score,
        alignment_tier: tier
      }
    }

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        account_id: account.id,
        pair,
        entry_date: entryDate,
        entry_time: entryTime,
        session,
        direction,
        result_rr: rr,
        risk_percent: riskPct,
        risk_amount: riskAmount,
        pnl,
        balance_after: balanceAfter,
        notes_before: contentBefore.map(b => b.type === 'text' ? b.content : '[Image]').join('\n'),
        notes_after: contentAfter.map(b => b.type === 'text' ? b.content : '[Image]').join('\n'),
        psychology_state: psychologyState,
        confidence_score: confidenceScore,
        template_type: template,
        strategy_data: strategyData,
        is_following_plan: isFollowingPlan,
        will_repeat_trade: willRepeatTrade,
        content_before: contentBefore,
        content_after: contentAfter,
        screenshot_before_url: contentBefore.find(b => b.type === 'image')?.content,
        screenshot_after_url: contentAfter.find(b => b.type === 'image')?.content,
      })
      .select()
      .single()

    if (tradeError) {
      alert(tradeError.message)
      setLoading(false)
      return
    }

    const customValueEntries = Object.entries(customValues).map(([fieldId, value]) => ({
      trade_id: trade.id,
      field_definition_id: fieldId,
      value: value
    }))

    if (customValueEntries.length > 0) {
      await supabase.from('trade_custom_values').insert(customValueEntries)
    }

    await supabase.from('accounts').update({ size: balanceAfter }).eq('id', account.id)

    setLoading(false)
    if (onComplete) onComplete()
    else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleCustomValueChange = (id: string, value: any) => {
    setCustomValues(prev => ({ ...prev, [id]: value }))
  }

  const SectionHeader = ({ icon: Icon, title, bgColor = "bg-slate-900" }: { icon: any, title: string, bgColor?: string }) => (
    <div className={`flex items-center gap-4 border-b-2 border-slate-900 pb-5 mb-10`}>
      <div className={`${bgColor} p-2.5 rounded-xl shadow-lg shadow-slate-200`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-900">{title}</h2>
    </div>
  )

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-slate-500 text-sm">Loading trade form...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={onPreSubmit} className="space-y-24">
        
        {/* Section: Trade Identity */}
        <section className="space-y-10">
          <SectionHeader icon={LayoutGrid} title="Trade Identity" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <Label className="text-slate-500 font-bold uppercase text-xs tracking-widest">Instrument / Pair</Label>
              <Input
                value={pair}
                onChange={e => setPair(e.target.value)}
                placeholder="e.g. BTCUSD"
                className="text-xl h-auto py-2 font-bold border-none bg-slate-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-950 transition-all rounded-xl px-4"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-slate-500 font-bold uppercase text-xs tracking-widest">Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className={`text-xl h-auto py-2 font-bold border-none bg-slate-100 focus:bg-white transition-all rounded-xl px-4 ${direction === 'Long' ? 'text-green-600' : 'text-red-600'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-500 font-bold uppercase text-xs tracking-widest">Trade Result (RR)</Label>
              <Input
                type="number"
                step="0.1"
                value={resultRR}
                onChange={e => setResultRR(e.target.value)}
                placeholder="e.g. 2.5"
                className="text-xl h-auto py-2 font-bold border-none bg-slate-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-950 transition-all rounded-xl px-4"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="space-y-3">
              <Label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="border-none bg-white h-12 font-black rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual / Standard</SelectItem>
                  <SelectItem value="ICT">ICT Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Session</Label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger className="border-none bg-white h-12 font-black rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Entry Date</Label>
              <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="border-none bg-white h-12 font-black rounded-xl shadow-sm" required />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Entry Time</Label>
              <Input type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="border-none bg-white h-12 font-black rounded-xl shadow-sm" required />
            </div>
          </div>
        </section>

        {/* Section: Psychology & Risk */}
        <section className="space-y-10">
          <SectionHeader icon={Brain} title="Psychology & Risk" bgColor="bg-blue-600" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-5">
                <Label className="text-slate-900 font-black text-lg">Psychological State</Label>
                <div className="flex flex-wrap gap-3">
                  {PSYCHOLOGY_STATES.map(s => (
                    <Button
                      key={s}
                      type="button"
                      variant={psychologyState === s ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setPsychologyState(s)}
                      className={`rounded-2xl px-6 py-4 h-auto text-base font-black transition-all border-2 ${
                        psychologyState === s 
                          ? s === 'FOMO' || s === 'Fear' ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'bg-blue-600 border-blue-600'
                          : 'hover:bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-slate-900 font-black text-lg">Confidence Score</Label>
                <div className="flex gap-6 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <div className="flex-1 flex gap-2.5">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          type="button"
                          className={`flex-1 h-4 p-0 rounded-full transition-all border-none shadow-sm ${confidenceScore >= score ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                          onClick={() => setConfidenceScore(score)}
                        />
                      ))}
                   </div>
                   <span className="text-4xl font-black text-blue-600 w-16 text-center">{confidenceScore}</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Label className="text-slate-900 font-bold text-base">Risk Allocation (%)</Label>
              <div className="relative group">
                <Input
                  type="number"
                  step="0.01"
                  value={riskPercent}
                  onChange={e => setRiskPercent(e.target.value)}
                  className="text-3xl h-auto py-4 font-bold border-none bg-slate-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-100 pr-16 transition-all rounded-xl px-6"
                  required
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300 group-focus-within:text-blue-200">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Strategy & Plan */}
        <section className="space-y-10">
          <SectionHeader icon={ClipboardCheck} title="Strategy & Execution" bgColor="bg-purple-600" />

          {template === 'ICT' && (
            <div className="bg-slate-950 p-10 rounded-[2.5rem] space-y-12 border shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-2">Daily Bias x SMT</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={ictValues.dailyBias} onValueChange={v => handleIctChange('dailyBias', v)}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue placeholder="Daily Bias" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="LONG">LONG</SelectItem>
                        <SelectItem value="SHORT">SHORT</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={ictValues.smtConfirmation} onValueChange={v => handleIctChange('smtConfirmation', v)}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue placeholder="SMT" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="Yes">SMT: YES</SelectItem>
                        <SelectItem value="No">SMT: NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-2">Weekly Bias</Label>
                  <Select value={ictValues.weeklyBias} onValueChange={v => handleIctChange('weeklyBias', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="LONG">WEEKLY: LONG</SelectItem>
                      <SelectItem value="SHORT">WEEKLY: SHORT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-2">HTF POI</Label>
                  <Select value={ictValues.htfPOI} onValueChange={v => handleIctChange('htfPOI', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="D-FVG">D-FVG</SelectItem>
                      <SelectItem value="W-FVG">W-FVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-2">LTF POI</Label>
                  <Select value={ictValues.tradePOI} onValueChange={v => handleIctChange('tradePOI', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="4h">4H</SelectItem>
                      <SelectItem value="1h">1H</SelectItem>
                      <SelectItem value="15m">15m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-2">Liquidity Type</Label>
                  <Select value={ictValues.liqType} onValueChange={v => handleIctChange('liqType', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white font-black rounded-2xl h-14 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="Swing H/L">Swing H/L</SelectItem>
                      <SelectItem value="Internal H/L">Internal H/L</SelectItem>
                      <SelectItem value="Continuation FVG">Continuation FVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {customFields.map(field => (
              <div key={field.id} className="space-y-4">
                <Label className="text-slate-900 font-black text-lg">{field.name}</Label>
                {field.type === 'text' && (
                  <Input 
                    onChange={e => handleCustomValueChange(field.id, e.target.value)} 
                    className="border-none bg-slate-100 text-xl py-4 h-auto rounded-2xl px-6 focus-visible:bg-white transition-all"
                    placeholder={`...`}
                  />
                )}
                {field.type === 'numeric' && (
                  <Input 
                    type="number" 
                    onChange={e => handleCustomValueChange(field.id, parseFloat(e.target.value))} 
                    className="border-none bg-slate-100 text-xl py-4 h-auto w-full rounded-2xl px-6 focus-visible:bg-white transition-all"
                  />
                )}
                {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-4 bg-slate-100 p-6 rounded-2xl w-fit cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {
                    const el = document.getElementById(field.id) as HTMLInputElement;
                    if(el) el.click();
                  }}>
                    <Checkbox id={field.id} className="h-8 w-8 rounded-lg border-2" onCheckedChange={val => handleCustomValueChange(field.id, val)} />
                    <Label htmlFor={field.id} className="text-xl font-bold cursor-pointer">Yes / Confirmed</Label>
                  </div>
                )}
                {field.type === 'dropdown' && (
                  <Select onValueChange={val => handleCustomValueChange(field.id, val)}>
                    <SelectTrigger className="border-none bg-slate-100 text-xl py-4 h-auto w-full rounded-2xl px-6 focus:bg-white transition-all"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === 'rating' && (
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Button
                        key={star}
                        type="button"
                        variant={customValues[field.id] === star ? 'default' : 'outline'}
                        className={`flex-1 rounded-2xl py-8 font-black text-xl transition-all border-2 ${customValues[field.id] === star ? 'bg-slate-950 border-slate-950 scale-105' : 'hover:bg-slate-100 border-slate-200'}`}
                        onClick={() => handleCustomValueChange(field.id, star)}
                      >
                        {star}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Documentation (Notion Style) */}
        <section className="space-y-14">
          <SectionHeader icon={PenTool} title="Documentation" bgColor="bg-slate-950" />

          {/* Am I following the trade plan? - Right under header */}
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-slate-100/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isFollowingPlan === true ? 'bg-green-100' : isFollowingPlan === false ? 'bg-red-100' : 'bg-slate-200'} transition-colors`}>
                <CheckCircle2 className={`h-6 w-6 ${isFollowingPlan === true ? 'text-green-600' : isFollowingPlan === false ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
              <div className="space-y-1">
                <Label className="text-lg font-bold text-slate-950 tracking-tight">Trade plan followed?</Label>
                <p className="text-slate-500 text-sm font-medium">Did you execute according to your defined rules?</p>
              </div>
            </div>
            <ToggleGroup
              type="single"
              value={isFollowingPlan === null ? undefined : isFollowingPlan.toString()}
              onValueChange={(v) => setIsFollowingPlan(v === 'true' ? true : v === 'false' ? false : null)}
              className="bg-white p-1.5 rounded-xl shadow-inner border border-slate-200"
            >
              <ToggleGroupItem
                value="true"
                className="rounded-lg px-8 py-3 h-auto font-bold text-base data-[state=on]:bg-green-600 data-[state=on]:text-white transition-all uppercase tracking-wide"
              >
                YES
              </ToggleGroupItem>
              <ToggleGroupItem
                value="false"
                className="rounded-lg px-8 py-3 h-auto font-bold text-base data-[state=on]:bg-red-600 data-[state=on]:text-white transition-all uppercase tracking-wide"
              >
                NO
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-24 mt-10">
            <div className="space-y-8">
              <h3 className="text-3xl font-black tracking-tight border-l-8 border-blue-600 pl-6 h-fit leading-none">
                01. PREPARATION & ANALYSIS
              </h3>
              <NotionBlockEditor
                onChange={setContentBefore}
                placeholder="What did you see before the entry? Paste your charts here..."
              />
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-16">
              <div className="space-y-10">
                <h3 className="text-3xl font-black tracking-tight border-l-8 border-blue-600 pl-6 h-fit leading-none">
                  02. REVIEW & REFLECTION
                </h3>
                
                {/* Will Repeat Toggle - High Visibility */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <Label className="text-blue-600 font-bold uppercase text-xs tracking-wide">Integrity Check</Label>
                    <p className="text-base font-bold text-slate-900 leading-tight">Will you repeat this exact execution in the future?</p>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={willRepeatTrade}
                    onValueChange={(v) => setWillRepeatTrade(v)}
                    className="bg-white p-1.5 rounded-xl shadow-inner border border-blue-200 shrink-0"
                  >
                    <ToggleGroupItem
                      value="Yes"
                      className="rounded-lg px-8 py-3 h-auto font-bold text-base data-[state=on]:bg-blue-600 data-[state=on]:text-white transition-all uppercase tracking-wide"
                    >
                      YES
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="No"
                      className="rounded-lg px-8 py-3 h-auto font-bold text-base data-[state=on]:bg-red-600 data-[state=on]:text-white transition-all uppercase tracking-wide"
                    >
                      NO
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <NotionBlockEditor
                onChange={setContentAfter}
                placeholder="How did the trade play out? Any execution mistakes? Paste the 'after' charts..."
              />
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t p-8 flex justify-end gap-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg" 
            className="text-slate-400 font-black uppercase tracking-widest px-10 hover:text-slate-900 transition-colors"
            onClick={() => onComplete?.()}
          >
            Discard
          </Button>
          <Button
            type="submit"
            size="default"
            disabled={loading}
            className="min-w-[200px] bg-slate-950 hover:bg-black text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
          >
            {loading ? 'ARCHIVING...' : 'ARCHIVE ENTRY'}
          </Button>
        </div>
      </form>

      {/* Friction Dialog */}
      <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <DialogContent className="sm:max-w-[500px] border-none p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <div className="bg-red-600 p-10 flex flex-col items-center gap-6 text-white text-center">
            <div className="bg-white/20 p-5 rounded-full backdrop-blur-md">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter">STAND DOWN</h2>
              <p className="text-red-100 font-bold text-lg">Psychological Fatigue Detected</p>
            </div>
          </div>
          <div className="p-10 space-y-8 bg-white">
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
              Your recent performance data suggests an elevated risk of emotional interference. Continuing to trade in this state may lead to significant drawdown.
            </p>
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="lg" className="w-full text-xl h-18 font-black rounded-2xl border-2" onClick={() => setIsWarningOpen(false)}>I WILL PAUSE</Button>
              <Button variant="destructive" size="lg" className="w-full text-xl h-18 font-black rounded-2xl opacity-30 hover:opacity-100 transition-opacity" onClick={() => executeSubmit()}>OVERRIDE & ARCHIVE</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
