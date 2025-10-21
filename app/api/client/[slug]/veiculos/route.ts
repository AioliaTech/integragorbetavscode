import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('id, nome, slug')
      .eq('slug', slug)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const { data: veiculos, error: veiculosError } = await supabaseAdmin
      .from('veiculos')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false });

    if (veiculosError) throw veiculosError;

    return NextResponse.json({
      cliente,
      veiculos: veiculos || []
    });

  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar veículos' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Remover o ID do body para deixar o Supabase gerar
    const { id, ...veiculoData } = body;

    // Garantir que fotos seja um array válido
    const fotos = Array.isArray(veiculoData.fotos) ? veiculoData.fotos : [];

    const { data: veiculo, error: veiculoError } = await supabaseAdmin
      .from('veiculos')
      .insert({
        cliente_id: cliente.id,
        ...veiculoData,
        fotos
      })
      .select()
      .single();

    if (veiculoError) {
      console.error('Erro do Supabase:', veiculoError);
      throw veiculoError;
    }

    return NextResponse.json({
      success: true,
      veiculo,
      message: 'Veículo cadastrado com sucesso!'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar veículo' },
      { status: 500 }
    );
  }
}
