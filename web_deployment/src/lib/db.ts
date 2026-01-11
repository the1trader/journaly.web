import { supabase } from './supabase';

/**
 * Database Layer - stores ONLY public URLs (Rule 3)
 */
export async function createTrade(tradeData: any) {
  const {
    user_id,
    account_id,
    pair,
    entry_date,
    entry_time,
    session,
    direction,
    result_rr,
    risk_percent,
    risk_amount,
    pnl,
    balance_after,
    psychology_state,
    confidence_score,
    template_type,
    strategy_data,
    images // Array of strings (public URLs)
  } = tradeData;

  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert([{
      user_id,
      account_id,
      pair,
      entry_date,
      entry_time,
      session,
      direction,
      result_rr,
      risk_percent,
      risk_amount,
      pnl,
      balance_after,
      psychology_state,
      confidence_score,
      template_type,
      strategy_data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (tradeError) throw tradeError;

  if (images && images.length > 0) {
    const imagesToInsert = images.map((url: string) => ({
      trade_id: trade.id,
      user_id,
      image_url: url, // Only the URL is persisted (Rule 3)
      created_at: new Date().toISOString()
    }));

    await supabase.from('journal_images').insert(imagesToInsert);
  }

  return trade;
}

export async function getTradesByUser(userId: string) {
  const { data, error } = await supabase
    .from('trades')
    .select(`*, journal_images (*)`)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
}
