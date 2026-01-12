
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle, XCircle, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

interface Block {
    id: string
    type: 'text' | 'image'
    content: string
}

function ZoomableImage({ src, alt }: { src: string, alt: string }) {
    const [isZoomed, setIsZoomed] = useState(false)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="rounded-lg overflow-hidden border shadow-sm my-4 cursor-zoom-in hover:opacity-95 transition-opacity bg-slate-50 group">
                    <img src={src} alt={alt} className="w-full object-cover max-h-[500px]" />
                    <div className="hidden group-hover:flex justify-center items-center py-2 bg-slate-100/50 text-xs text-slate-500">
                        Click to enlarge
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[98vw] max-h-[98vh] w-auto h-auto p-0 border-none bg-transparent shadow-none outline-none flex items-center justify-center">
                <div className="sr-only">
                    <DialogTitle>Zoomed Image</DialogTitle>
                </div>
                <div
                    className={`relative overflow-hidden ${isZoomed ? 'cursor-zoom-out overflow-auto max-h-[98vh] max-w-[98vw]' : 'cursor-zoom-in flex items-center justify-center'}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsZoomed(!isZoomed)
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className={`transition-all duration-200 ease-in-out block shadow-2xl rounded-sm ${isZoomed ? 'min-w-full min-h-full object-none' : 'max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain'}`}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

function BlockRenderer({ blocks }: { blocks: Block[] } | { blocks: any }) {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return <p className="text-slate-500 italic">No content.</p>

    return (
        <div className="space-y-4">
            {blocks.map((block: Block) => (
                <div key={block.id}>
                    {block.type === 'text' && (
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{block.content}</p>
                    )}
                    {block.type === 'image' && (
                        <ZoomableImage src={block.content} alt="Content" />
                    )}
                </div>
            ))}
        </div>
    )
}

interface TradeDetailProps {
    trade: any
}

export function TradeDetail({ trade }: TradeDetailProps) {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Link href="/journal" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" /> Back to Journal
                        </Link>
                        <span>/</span>
                        <span>Trade Details</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {trade.pair}
                        <Badge variant={trade.direction === 'Long' ? 'default' : 'destructive'} className="text-lg px-3 py-0.5">
                            {trade.direction.toUpperCase()}
                        </Badge>
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span>{format(new Date(trade.entry_date), 'MMMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{trade.session} Session</span>
                        <span>•</span>
                        <span className={trade.result_rr >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {trade.result_rr > 0 ? '+' : ''}{trade.result_rr} R
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="text-right">
                        <div className="text-sm text-slate-500">P&L</div>
                        <div className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notion-like Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (Left 2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Before Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Trade Plan & Setup</h2>
                        </div>

                        <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Rationale & Setup</h3>

                                {/* Fallback to legacy notes if rich content is empty but legacy exists */}
                                {(!trade.content_before || trade.content_before.length === 0) && trade.notes_before ? (
                                    <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
                                        {trade.notes_before}
                                        {trade.screenshot_before_url && (
                                            <ZoomableImage src={trade.screenshot_before_url} alt="Before Entry" />
                                        )}
                                    </div>
                                ) : (
                                    <BlockRenderer blocks={trade.content_before} />
                                )}
                            </div>

                            {/* Reflection: Following Plan */}
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-md border border-slate-100">
                                <div className="text-sm font-medium text-slate-700">Did I follow the exact trade plan?</div>
                                {trade.is_following_plan === true && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Yes, 100%</Badge>}
                                {trade.is_following_plan === false && <Badge variant="destructive">No, deviations</Badge>}
                                {trade.is_following_plan === null && <span className="text-slate-400 italic text-sm">Not recorded</span>}
                            </div>

                            {/* Custom Fields (Render if any) */}
                            {/* We would query trade_custom_values here ideally, but pass it in props for now if available */}
                        </div>

                        {/* Legacy Before Screenshot - removed here, integrated into logic above */}
                    </section>

                    {/* After Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="bg-purple-100 p-1.5 rounded text-purple-600">
                                <Target className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Execution & Review</h2>
                        </div>

                        <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Execution Review</h3>

                                {(!trade.content_after || trade.content_after.length === 0) && trade.notes_after ? (
                                    <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
                                        {trade.notes_after}
                                        {trade.screenshot_after_url && (
                                            <ZoomableImage src={trade.screenshot_after_url} alt="After Exit" />
                                        )}
                                    </div>
                                ) : (
                                    <BlockRenderer blocks={trade.content_after} />
                                )}
                            </div>

                            {/* Reflection: Repeat Trade */}
                            <div className="space-y-2 bg-slate-50 p-4 rounded-md border border-slate-100">
                                <div className="text-sm font-medium text-slate-700">Would you take this kind of trade again?</div>
                                {trade.will_repeat_trade ? (
                                    <p className="text-slate-900 italic">"{trade.will_repeat_trade}"</p>
                                ) : (
                                    <span className="text-slate-400 italic text-sm">Not recorded</span>
                                )}
                            </div>
                        </div>

                        {/* Legacy Screenshot rendering removed - handled by BlockRenderer or Fallback logic above */}
                    </section>
                </div>

                {/* Sidebar Info (Right 1/3) */}
                <div className="space-y-6">
                    {/* Strategy Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base font-medium">Strategy & Template</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Template</span>
                                <Badge variant="outline">{trade.template_type}</Badge>
                            </div>

                            {trade.template_type === 'ICT' && trade.strategy_data && (
                                <div className="space-y-3 pt-2 border-t mt-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-xs text-slate-400 block">Weekly Bias</span>
                                            <span className="font-medium">{trade.strategy_data.weeklyBias}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block">Daily Bias</span>
                                            <span className="font-medium">{trade.strategy_data.dailyBias}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block">POI</span>
                                            <span className="font-medium">{trade.strategy_data.tradePOI}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block">Liquidity</span>
                                            <span className="font-medium">{trade.strategy_data.liqType}</span>
                                        </div>
                                    </div>
                                    {trade.strategy_data.alignment_tier && (
                                        <div className="bg-slate-100 p-2 rounded text-center">
                                            <span className="text-xs text-slate-500">Alignment Quality</span>
                                            <div className={`font-bold ${trade.strategy_data.alignment_tier === 'High' ? 'text-green-600' :
                                                trade.strategy_data.alignment_tier === 'Average' ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                {trade.strategy_data.alignment_tier} ({trade.strategy_data.alignment_score}/8)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Psychology Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base font-medium">Psychology</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <div className="text-xs text-slate-400 mb-1">State</div>
                                <div className="font-medium">{trade.psychology_state || 'Neutral'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-1">Confidence</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-2 w-8 rounded-full ${i <= (trade.confidence_score || 0) ? 'bg-blue-500' : 'bg-slate-100'}`} />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base font-medium">Risk & Return</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-400">Risk %</div>
                                <div className="font-mono">{trade.risk_percent}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Risk Amount</div>
                                <div className="font-mono">${trade.risk_amount?.toFixed(2)}</div>
                            </div>
                            <div className="col-span-2 pt-2 border-t">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-slate-400">Account After</div>
                                        <div className="font-mono text-sm">${trade.balance_after?.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Target(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
