import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .select('id, nome, slug, endereco, horario_atendimento, whatsapp, logo_url, email_contato, instagram_url, facebook_url, linkedin_url, youtube_url')
      .eq('slug', slug)
      .single();

    if (error || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      configuracoes: {
        endereco: cliente.endereco || '',
        horario_atendimento: cliente.horario_atendimento || '',
        whatsapp: cliente.whatsapp || '',
        logo_url: cliente.logo_url || '',
        email_contato: cliente.email_contato || '',
        instagram_url: cliente.instagram_url || '',
        facebook_url: cliente.facebook_url || '',
        linkedin_url: cliente.linkedin_url || '',
        youtube_url: cliente.youtube_url || ''
      }
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const {
      endereco,
      horario_atendimento,
      whatsapp,
      logo_url,
      email_contato,
      instagram_url,
      facebook_url,
      linkedin_url,
      youtube_url
    } = body;

    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .update({
        endereco,
        horario_atendimento,
        whatsapp,
        logo_url,
        email_contato,
        instagram_url,
        facebook_url,
        linkedin_url,
        youtube_url
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
