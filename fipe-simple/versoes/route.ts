import { NextRequest, NextResponse } from 'next/server';
import fipeData from '@/public/fipe-data.json';

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo')?.toUpperCase() || 'CAR';
    const brandCode = request.nextUrl.searchParams.get('brand_code');
    const modeloNome = request.nextUrl.searchParams.get('modelo');

    const brand = fipeData.brands.find(
      (b: any) => b.type === tipo && b.code === parseInt(brandCode || '0')
    );

    if (!brand) {
      return NextResponse.json({ versoes: [], total: 0 });
    }

    const model = brand.models.find((m: any) => m.name === modeloNome);

    if (!model) {
      return NextResponse.json({ versoes: [], total: 0 });
    }

    const versoes = model.versions
      .map((v: string) => ({
        versao: v,
        categoria: null,
        combustivel: null
      }))
      .sort((a: any, b: any) => a.versao.localeCompare(b.versao));

    return NextResponse.json({ versoes, total: versoes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, versoes: [] }, { status: 500 });
  }
}
