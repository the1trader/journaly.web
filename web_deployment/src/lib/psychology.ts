
export type PsychologyState = 'FOMO' | 'Fear' | 'Neutral' | 'Calm' | 'Calm & Confident';
export type PsychologyStatus = 'Stand Down' | 'Caution' | 'Trade Allowed';

export interface TradePsychologyData {
    psychology_state: PsychologyState;
    confidence_score: number; // 1-5
    result_rr: number;
}

const PSYCHOLOGY_BIAS: Record<PsychologyState, number> = {
    'FOMO': -2,
    'Fear': -1,
    'Neutral': 0,
    'Calm': 1,
    'Calm & Confident': 2
};

export function calculatePMS(recentTrades: TradePsychologyData[]): number {
    if (recentTrades.length === 0) return 0;

    // Window weights: Most recent = 1.0, Previous = 0.7, Older = 0.4
    // If fewer than 3 trades, adjust accordingly? 
    // The prompt implies a rolling window. Let's assume the passed array IS the window (e.g. 5 trades).
    // We need to order them most recent first.

    let weightedSum = 0;
    let totalWeight = 0;

    recentTrades.forEach((trade, index) => {
        const bias = PSYCHOLOGY_BIAS[trade.psychology_state] || 0;
        const score = bias * (trade.confidence_score || 1);

        let weight = 0.4; // Older
        if (index === 0) weight = 1.0; // Most recent
        else if (index === 1) weight = 0.7; // Previous

        weightedSum += score * weight;
        totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function calculatePPI(recentTrades: TradePsychologyData[], totalProfitRecent: number): number {
    let ppi = 0;
    const recentR = recentTrades.map(t => t.result_rr);
    const netR = recentR.reduce((a, b) => a + b, 0);

    // Loss pressure rules
    // 2 consecutive losses -> +1
    // 3 or more consecutive losses -> +2
    let consecutiveLosses = 0;
    for (const r of recentR) {
        if (r < 0) consecutiveLosses++;
        else break; // Stop counting on first non-loss if iterating from recent
    }

    if (consecutiveLosses >= 3) ppi += 2;
    else if (consecutiveLosses === 2) ppi += 1;

    // Net R <= -2 in recent window -> +2
    if (netR <= -2) ppi += 2;


    // Win pressure (overconfidence risk)
    // 3 consecutive wins -> +1
    let consecutiveWins = 0;
    for (const r of recentR) {
        if (r > 0) consecutiveWins++;
        else break;
    }
    if (consecutiveWins >= 3) ppi += 1;

    // Net R >= +3 -> +2
    if (netR >= 3) ppi += 2;

    // One trade >= 40% of recent total profit -> +1
    // We need to check the monetary PnL for this, but if we only have R, we can use trade R vs Net R if risk unit is constant.
    // Prompt says "One trade >= 40% of recent total profit". Let's assume this refers to R if PnL is not available, or use a simplified check.
    // Ideally we need PnL. For now, we'll assume R implies profit unit.
    // If netR is positive, check if any single trade R is >= 0.4 * netR
    if (netR > 0) {
        const maxWin = Math.max(...recentR);
        if (maxWin >= 0.4 * netR) ppi += 1;
    }

    return Math.min(ppi, 6); // Max 6
}

export function getPsychologyStatus(pms: number, ppi: number): PsychologyStatus {
    const S = pms - (ppi * 0.5);

    if (S <= -3) return 'Stand Down';
    if (S >= 3) return 'Trade Allowed';
    return 'Caution'; // -2 to +2
}

export function getStatusColor(status: PsychologyStatus): string {
    switch (status) {
        case 'Stand Down': return 'text-red-500';
        case 'Caution': return 'text-yellow-500';
        case 'Trade Allowed': return 'text-green-500';
    }
}
