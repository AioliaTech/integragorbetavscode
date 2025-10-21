import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';

    const { data, error } = await supabaseClient
      .from('fipe_marcas_unicas')
      .select('brand_code, brand_value')
      .eq('type', tipo)
      .order('brand_value');

    if (error) throw error;

    const marcas = data.map(item => ({
      brand_code: item.brand_code,
      brand_value: item.brand_value
    }));

    return NextResponse.json({ marcas, total: marcas.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, marcas: [] }, { status: 500 });
  }
}
