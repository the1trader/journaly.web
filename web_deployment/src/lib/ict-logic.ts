
interface IctValues {
    weeklyBias: string;
    dailyBias: string;
    tradeSession: string;
    tradePOI: string;
    htfPOI: string;
    liqType: string;
    smtConfirmation: string;
}

export function calculateICTAlignmentScore(
    ict: IctValues,
    tradeDirection: string // 'Long' | 'Short'
): { score: number; tier: 'High' | 'Average' | 'Low' } {
    let score = 0;

    // 1. Weekly bias matches trade direction (+2)
    if (ict.weeklyBias.toUpperCase() === tradeDirection.toUpperCase()) {
        score += 2;
    }

    // 2. Daily bias matches trade direction (+2)
    if (ict.dailyBias.toUpperCase() === tradeDirection.toUpperCase()) {
        score += 2;
    }

    // 3. Trade session = London or NY (+1)
    const session = ict.tradeSession.toUpperCase();
    if (session === 'LONDON' || session === 'NY' || session === 'NEW YORK') {
        score += 1;
    }

    // 4. Trade POI = 4H or 1H (+1)
    const poi = ict.tradePOI.toUpperCase();
    if (poi === '4H' || poi === '1H') {
        score += 1;
    }

    // 5. HTF POI ≠ null (+1)
    if (ict.htfPOI) {
        score += 1;
    }

    // 6. Liquidity type ≠ "No Liq" (+1)
    if (ict.liqType !== 'No Liq') {
        score += 1;
    }

    // 7. SMT confirmation = YES (+1)
    if (ict.smtConfirmation.toUpperCase() === 'YES') {
        score += 1;
    }

    let tier: 'High' | 'Average' | 'Low' = 'Low';
    if (score >= 8) tier = 'High';
    else if (score >= 5) tier = 'Average';
    else tier = 'Low';

    return { score, tier };
}
