import { createClient } from '@supabase/supabase-js';

// Cliente público (anon key) - para API pública e leitura
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente admin (service role) - para operações privilegiadas
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Tipos do banco
export interface Cliente {
  id: string;
  nome: string;
  slug: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  cliente_id: string;
  email: string;
  senha_hash: string;
  nome?: string;
  role: 'admin' | 'user';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Veiculo {
  id: string;
  cliente_id: string;
  tipo?: string;
  titulo?: string;
  versao?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  ano_fabricacao?: string;
  km?: string;
  cor?: string;
  combustivel?: string;
  cambio?: string;
  motor?: string;
  portas?: string;
  categoria?: string;
  cilindrada?: string;
  preco?: number;
  opcionais?: string;
  fotos?: string[];
  ativo: boolean;
  destaque: boolean;
  created_at: string;
  updated_at: string;
}
