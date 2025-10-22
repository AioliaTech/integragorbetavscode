import { NextRequest, NextResponse } from 'next/server';
import fipeData from '@/public/fipe-data.json';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    
    const marcas = fipeData.brands
      .filter((b: any) => b.type === tipo)
      .map((b: any) => ({
        brand_code: b.code,
        brand_value: b.name
      }))
      .sort((a, b) => a.brand_value.localeCompare(b.brand_value));

    return NextResponse.json({ marcas, total: marcas.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, marcas: [] }, { status: 500 });
  }
}
