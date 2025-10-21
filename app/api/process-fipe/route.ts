import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function separarModeloVersao(modelValue: string) {
  const palavras = modelValue.trim().split(/\s+/);
  const modeloParts = [palavras[0]];
  
  for (let i = 1; i < palavras.length; i++) {
    if (/^\d+$/.test(palavras[i])) modeloParts.push(palavras[i]);
    else break;
  }
  
  return {
    modelo: modeloParts.join(' '),
    versao: palavras.slice(modeloParts.length).join(' ') || null
  };
}

function extrairDados(versao: string) {
  const u = versao.toUpperCase();
  let categoria = null, combustivel = null;
  
  if (u.includes('SUV')) categoria = 'SUV';
  else if (u.includes('SEDAN')) categoria = 'Sedan';
  else if (u.includes('HATCH')) categoria = 'Hatch';
  else if (u.includes('PICKUP')) categoria = 'Caminhonete';
  
  if (u.includes('FLEX')) combustivel = 'Flex';
  else if (u.includes('DIESEL')) combustivel = 'Diesel';
  else if (u.includes('GASOLINA') || u.includes('GAS.')) combustivel = 'Gasolina';
  else if (u.includes('ELETRICO') || u.includes('ELÉTRICO')) combustivel = 'Elétrico';
  
  return { categoria, combustivel };
}

async function processarTipo(tipo: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 PROCESSANDO ${tipo}`);
  console.log('='.repeat(60));
  
  // Buscar dados
  let allData: any[] = [];
  let page = 0;
  const pageSize = 5000;
  
  while (true) {
    const { data, error, count } = await supabase
      .from('fipe')
      .select('"Brand Code", "Brand Value", "Model Value"', { count: 'exact' })
      .eq('"Type"', tipo)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error(`❌ ERRO ao buscar dados:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) break;
    
    allData.push(...data);
    console.log(`📄 Página ${page + 1}: ${data.length} registros | Total: ${allData.length}/${count || '?'}`);
    
    if (data.length < pageSize) break;
    page++;
  }
  
  if (allData.length === 0) {
    console.log(`⚠️ Nenhum dado encontrado para ${tipo}`);
    return { tipo, processado: 0 };
  }
  
  console.log(`\n✅ TOTAL LIDO: ${allData.length} linhas\n`);
  
  // Processar
  const marcasMap = new Map();
  const modelosMap = new Map();
  const versoesMap = new Map();
  
  allData.forEach(item => {
    const code = item['Brand Code'];
    let brand = item['Brand Value'];
    
    if (!code || !brand) return;
    
    brand = brand.replace(/^GM - /i, '').replace(/^FIAT - /i, '').replace(/^VW - /i, '');
    
    if (!marcasMap.has(code)) {
      marcasMap.set(code, { 
        type: tipo, 
        brand_code: String(code), 
        brand_value: brand 
      });
    }
    
    const { modelo, versao } = separarModeloVersao(item['Model Value']);
    const modeloKey = `${code}-${modelo}`;
    
    if (!modelosMap.has(modeloKey)) {
      modelosMap.set(modeloKey, { 
        type: tipo, 
        brand_code: String(code), 
        model_name: modelo 
      });
    }
    
    if (versao) {
      const versaoKey = `${code}-${modelo}-${versao}`;
      if (!versoesMap.has(versaoKey)) {
        const { categoria, combustivel } = extrairDados(versao);
        versoesMap.set(versaoKey, {
          type: tipo,
          brand_code: String(code),
          model_name: modelo,
          version: versao,
          categoria,
          combustivel
        });
      }
    }
  });
  
  console.log(`📊 ESTATÍSTICAS:`);
  console.log(`   - Marcas únicas: ${marcasMap.size}`);
  console.log(`   - Modelos únicos: ${modelosMap.size}`);
  console.log(`   - Versões únicas: ${versoesMap.size}\n`);
  
  // ===== INSERIR MARCAS =====
  const marcas = Array.from(marcasMap.values());
  if (marcas.length > 0) {
    console.log(`📤 INSERINDO ${marcas.length} MARCAS...`);
    
    const { error: insertError } = await supabase
      .from('fipe_marcas_unicas')
      .upsert(marcas, { 
        onConflict: 'type,brand_code',
        ignoreDuplicates: false 
      });
    
    if (insertError) {
      console.error(`❌ ERRO AO INSERIR MARCAS:`, insertError);
      throw insertError;
    }
    
    console.log(`✅ MARCAS INSERIDAS`);
  }
  
  // ===== INSERIR MODELOS =====
  const modelos = Array.from(modelosMap.values());
  if (modelos.length > 0) {
    console.log(`\n📤 INSERINDO ${modelos.length} MODELOS (em lotes de 1000)...`);
    
    for (let i = 0; i < modelos.length; i += 1000) {
      const batch = modelos.slice(i, i + 1000);
      
      const { error } = await supabase
        .from('fipe_modelos_unicos')
        .upsert(batch, { 
          onConflict: 'type,brand_code,model_name',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ ERRO lote ${i}-${i + 1000}:`, error.message);
        throw error;
      }
      
      console.log(`   ✅ Lote ${i}-${i + batch.length} inserido`);
    }
  }
  
  // ===== INSERIR VERSÕES =====
  const versoes = Array.from(versoesMap.values());
  if (versoes.length > 0) {
    console.log(`\n📤 INSERINDO ${versoes.length} VERSÕES (em lotes de 500)...`);
    
    for (let i = 0; i < versoes.length; i += 500) {
      const batch = versoes.slice(i, i + 500);
      
      const { error } = await supabase
        .from('fipe_versoes_unicas')
        .upsert(batch, { 
          onConflict: 'type,brand_code,model_name,version',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ ERRO lote ${i}-${i + 500}:`, error.message);
        throw error;
      }
      
      console.log(`   ✅ Lote ${i}-${i + batch.length} inserido`);
    }
  }
  
  console.log(`\n🎉 ${tipo} CONCLUÍDO!\n`);
  
  return {
    tipo,
    processado: allData.length,
    marcas: marcas.length,
    modelos: modelos.length,
    versoes: versoes.length
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL não configurada' },
        { status: 500 }
      );
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' },
        { status: 500 }
      );
    }
    
    console.log('🚀 INICIANDO PROCESSAMENTO FIPE\n');
    
    const tipos = ['CAR', 'MOTORCYCLE', 'TRUCK'];
    const resultados = [];
    
    for (const tipo of tipos) {
      const resultado = await processarTipo(tipo);
      resultados.push(resultado);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅✅✅ PROCESSAMENTO COMPLETO ✅✅✅');
    console.log('='.repeat(60));
    
    return NextResponse.json({
      success: true,
      message: 'Processamento FIPE concluído com sucesso',
      resultados
    });
    
  } catch (error: any) {
    console.error('❌ ERRO NO PROCESSAMENTO:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar FIPE',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para iniciar o processamento FIPE',
    endpoint: '/api/process-fipe',
    method: 'POST'
  });
}