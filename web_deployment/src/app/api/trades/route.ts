import { NextRequest, NextResponse } from 'next/server';
import { createTrade, getTradesByUser } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (!userId) {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId');
    }

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trades = await getTradesByUser(userId);
    return NextResponse.json(trades);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tradeData = await request.json();
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const finalUserId = userId || tradeData.user_id;
    if (!finalUserId) return NextResponse.json({ error: 'User ID required' }, { status: 401 });

    const { data: accounts } = await supabase
      .from('accounts')
      .select('size')
      .eq('id', tradeData.account_id)
      .eq('user_id', finalUserId)
      .single();

    if (!accounts) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const currentBalance = accounts.size;
    const riskAmount = (currentBalance * parseFloat(tradeData.risk_percent)) / 100;
    const pnl = riskAmount * parseFloat(tradeData.result_rr);
    const balanceAfter = currentBalance + pnl;

    const trade = await createTrade({
      ...tradeData,
      user_id: finalUserId,
      risk_amount: riskAmount,
      pnl,
      balance_after: balanceAfter
    });

    await supabase
      .from('accounts')
      .update({ size: balanceAfter, updated_at: new Date().toISOString() })
      .eq('id', tradeData.account_id);

    return NextResponse.json({ success: true, tradeId: trade.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}
