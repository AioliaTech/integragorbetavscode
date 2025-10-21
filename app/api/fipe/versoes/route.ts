import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    const brandCode = request.nextUrl.searchParams.get('brand_code');
    const modelo = request.nextUrl.searchParams.get('modelo');

    let query = supabaseClient
      .from('fipe_versoes_unicas')
      .select('version, categoria, combustivel')
      .eq('type', tipo);

    if (brandCode) query = query.eq('brand_code', parseInt(brandCode));
    if (modelo) query = query.eq('model_name', modelo);

    const { data, error } = await query.order('version');

    if (error) throw error;

    const versoes = data.map(item => ({
      versao: item.version,
      categoria: item.categoria,
      combustivel: item.combustivel
    }));

    return NextResponse.json({ versoes, total: versoes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, versoes: [] }, { status: 500 });
  }
}
