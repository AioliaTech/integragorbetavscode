import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clienteSlug = formData.get('clienteSlug') as string;

    if (!file || !clienteSlug) {
      return NextResponse.json(
        { error: 'Arquivo e clienteSlug são obrigatórios' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${clienteSlug}/${timestamp}-${randomString}.${fileExt}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload para Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('vehicles')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw error;
    }

    // Obter URL pública
    const { data: publicData } = supabaseAdmin.storage
      .from('vehicles')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      path: fileName
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    );
  }
}
