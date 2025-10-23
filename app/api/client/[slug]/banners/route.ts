import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Listar todos os banners do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Buscar cliente
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

    // Buscar banners do cliente ordenados
    const { data: banners, error: bannersError } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('ordem', { ascending: true });

    if (bannersError) throw bannersError;

    return NextResponse.json({
      success: true,
      banners: banners || []
    });
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners' },
      { status: 500 }
    );
  }
}

// POST - Criar novo banner
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { titulo, subtitulo, imagem_url, link_url, ordem, ativo } = body;

    if (!imagem_url) {
      return NextResponse.json(
        { error: 'Imagem é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar cliente
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

    // Criar banner
    const { data: banner, error: bannerError } = await supabaseAdmin
      .from('banners')
      .insert({
        cliente_id: cliente.id,
        titulo: titulo || null,
        subtitulo: subtitulo || null,
        imagem_url,
        link_url: link_url || null,
        ordem: ordem || 0,
        ativo: ativo !== undefined ? ativo : true
      })
      .select()
      .single();

    if (bannerError) throw bannerError;

    return NextResponse.json({
      success: true,
      banner
    });
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    );
  }
}