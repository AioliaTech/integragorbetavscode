import { NextRequest, NextResponse } from 'next/server';
import fipeDataRaw from '@/public/fipe-data.json';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    
    // Força conversão para any
    const fipeData: any = fipeDataRaw;
    
    // Tenta acessar brands de várias formas possíveis
    let brands = fipeData.brands || 
                 fipeData.tabelafipe?.brands || 
                 fipeData[0]?.tabelafipe?.brands || 
                 [];
    
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
