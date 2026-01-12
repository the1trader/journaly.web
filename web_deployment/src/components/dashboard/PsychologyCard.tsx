'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PsychologyStatus } from '@/lib/psychology'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface PsychologyCardProps {
    pms: number
    ppi: number
    status: PsychologyStatus
}

export function PsychologyCard({ pms, ppi, status }: PsychologyCardProps) {
    let pressureLevel = 'Low'
    if (ppi >= 4) pressureLevel = 'High'
    else if (ppi >= 2) pressureLevel = 'Elevated'

    const pmsFormatted = pms.toFixed(1)

    return (
        <Card className="h-full border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Psychology Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold flex items-center gap-2">
                                {status}
                                {status === 'Trade Allowed' && <span className="text-green-500 text-lg">✅</span>}
                                {status === 'Caution' && <span className="text-yellow-500 text-lg">⚠️</span>}
                                {status === 'Stand Down' && <span className="text-red-500 text-lg">❌</span>}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {status === 'Stand Down' && "Recent results increase psychological pressure. Error risk is elevated."}
                                {status === 'Caution' && "Moderate psychological pressure detected. Proceed with focused attention."}
                                {status === 'Trade Allowed' && "Psychological state is optimal for trading execution."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Momentum (PMS)</div>
                            <div className="text-xl font-semibold flex items-center gap-2">
                                {pmsFormatted}
                                {pms > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : pms < 0 ? <ArrowDownRight className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-slate-400" />}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Pressure (Result-Based)</div>
                            <div className={`text-xl font-semibold ${ppi >= 4 ? 'text-red-600' : ppi >= 2 ? 'text-yellow-600' : 'text-slate-700'}`}>
                                {pressureLevel} <span className="text-xs font-normal text-slate-400">({ppi})</span>
                            </div>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}
