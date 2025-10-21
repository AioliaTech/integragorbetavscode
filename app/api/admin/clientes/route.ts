import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const { data: clientes, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ clientes });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, slug, email, telefone, senha } = body;

    if (!nome || !slug || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, slug, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const { data: existingSlug } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug já está em uso' },
        { status: 400 }
      );
    }

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .insert({
        nome,
        slug: slug.toLowerCase(),
        email,
        telefone: telefone || null,
        ativo: true
      })
      .select()
      .single();

    if (clienteError) {
      console.error('Erro ao criar cliente:', clienteError);
      throw clienteError;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        cliente_id: cliente.id,
        email,
        senha_hash: senhaHash,
        nome,
        role: 'admin',
        ativo: true
      });

    if (usuarioError) {
      console.error('Erro ao criar usuário:', usuarioError);
      throw usuarioError;
    }

    return NextResponse.json({
      success: true,
      cliente,
      message: 'Cliente criado com sucesso!'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}
