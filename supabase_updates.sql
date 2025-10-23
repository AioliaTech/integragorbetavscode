-- =====================================================
-- SCRIPT DE ATUALIZAÇÃO DO BANCO DE DADOS - SUPABASE
-- =====================================================
-- Este arquivo contém todas as alterações necessárias
-- para adicionar os novos recursos ao sistema
-- =====================================================

-- 1. Adicionar novos campos na tabela 'clientes'
-- =====================================================

-- Logo da empresa (URL da imagem)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Email de contato
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email_contato TEXT;

-- Redes sociais
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 2. Criar tabela para gerenciar banners do carrossel
-- =====================================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  titulo TEXT,
  subtitulo TEXT,
  imagem_url TEXT NOT NULL,
  link_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_banners_cliente_id ON banners(cliente_id);
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON banners(ativo);
CREATE INDEX IF NOT EXISTS idx_banners_ordem ON banners(ordem);

-- Adicionar comentários nas colunas
COMMENT ON COLUMN banners.titulo IS 'Título do banner (opcional)';
COMMENT ON COLUMN banners.subtitulo IS 'Subtítulo do banner (opcional)';
COMMENT ON COLUMN banners.imagem_url IS 'URL da imagem do banner';
COMMENT ON COLUMN banners.link_url IS 'URL de redirecionamento ao clicar (opcional)';
COMMENT ON COLUMN banners.ordem IS 'Ordem de exibição do banner (menor = primeiro)';
COMMENT ON COLUMN banners.ativo IS 'Se o banner está ativo e deve ser exibido';

-- 3. Criar função para atualizar updated_at automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar triggers para atualizar updated_at
-- =====================================================

-- Trigger para tabela banners
DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela clientes (se ainda não existir)
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Configurar políticas de segurança RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS na tabela banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública dos banners ativos
CREATE POLICY "Banners ativos são visíveis publicamente"
ON banners FOR SELECT
USING (ativo = true);

-- Política para administradores gerenciarem banners
-- (Ajustar conforme sua autenticação)
CREATE POLICY "Administradores podem gerenciar banners"
ON banners FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Criar bucket de storage para logos e banners (se não existir)
-- =====================================================
-- NOTA: Execute estes comandos diretamente no painel do Supabase:
-- 
-- 1. Vá em Storage > Create a new bucket
-- 2. Nome: "logos"
-- 3. Public: true
-- 
-- 1. Vá em Storage > Create a new bucket
-- 2. Nome: "banners"
-- 3. Public: true

-- 7. Adicionar comentários nas novas colunas da tabela clientes
-- =====================================================

COMMENT ON COLUMN clientes.logo_url IS 'URL do logo/logotipo da empresa';
COMMENT ON COLUMN clientes.email_contato IS 'Email de contato público da empresa';
COMMENT ON COLUMN clientes.instagram_url IS 'URL do perfil no Instagram';
COMMENT ON COLUMN clientes.facebook_url IS 'URL da página no Facebook';
COMMENT ON COLUMN clientes.linkedin_url IS 'URL do perfil no LinkedIn';
COMMENT ON COLUMN clientes.youtube_url IS 'URL do canal no YouTube';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Copie este arquivo
-- 2. Acesse o Supabase Dashboard > SQL Editor
-- 3. Cole o conteúdo e execute
-- 4. Crie os buckets "logos" e "banners" manualmente em Storage
-- 5. Configure os buckets como públicos