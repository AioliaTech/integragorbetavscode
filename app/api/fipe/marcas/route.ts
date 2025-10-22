import { NextRequest, NextResponse } from 'next/server';
import fipeData from '@/public/fipe-data.json';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    
    // Acessa a estrutura correta
    const data: any = fipeData;
    const brands = data.tabelafipe?.brands || data.brands || [];
    
    const marcas = brands
      .filter((b: any) => b.type === tipo)
      .map((b: any) => ({
        brand_code: b.code,
        brand_value: b.name
      }))
      .sort((a: any, b: any) => a.brand_value.localeCompare(b.brand_value));

    return NextResponse.json({ marcas, total: marcas.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, marcas: [] }, { status: 500 });
  }
}
