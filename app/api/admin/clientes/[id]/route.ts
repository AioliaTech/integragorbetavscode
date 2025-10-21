import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nome, slug, email, telefone, senha } = body;

    const updateData: any = {
      nome,
      slug: slug.toLowerCase(),
      email,
      telefone: telefone || null
    };

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (clienteError) throw clienteError;

    if (senha && senha.trim() !== '') {
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const { error: usuarioError } = await supabaseAdmin
        .from('usuarios')
        .update({ senha_hash: senhaHash, email, nome })
        .eq('cliente_id', id)
        .eq('role', 'admin');

      if (usuarioError) throw usuarioError;
    }

    return NextResponse.json({
      success: true,
      cliente
    });

  } catch (error) {
    console.error('Erro ao atualizar:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}
