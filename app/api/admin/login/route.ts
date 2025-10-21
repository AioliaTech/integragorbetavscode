import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '123';

    if (email === adminEmail && senha === adminPassword) {
      const token = jwt.sign(
        { admin: true, email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token
      });
    } else {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
