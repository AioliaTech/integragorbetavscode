import { NextRequest, NextResponse } from 'next/server';
import fipeData from '@/public/fipe-data.json';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    const brandCode = request.nextUrl.searchParams.get('brand_code');

    if (!brandCode) {
      return NextResponse.json({ error: 'brand_code obrigatório', modelos: [] }, { status: 400 });
    }

    const brand = fipeData.brands.find(
      (b: any) => b.type === tipo && b.code === parseInt(brandCode)
    );

    if (!brand) {
      return NextResponse.json({ modelos: [], total: 0 });
    }

    const modelos = brand.models
      .map((m: any) => m.name)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ modelos, total: modelos.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, modelos: [] }, { status: 500 });
  }
}
