import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PUT - Atualizar veículo
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: veiculo, error } = await supabaseAdmin
      .from('veiculos')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      veiculo,
      message: 'Veículo atualizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar veículo' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar veículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('veiculos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Veículo deletado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar veículo' },
      { status: 500 }
    );
  }
}
