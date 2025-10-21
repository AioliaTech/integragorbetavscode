import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteSlug: string } }
) {
  try {
    const { clienteSlug } = params;

    // Buscar cliente pelo slug
    const { data: cliente, error: clienteError } = await supabaseClient
      .from('clientes')
      .select('id, nome, slug, ativo')
      .eq('slug', clienteSlug)
      .eq('ativo', true)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Buscar veículos do cliente
    const { data: veiculos, error: veiculosError } = await supabaseClient
      .from('veiculos')
      .select('*')
      .eq('cliente_id', cliente.id)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (veiculosError) {
      console.error('Erro ao buscar veículos:', veiculosError);
      return NextResponse.json(
        { error: 'Erro ao buscar veículos' },
        { status: 500 }
      );
    }

    // Retornar dados no formato solicitado
    return NextResponse.json({
      cliente: {
        nome: cliente.nome,
        slug: cliente.slug
      },
      total: veiculos?.length || 0,
      veiculos: veiculos || []
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Permitir CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
