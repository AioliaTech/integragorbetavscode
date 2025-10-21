import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        email,
        nome,
        senha_hash,
        ativo,
        cliente_id,
        clientes (
          id,
          nome,
          slug,
          ativo
        )
      `)
      .eq('email', email)
      .eq('ativo', true)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const cliente = usuario.clientes as any;
    if (!cliente || !cliente.ativo) {
      return NextResponse.json(
        { error: 'Cliente inativo' },
        { status: 403 }
      );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        clienteId: cliente.id,
        slug: cliente.slug,
        email: usuario.email
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      slug: cliente.slug,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        slug: cliente.slug
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
