
export type TemplateType = 'ICT' | 'MANUAL';

export interface ICTStrategyData {
    weekly_bias?: 'Long' | 'Short';
    daily_bias?: 'Long' | 'Short';
    trade_session?: 'Asian' | 'London' | 'NY';
    trade_poi?: '4H' | '1H' | '15m';
    liquidity_type?: 'Swing H/L' | 'Internal H/L' | 'Continuation FVG' | 'No Liq';
    smt_confirmation?: 'YES' | 'NO';
    alignment_score?: number; // 0-8
    alignment_tier?: 'High' | 'Average' | 'Low';
}

export interface Trade {
    id: string;
    user_id: string;
    account_id: string;

    pair: string;
    entry_date: string;
    entry_time: string;
    session: string;
    direction: 'Long' | 'Short';
    result_rr: number;

    risk_percent: number;
    risk_amount: number;
    pnl: number;
    balance_after: number;

    notes_before?: string;
    notes_after?: string;
    screenshot_before_url?: string;
    screenshot_after_url?: string;

    psychology_state?: string;
    confidence_score?: number;

    template_type: TemplateType;
    strategy_data: ICTStrategyData | any;

    created_at: string;
}
