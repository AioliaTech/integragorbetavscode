import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // TESTE 1: Sem range
    console.log('🧪 TESTE 1: Sem range...');
    const { data: data1, error: error1 } = await supabaseClient
      .from('fipe')
      .select('"Brand Code", "Brand Value"')
      .eq('"Type"', 'CAR');

    results.tests.sem_range = {
      success: !error1,
      linhas: data1?.length || 0,
      error: error1?.message || null
    };

    // TESTE 2: Com range(0, 99)
    console.log('🧪 TESTE 2: Com range(0, 99)...');
    const { data: data2, error: error2 } = await supabaseClient
      .from('fipe')
      .select('"Brand Code", "Brand Value"')
      .eq('"Type"', 'CAR')
      .range(0, 99);

    results.tests.range_100 = {
      success: !error2,
      linhas: data2?.length || 0,
      error: error2?.message || null
    };

    // TESTE 3: Com range(0, 999)
    console.log('🧪 TESTE 3: Com range(0, 999)...');
    const { data: data3, error: error3 } = await supabaseClient
      .from('fipe')
      .select('"Brand Code", "Brand Value"')
      .eq('"Type"', 'CAR')
      .range(0, 999);

    results.tests.range_1000 = {
      success: !error3,
      linhas: data3?.length || 0,
      error: error3?.message || null
    };

    // TESTE 4: Com range(0, 9999)
    console.log('🧪 TESTE 4: Com range(0, 9999)...');
    const { data: data4, error: error4 } = await supabaseClient
      .from('fipe')
      .select('"Brand Code", "Brand Value"')
      .eq('"Type"', 'CAR')
      .range(0, 9999);

    results.tests.range_10000 = {
      success: !error4,
      linhas: data4?.length || 0,
      error: error4?.message || null
    };

    // Processar marcas únicas do melhor resultado
    const bestData = data4 || data3 || data2 || data1;
    if (bestData) {
      const marcasSet = new Set(bestData.map((item: any) => item['Brand Code']));
      results.marcas_unicas = marcasSet.size;
      
      // Amostras
      const samples = bestData.slice(0, 10).map((item: any) => ({
        code: item['Brand Code'],
        name: item['Brand Value']
      }));
      results.amostras = samples;
    }

    // RESUMO
    results.resumo = {
      recomendacao: results.tests.range_10000.linhas > 1000 
        ? '✅ Use .range(0, 9999)' 
        : results.tests.range_1000.linhas > 100
        ? '✅ Use .range(0, 999)'
        : '⚠️ Problema no Supabase',
      melhor_resultado: `${results.tests.range_10000.linhas} linhas com range(0, 9999)`
    };

    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error('💥 ERRO:', error);
    return NextResponse.json({
      error: error.message,
      ...results
    }, { status: 500 });
  }
}
