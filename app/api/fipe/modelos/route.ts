import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    const brandCode = request.nextUrl.searchParams.get('brand_code');

    if (!brandCode) {
      return NextResponse.json({ error: 'brand_code obrigatório', modelos: [] }, { status: 400 });
    }

    const { data, error } = await supabaseClient
      .from('fipe_modelos_unicos')
      .select('model_name')
      .eq('type', tipo)
      .eq('brand_code', parseInt(brandCode))
      .order('model_name');

    if (error) throw error;

    const modelos = data.map(item => item.model_name);

    return NextResponse.json({ modelos, total: modelos.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, modelos: [] }, { status: 500 });
  }
}
