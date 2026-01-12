import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const customValues = await request.json();

    if (!Array.isArray(customValues) || customValues.length === 0) {
      return NextResponse.json({ error: 'Custom values array required' }, { status: 400 });
    }

    // Insert multiple custom values into Supabase
    const valuesToInsert = customValues.map(cv => ({
      trade_id: cv.trade_id,
      field_definition_id: cv.field_definition_id,
      value: cv.value // Supabase handles JSON types automatically if column is jsonb
    }));

    const { error } = await supabase
      .from('trade_custom_values')
      .insert(valuesToInsert);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving custom values:', error);
    return NextResponse.json({ error: 'Failed to save custom values' }, { status: 500 });
  }
}
