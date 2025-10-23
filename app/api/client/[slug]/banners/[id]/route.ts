import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PUT - Atualizar banner
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params;
    const body = await request.json();
    const { titulo, subtitulo, imagem_url, link_url, ordem, ativo } = body;

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

    // Atualizar banner (verificando se pertence ao cliente)
    const { data: banner, error: bannerError } = await supabaseAdmin
      .from('banners')
      .update({
        titulo: titulo !== undefined ? titulo : null,
        subtitulo: subtitulo !== undefined ? subtitulo : null,
        imagem_url: imagem_url || undefined,
        link_url: link_url !== undefined ? link_url : null,
        ordem: ordem !== undefined ? ordem : undefined,
        ativo: ativo !== undefined ? ativo : undefined
      })
      .eq('id', id)
      .eq('cliente_id', cliente.id)
      .select()
      .single();

    if (bannerError) {
      if (bannerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Banner não encontrado' },
          { status: 404 }
        );
      }
      throw bannerError;
    }

    return NextResponse.json({
      success: true,
      banner
    });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar banner' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params;

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

    // Deletar banner (verificando se pertence ao cliente)
    const { error: deleteError } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id)
      .eq('cliente_id', cliente.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Banner deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar banner' },
      { status: 500 }
    );
  }
}